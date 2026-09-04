import { api } from "./baseApi";
import { ApiSuccess, Booking, BookingStatus } from "@/types";

interface CreateBookingBody {
  skillId: string;
  mode: "online" | "offline";
  scheduledAt: string;
  durationMinutes?: number;
  location?: { lng: number; lat: number; label?: string };
}

export const bookingsApi = api.injectEndpoints({
  endpoints: (builder) => ({
    myBookings: builder.query<Booking[], { status?: BookingStatus } | void>({
      query: (params) => ({ url: "/bookings", params: params ?? {} }),
      transformResponse: (res: ApiSuccess<{ bookings: Booking[] }>) => res.data.bookings,
      providesTags: ["Booking"],
    }),
    getBooking: builder.query<Booking, string>({
      query: (id) => `/bookings/${id}`,
      transformResponse: (res: ApiSuccess<{ booking: Booking }>) => res.data.booking,
      providesTags: (result, error, id) => [{ type: "Booking", id }],
    }),
    createBooking: builder.mutation<Booking, CreateBookingBody>({
      query: (body) => ({ url: "/bookings", method: "POST", body }),
      transformResponse: (res: ApiSuccess<{ booking: Booking }>) => res.data.booking,
      invalidatesTags: ["Booking"],
    }),
    updateBookingStatus: builder.mutation<
      Booking,
      { id: string; status: BookingStatus; cancelReason?: string }
    >({
      query: ({ id, ...body }) => ({ url: `/bookings/${id}/status`, method: "PATCH", body }),
      transformResponse: (res: ApiSuccess<{ booking: Booking }>) => res.data.booking,
      invalidatesTags: ["Booking"],
    }),
  }),
});

export const {
  useMyBookingsQuery,
  useGetBookingQuery,
  useCreateBookingMutation,
  useUpdateBookingStatusMutation,
} = bookingsApi;
