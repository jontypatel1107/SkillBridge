import { api } from "./baseApi";
import { AuthResponse, ApiSuccess, User } from "@/types";

interface RegisterBody {
  name: string;
  username: string;
  email: string;
  password: string;
  role?: "student" | "mentor";
}

interface LoginBody {
  email: string;
  password: string;
}

export const authApi = api.injectEndpoints({
  endpoints: (builder) => ({
    register: builder.mutation<AuthResponse, RegisterBody>({
      query: (body) => ({ url: "/auth/register", method: "POST", body }),
      transformResponse: (res: ApiSuccess<AuthResponse>) => res.data,
    }),
    login: builder.mutation<AuthResponse, LoginBody>({
      query: (body) => ({ url: "/auth/login", method: "POST", body }),
      transformResponse: (res: ApiSuccess<AuthResponse>) => res.data,
    }),
    me: builder.query<User, void>({
      query: () => "/auth/me",
      transformResponse: (res: ApiSuccess<{ user: User }>) => res.data.user,
      providesTags: ["User"],
    }),
    logout: builder.mutation<void, void>({
      query: () => ({ url: "/auth/logout", method: "POST" }),
    }),
    forgotPassword: builder.mutation<{ message: string }, { email: string }>({
      query: (body) => ({ url: "/auth/forgot-password", method: "POST", body }),
      transformResponse: (res: ApiSuccess<{ message: string }>) => res.data,
    }),
    verifyOtp: builder.mutation<{ message: string }, { email: string; code: string; purpose: "forgot-password" | "verify-email" }>({
      query: (body) => ({ url: "/auth/verify-otp", method: "POST", body }),
      transformResponse: (res: ApiSuccess<{ message: string }>) => res.data,
    }),
    resetPassword: builder.mutation<{ message: string }, { email: string; code: string; newPassword: string }>({
      query: (body) => ({ url: "/auth/reset-password", method: "POST", body }),
      transformResponse: (res: ApiSuccess<{ message: string }>) => res.data,
    }),
    verifyEmail: builder.mutation<{ message: string }, void>({
      query: () => ({ url: "/auth/verify-email", method: "POST" }),
      transformResponse: (res: ApiSuccess<{ message: string }>) => res.data,
    }),
    confirmEmail: builder.mutation<{ message: string; user: User }, { code: string }>({
      query: (body) => ({ url: "/auth/confirm-email", method: "POST", body }),
      transformResponse: (res: ApiSuccess<{ message: string; user: User }>) => res.data,
    }),
  }),
});

export const {
  useRegisterMutation,
  useLoginMutation,
  useMeQuery,
  useLogoutMutation,
  useForgotPasswordMutation,
  useVerifyOtpMutation,
  useResetPasswordMutation,
  useVerifyEmailMutation,
  useConfirmEmailMutation,
} = authApi;
