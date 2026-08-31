import { createApi, fetchBaseQuery, BaseQueryFn, FetchArgs, FetchBaseQueryError } from "@reduxjs/toolkit/query/react";
import { tokenStorage } from "@/utils/tokenStorage";
import { AuthResponse } from "@/types";
import { setUnauthenticated } from "@/redux/slices/authSlice";

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:5000/api";

const rawBaseQuery = fetchBaseQuery({
  baseUrl: API_URL,
  prepareHeaders: async (headers) => {
    const token = await tokenStorage.getAccessToken();
    if (token) headers.set("authorization", `Bearer ${token}`);
    return headers;
  },
});

// Wraps the raw query: on a 401, tries a single refresh + retry before
// giving up and letting the caller (usually authSlice) handle logout.
const baseQueryWithReauth: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = async (
  args,
  api,
  extraOptions
) => {
  let result = await rawBaseQuery(args, api, extraOptions);

  if (result.error && result.error.status === 401) {
    const refreshToken = await tokenStorage.getRefreshToken();

    if (refreshToken) {
      const refreshResult = await rawBaseQuery(
        { url: "/auth/refresh", method: "POST", body: { refreshToken } },
        api,
        extraOptions
      );

      const refreshed = refreshResult.data as { data: Pick<AuthResponse, "accessToken" | "refreshToken"> } | undefined;

      if (refreshed?.data?.accessToken) {
        await tokenStorage.setTokens(refreshed.data.accessToken, refreshed.data.refreshToken);
        result = await rawBaseQuery(args, api, extraOptions); // retry original request
      } else {
        await tokenStorage.clear();
        api.dispatch(setUnauthenticated());
      }
    }
  }

  return result;
};

export const api = createApi({
  reducerPath: "api",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Skill", "Booking", "User", "Notification", "Review"],
  endpoints: () => ({}),
});
