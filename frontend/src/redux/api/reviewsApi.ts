import { api } from "./baseApi";
import { ApiSuccess, User } from "@/types";

export interface Review {
  _id: string;
  booking: string;
  reviewer: User | string;
  mentor: string;
  rating: number;
  comment?: string;
  createdAt: string;
}

export const reviewsApi = api.injectEndpoints({
  endpoints: (builder) => ({
    mentorReviews: builder.query<Review[], string>({
      query: (mentorId) => `/reviews/mentor/${mentorId}`,
      transformResponse: (res: ApiSuccess<{ reviews: Review[] }>) => res.data.reviews,
      providesTags: ["Review"],
    }),
    createReview: builder.mutation<Review, { bookingId: string; rating: number; comment?: string }>({
      query: (body) => ({ url: "/reviews", method: "POST", body }),
      transformResponse: (res: ApiSuccess<{ review: Review }>) => res.data.review,
      invalidatesTags: ["Review", "Booking"],
    }),
  }),
});

export const { useMentorReviewsQuery, useCreateReviewMutation } = reviewsApi;
