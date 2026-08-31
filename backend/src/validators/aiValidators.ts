import { z } from "zod";

export const generateRoadmapSchema = z.object({
  goal: z.string().trim().min(5).max(300),
  durationDays: z.number().int().min(7).max(365).default(60),
});

export const chatSummarySchema = z.object({
  bookingId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid id"),
});

export type GenerateRoadmapInput = z.infer<typeof generateRoadmapSchema>;
export type ChatSummaryInput = z.infer<typeof chatSummarySchema>;
