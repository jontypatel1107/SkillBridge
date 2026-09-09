import { createApi, fetchBaseQuery, BaseQueryFn, FetchArgs, FetchBaseQueryError } from "@reduxjs/toolkit/query/react";
import { tokenStorage } from "@/utils/tokenStorage";
import { AuthResponse } from "@/types";
import { setUnauthenticated } from "@/redux/slices/authSlice";
import { getServerUrls, resetServerUrls } from "@/config/serverUrl";
import { refreshSocketToken } from "@/services/socket";

const MAX_RETRIES = 3;
const RETRY_BASE_DELAY = 1000;
const FETCH_TIMEOUT_MS = 8000;
const ACCESS_TOKEN_TTL_MS = 15 * 60 * 1000;
const REFRESH_BUFFER_MS = 60 * 1000;

let refreshPromise: Promise<string | null> | null = null;
let refreshTimer: ReturnType<typeof setTimeout> | null = null;

function scheduleTokenRefresh(dispatch: (action: any) => void) {
  if (refreshTimer) clearTimeout(refreshTimer);
  refreshTimer = setTimeout(async () => {
    const refreshToken = await tokenStorage.getRefreshToken();
    if (!refreshToken) return;
    try {
      await doRefresh(refreshToken, dispatch);
    } catch {
      await tokenStorage.clear();
      dispatch(setUnauthenticated());
    }
  }, ACCESS_TOKEN_TTL_MS - REFRESH_BUFFER_MS);
}

async function doRefresh(refreshToken: string, dispatch?: (action: any) => void): Promise<string | null> {
  if (refreshPromise) return refreshPromise;

  refreshPromise = (async () => {
    try {
      const { apiUrl } = await getServerUrls();
      const res = await fetch(`${apiUrl}/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
      });
      if (!res.ok) return null;
      const json = await res.json();
      const data = json.data as { accessToken: string; refreshToken: string } | undefined;
      if (data?.accessToken) {
        await tokenStorage.setTokens(data.accessToken, data.refreshToken);
        scheduleTokenRefresh(dispatch!);
        refreshSocketToken();
        return data.accessToken;
      }
      return null;
    } catch {
      return null;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

export function startAuthTimer(dispatch: (action: any) => void) {
  scheduleTokenRefresh(dispatch);
}

export function stopAuthTimer() {
  if (refreshTimer) {
    clearTimeout(refreshTimer);
    refreshTimer = null;
  }
}

const dynamicBaseQuery: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = async (
  args,
  api,
  extraOptions
) => {
  const { apiUrl } = await getServerUrls();

  const timeoutController = new AbortController();
  const timer = setTimeout(() => timeoutController.abort(), FETCH_TIMEOUT_MS);

  const baseQuery = fetchBaseQuery({
    baseUrl: apiUrl,
    prepareHeaders: async (headers) => {
      const token = await tokenStorage.getAccessToken();
      if (token) headers.set("authorization", `Bearer ${token}`);
      return headers;
    },
  });

  const mergedArgs =
    typeof args === "string" ? args : { ...args, signal: timeoutController.signal };

  try {
    return await baseQuery(mergedArgs as any, api, extraOptions);
  } finally {
    clearTimeout(timer);
  }
};

const baseQueryWithReauth: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = async (
  args,
  api,
  extraOptions
) => {
  let result = await dynamicBaseQuery(args, api, extraOptions);

  if (result.error && "status" in result.error && result.error.status === "FETCH_ERROR") {
    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      await new Promise((r) => setTimeout(r, RETRY_BASE_DELAY * Math.pow(2, attempt)));
      result = await dynamicBaseQuery(args, api, extraOptions);
      if (!result.error || !("status" in result.error) || result.error.status !== "FETCH_ERROR") break;
    }
    if (result.error && "status" in result.error && result.error.status === "FETCH_ERROR") {
      resetServerUrls();
    }
  }

  if (result.error && result.error.status === 401) {
    const refreshToken = await tokenStorage.getRefreshToken();

    if (refreshToken) {
      const newAccessToken = await doRefresh(refreshToken, api.dispatch);

      if (newAccessToken) {
        result = await dynamicBaseQuery(args, api, extraOptions);
      } else {
        await tokenStorage.clear();
        api.dispatch(setUnauthenticated());
      }
    } else {
      await tokenStorage.clear();
      api.dispatch(setUnauthenticated());
    }
  }

  return result;
};

export const api = createApi({
  reducerPath: "api",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Skill", "Booking", "User", "Notification", "Review", "Chat"],
  endpoints: () => ({}),
});
