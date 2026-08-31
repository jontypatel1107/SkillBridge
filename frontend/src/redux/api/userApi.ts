import { api } from "./baseApi";
import { ApiSuccess, User } from "@/types";

interface UpdateProfileParams {
  name?: string;
  bio?: string;
  avatarUrl?: string;
  skills?: string[];
  interests?: string[];
  languages?: string[];
  location?: { longitude: number; latitude: number; city?: string };
}

export const userApi = api.injectEndpoints({
  endpoints: (builder) => ({
    updateProfile: builder.mutation<User, UpdateProfileParams>({
      query: (body) => ({ url: "/users/me", method: "PATCH", body }),
      transformResponse: (res: ApiSuccess<{ user: User }>) => res.data.user,
      invalidatesTags: ["User"],
    }),
  }),
});

export const { useUpdateProfileMutation } = userApi;
