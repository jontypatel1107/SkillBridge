import { z } from "zod";

export const updateProfileSchema = z.object({
  name: z.string().trim().min(2).max(80).optional(),
  bio: z.string().trim().max(300).optional(),
  avatarUrl: z.string().url().optional(),
  skills: z.array(z.string().trim().min(1).max(30)).max(30).optional(),
  interests: z.array(z.string().trim().min(1).max(30)).max(30).optional(),
  languages: z.array(z.string().trim().min(1).max(30)).max(15).optional(),
  location: z
    .object({
      lng: z.number().min(-180).max(180),
      lat: z.number().min(-90).max(90),
      city: z.string().trim().max(80).optional(),
    })
    .optional(),
});

export const nearbyQuerySchema = z.object({
  lng: z.coerce.number().min(-180).max(180),
  lat: z.coerce.number().min(-90).max(90),
  radiusKm: z.coerce.number().min(0.5).max(200).default(25),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

export const leaderboardQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export const avatarUploadSchema = z.object({
  dataUrl: z
    .string()
    .min(1)
    .refine((v) => /^data:image\/(jpeg|png|webp|gif|heic);base64,/.test(v), {
      message: "Must be a valid base64 data URL for an image",
    })
    .refine((v) => v.length <= 4_000_000, {
      message: "Image data is too large",
    }),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type NearbyQuery = z.infer<typeof nearbyQuerySchema>;
export type LeaderboardQuery = z.infer<typeof leaderboardQuerySchema>;
export type AvatarUploadInput = z.infer<typeof avatarUploadSchema>;
