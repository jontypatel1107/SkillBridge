import { api } from "./baseApi";
import { ApiSuccess } from "@/types";

export interface AppNotification {
  _id: string;
  type: string;
  title: string;
  body: string;
  isRead: boolean;
  createdAt: string;
}

export const notificationsApi = api.injectEndpoints({
  endpoints: (builder) => ({
    myNotifications: builder.query<{ notifications: AppNotification[]; unreadCount: number }, void>({
      query: () => "/notifications",
      transformResponse: (res: ApiSuccess<{ notifications: AppNotification[]; unreadCount: number }>) =>
        res.data,
      providesTags: ["Notification"],
    }),
    markNotificationRead: builder.mutation<void, string>({
      query: (id) => ({ url: `/notifications/${id}/read`, method: "PATCH" }),
      invalidatesTags: ["Notification"],
    }),
    markAllRead: builder.mutation<void, void>({
      query: () => ({ url: "/notifications/read-all", method: "PATCH" }),
      invalidatesTags: ["Notification"],
    }),
  }),
});

export const { useMyNotificationsQuery, useMarkNotificationReadMutation, useMarkAllReadMutation } =
  notificationsApi;
