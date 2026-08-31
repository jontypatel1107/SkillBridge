import { z } from "zod";

export const skillCategories = [
  "development",
  "ai",
  "music",
  "fitness",
  "design",
  "business",
  "photography",
  "cooking",
  "languages",
] as const;

export const createSkillSchema = z.object({
  title: z.string().trim().min(3).max(100),
  category: z.enum(skillCategories),
  description: z.string().trim().min(10).max(1000),
  hourlyPrice: z.number().min(0).max(100000),
  tags: z.array(z.string().trim().min(1).max(30)).max(15).default([]),
});

export const updateSkillSchema = createSkillSchema.partial().extend({
  isActive: z.boolean().optional(),
});

export const searchSkillsQuerySchema = z.object({
  q: z.string().trim().max(100).optional(),
  category: z.enum(skillCategories).optional(),
  minPrice: z.coerce.number().min(0).optional(),
  maxPrice: z.coerce.number().min(0).optional(),
  sort: z.enum(["newest", "priceLowHigh", "priceHighLow", "topRated"]).default("newest"),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

export type CreateSkillInput = z.infer<typeof createSkillSchema>;
export type UpdateSkillInput = z.infer<typeof updateSkillSchema>;
export type SearchSkillsQuery = z.infer<typeof searchSkillsQuerySchema>;
