import { api } from "./baseApi";
import { ApiSuccess, Skill, User } from "@/types";

interface UpdateProfileParams {
  name?: string;
  bio?: string;
  avatarUrl?: string;
  skills?: string[];
  interests?: string[];
  languages?: string[];
  location?: { lng: number; lat: number; city?: string };
}

export interface GamificationStreak {
  current: number;
  longest: number;
  lastActiveDate: string | null;
}

export interface BadgeInfo {
  code: string;
  name: string;
  description: string;
}

export interface GamificationSummary {
  xp: number;
  level: number;
  levelTitle: string;
  xpIntoLevel: number;
  xpNeededForLevel: number;
  streak: GamificationStreak;
  badges: BadgeInfo[];
}

export interface LeaderboardEntry {
  _id: string;
  name: string;
  username: string;
  avatarUrl?: string;
  role: string;
  xp: number;
  level: number;
  levelTitle: string;
}

interface NearbyParams {
  lng: number;
  lat: number;
  radiusKm?: number;
  limit?: number;
}

export interface NearbyResult {
  mentors: User[];
  center: { lng: number; lat: number };
}

export const userApi = api.injectEndpoints({
  endpoints: (builder) => ({
    nearbyMentors: builder.query<NearbyResult, NearbyParams>({
      query: (params) => ({ url: "/users/nearby", params }),
      transformResponse: (res: ApiSuccess<NearbyResult>) => res.data,
    }),
    updateProfile: builder.mutation<User, UpdateProfileParams>({
      query: (body) => ({ url: "/users/me", method: "PATCH", body }),
      transformResponse: (res: ApiSuccess<{ user: User }>) => res.data.user,
      invalidatesTags: ["User"],
    }),
    getMyGamification: builder.query<GamificationSummary, void>({
      query: () => "/users/me/gamification",
      transformResponse: (res: ApiSuccess<GamificationSummary>) => res.data,
      providesTags: ["User"],
    }),
    getLeaderboard: builder.query<LeaderboardEntry[], { limit?: number } | void>({
      query: (params) => ({ url: "/users/leaderboard", params: params ?? undefined }),
      transformResponse: (res: ApiSuccess<{ leaderboard: LeaderboardEntry[] }>) => res.data.leaderboard,
    }),
    updateAvatar: builder.mutation<User, { dataUrl: string }>({
      query: (body) => ({ url: "/users/me/avatar", method: "POST", body }),
      transformResponse: (res: ApiSuccess<{ user: User }>) => res.data.user,
      invalidatesTags: ["User"],
    }),
    getPublicProfile: builder.query<{ user: User; listings: Skill[] }, string>({
      query: (username) => `/users/${username}`,
      transformResponse: (res: ApiSuccess<{ user: User; listings: Skill[] }>) => res.data,
      providesTags: ["User"],
    }),
  }),
});

export const {
  useUpdateProfileMutation,
  useGetMyGamificationQuery,
  useGetLeaderboardQuery,
  useUpdateAvatarMutation,
  useGetPublicProfileQuery,
  useNearbyMentorsQuery,
} = userApi;