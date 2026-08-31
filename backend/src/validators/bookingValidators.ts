import { z } from "zod";

const objectId = z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid id");

export const createBookingSchema = z.object({
  skillId: objectId,
  mode: z.enum(["online", "offline"]),
  scheduledAt: z.coerce.date().refine((d) => d.getTime() > Date.now(), {
    message: "scheduledAt must be in the future",
  }),
  durationMinutes: z.number().int().min(15).max(480).default(60),
});

export const updateBookingStatusSchema = z.object({
  status: z.enum(["confirmed", "completed", "cancelled"]),
  cancelReason: z.string().trim().max(300).optional(),
});

export const listBookingsQuerySchema = z.object({
  status: z.enum(["pending", "confirmed", "completed", "cancelled"]).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

export type CreateBookingInput = z.infer<typeof createBookingSchema>;
export type UpdateBookingStatusInput = z.infer<typeof updateBookingStatusSchema>;
export type ListBookingsQuery = z.infer<typeof listBookingsQuerySchema>;
