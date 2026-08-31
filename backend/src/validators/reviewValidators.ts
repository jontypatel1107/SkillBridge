import { z } from "zod";

const objectId = z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid id");

export const createReviewSchema = z.object({
  bookingId: objectId,
  rating: z.number().int().min(1).max(5),
  comment: z.string().trim().max(500).optional(),
});

export type CreateReviewInput = z.infer<typeof createReviewSchema>;
