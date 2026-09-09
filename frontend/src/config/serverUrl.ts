import AsyncStorage from "@react-native-async-storage/async-storage";
import { NativeModules } from "react-native";
import * as Network from "expo-network";

const CACHE_KEY = "sb_resolved_server";
const PROBE_TIMEOUT = 2000;
const SCAN_CONCURRENCY = 30;
const SCAN_TIMEOUT_MS = 1400;

const ENV_API = process.env.EXPO_PUBLIC_API_URL;
const ENV_SOCKET = process.env.EXPO_PUBLIC_SOCKET_URL;
const DEFAULT_PORT = 5000;

type ServerUrls = { apiUrl: string; socketUrl: string };

function buildUrls(host: string, port: number): ServerUrls {
  return {
    apiUrl: `http://${host}:${port}/api`,
    socketUrl: `http://${host}:${port}`,
  };
}

function getDevHost(): string | null {
  try {
    const scriptURL = NativeModules?.SourceCode?.scriptURL;
    if (!scriptURL) return null;
    const match = scriptURL.match(/^https?:\/\/([^:/]+)/);
    return match ? match[1] : null;
  } catch {
    return null;
  }
}

function hostFromUrl(url?: string | null): string | null {
  if (!url) return null;
  const match = url.match(/^https?:\/\/([^:/]+)/);
  return match ? match[1] : null;
}

function portFromUrl(url?: string | null): number | null {
  if (!url) return null;
  const match = url.match(/^https?:\/\/[^/:]+:(\d+)/);
  return match ? Number(match[1]) : null;
}

async function getPhoneIp(): Promise<string | null> {
  try {
    const ip = await Network.getIpAddressAsync();
    if (ip && /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(ip)) return ip;
    return null;
  } catch {
    return null;
  }
}

async function probe(url: string, timeout = PROBE_TIMEOUT): Promise<boolean> {
  try {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), timeout);
    await fetch(url, { method: "GET", signal: ctrl.signal });
    clearTimeout(timer);
    return true;
  } catch {
    return false;
  }
}

function enumerateSubnet(seedIp: string): string[] {
  const match = seedIp.match(/^(\d{1,3}\.\d{1,3}\.\d{1,3})\.(\d{1,3})$/);
  if (!match) return [];
  const base = match[1];
  const skip = Number(match[2]);
  const hosts: string[] = [];
  for (let i = 1; i <= 254; i++) {
    if (i !== skip) hosts.push(`${base}.${i}`);
  }
  return hosts;
}

async function scanForBackend(seedIps: string[], ports: number[]): Promise<ServerUrls | null> {
  const seen = new Set<string>();
  const targets: string[] = [];
  for (const seed of seedIps) {
    if (!seed) continue;
    for (const ip of enumerateSubnet(seed)) {
      if (!seen.has(ip)) {
        seen.add(ip);
        targets.push(ip);
      }
    }
  }
  if (targets.length === 0 || ports.length === 0) return null;

  console.log(`[serverUrl] backend not found, scanning ${targets.length} hosts on ports ${ports.join(",")}`);
  let stopped = false;
  let next = 0;
  const workerCount = Math.min(SCAN_CONCURRENCY, targets.length);
  let pending = workerCount;

  return new Promise<ServerUrls | null>((resolvePromise) => {
    const finish = () => {
      pending -= 1;
      if (pending <= 0) resolvePromise(null);
    };

    async function worker() {
      while (!stopped && next < targets.length) {
        const ip = targets[next++];
        for (const port of ports) {
          if (stopped) return;
          const urls = buildUrls(ip, port);
          if (await probe(urls.apiUrl, SCAN_TIMEOUT_MS)) {
            stopped = true;
            resolvePromise(urls);
            return;
          }
        }
      }
      finish();
    }

    for (let i = 0; i < workerCount; i++) worker();
  });
}

async function resolve(): Promise<ServerUrls & { found: boolean }> {
  const devHost = getDevHost();
  const envHost = hostFromUrl(ENV_API);
  let port = portFromUrl(ENV_API) ?? DEFAULT_PORT;

  const candidates: ServerUrls[] = [];

  if (devHost) candidates.push(buildUrls(devHost, port));
  if (envHost) candidates.push(buildUrls(envHost, port));

  let cached: ServerUrls | null = null;
  try {
    const raw = await AsyncStorage.getItem(CACHE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.apiUrl && parsed.socketUrl) {
        cached = parsed as ServerUrls;
        candidates.push(cached);
      }
    }
  } catch {}

  const results = await Promise.all(candidates.map(async (c) => ({ urls: c, reachable: await probe(c.apiUrl) })));
  const winner = results.find((r) => r.reachable);
  if (winner) {
    AsyncStorage.setItem(CACHE_KEY, JSON.stringify(winner.urls)).catch(() => {});
    return { ...winner.urls, found: true };
  }

  const phoneIp = await getPhoneIp();
  const ports = Array.from(new Set([port, DEFAULT_PORT]));
  const scanUrl = await scanForBackend([phoneIp, devHost, envHost, cached ? hostFromUrl(cached.apiUrl) : null].filter(Boolean) as string[], ports);

  if (scanUrl) {
    AsyncStorage.setItem(CACHE_KEY, JSON.stringify(scanUrl)).catch(() => {});
    return { ...scanUrl, found: true };
  }

  if (devHost) {
    return { ...buildUrls(devHost, port), found: false };
  }

  return {
    apiUrl: ENV_API ?? `http://localhost:${DEFAULT_PORT}/api`,
    socketUrl: ENV_SOCKET ?? `http://localhost:${DEFAULT_PORT}`,
    found: false,
  };
}

let _promise: Promise<ServerUrls> | null = null;

export function getServerUrls(): Promise<ServerUrls> {
  if (!_promise) {
    _promise = resolve().then((r) => {
      if (!r.found) _promise = null;
      return { apiUrl: r.apiUrl, socketUrl: r.socketUrl };
    });
  }
  return _promise;
}

export function resetServerUrls(): void {
  _promise = null;
  AsyncStorage.removeItem(CACHE_KEY).catch(() => {});
}