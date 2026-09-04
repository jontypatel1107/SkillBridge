import { env } from "../config/env";

function requireApiKey(): string {
  if (!env.daily.apiKey) {
    throw new Error(
      "DAILY_API_KEY is not set. Add it to your .env to enable video meetings."
    );
  }
  return env.daily.apiKey;
}

interface DailyCreateRoomParams {
  name?: string;
  privacy?: "public" | "private";
  properties?: {
    exp?: number;
    enable_prejoin_ui?: boolean;
    autojoin?: boolean;
    [key: string]: unknown;
  };
}

interface DailyRoomResponse {
  id: string;
  name: string;
  url: string;
  token?: string;
}

// Creates a Daily.co room and returns its URL. Optionally returns an expiry
// scoped meeting token when `authenticated` is true.
export async function createDailyRoom(
  name: string,
  opts: { durationMinutes?: number; authenticated?: boolean } = {}
): Promise<{ url: string; name: string; token?: string }> {
  const apiKey = requireApiKey();

  const body: DailyCreateRoomParams = {
    name,
    privacy: opts.authenticated ? "private" : "public",
    properties: {},
  };

  if (opts.durationMinutes) {
    body.properties!.exp = Math.floor(
      (Date.now() + opts.durationMinutes * 60_000) / 1000
    );
  }
  if (opts.authenticated) {
    body.properties!.enable_prejoin_ui = true;
  }

  const response = await fetch(`${env.daily.baseUrl}/rooms`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Daily.co API error (${response.status}): ${errText}`);
  }

  const data = (await response.json()) as DailyRoomResponse;
  return { url: data.url, name: data.name, token: data.token };
}

// Finds an existing room by name (used to reuse a persistent room per
// conversation instead of creating a new one on every tap).
export async function getDailyRoom(name: string): Promise<DailyRoomResponse | null> {
  const apiKey = requireApiKey();

  const response = await fetch(
    `${env.daily.baseUrl}/rooms/${encodeURIComponent(name)}`,
    { headers: { Authorization: `Bearer ${apiKey}` } }
  );

  if (response.status === 404) return null;
  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Daily.co API error (${response.status}): ${errText}`);
  }

  return (await response.json()) as DailyRoomResponse;
}
