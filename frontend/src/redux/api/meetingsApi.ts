import { api } from "./baseApi";
import { ApiSuccess } from "@/types";

export interface Meeting {
  _id: string;
  roomName: string;
  roomUrl: string;
  dailyToken?: string;
  bookingId?: string;
}

export const meetingsApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getOrCreateMeeting: builder.mutation<Meeting, string>({
      query: (otherUserId) => ({
        url: `/meetings/${otherUserId}`,
        method: "GET",
      }),
      transformResponse: (res: ApiSuccess<{ meeting: Meeting }>) => res.data.meeting,
    }),
    startBookingMeeting: builder.mutation<Meeting, string>({
      query: (bookingId) => ({
        url: `/meetings/booking/${bookingId}/start`,
        method: "POST",
      }),
      transformResponse: (res: ApiSuccess<{ meeting: Meeting }>) => res.data.meeting,
    }),
    endMeeting: builder.mutation<void, string>({
      query: (otherUserId) => ({
        url: `/meetings/${otherUserId}/end`,
        method: "POST",
      }),
    }),
  }),
});

export const {
  useGetOrCreateMeetingMutation,
  useStartBookingMeetingMutation,
  useEndMeetingMutation,
} = meetingsApi;
