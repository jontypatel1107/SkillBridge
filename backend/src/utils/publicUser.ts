import { Types } from "mongoose";
import { User } from "../models/User";

export interface PublicLocation {
  city?: string;
}

/**
 * Public-facing location: never expose exact coordinates. Only a coarse
 * address/city is returned so other users can't pin down a mentor's (or any
 * user's) exact home/work position. Add more granular area labels here later
 * if/when reverse geocoding is available.
 */
export function toPublicLocation(
  location?: { city?: string } | null
): PublicLocation | undefined {
  if (!location) return undefined;
  return location.city ? { city: location.city } : undefined;
}

/**
 * Serialize a user doc (or lean result) for public viewing — strips sensitive
 * fields and maps the location to a coarse city/area label with no coordinates.
 */
export function toPublicUser(user: {
  _id?: Types.ObjectId;
  id?: string;
  name: string;
  username: string;
  avatarUrl?: string;
  bio?: string;
  rating?: number;
  ratingCount?: number;
  role?: string;
  level?: number;
  xp?: number;
  skills?: string[];
  location?: { city?: string } | null;
  distanceKm?: number;
}) {
  return {
    id: user.id ?? (user._id ? user._id.toString() : undefined),
    name: user.name,
    username: user.username,
    avatarUrl: user.avatarUrl,
    bio: user.bio,
    rating: user.rating,
    ratingCount: user.ratingCount,
    role: user.role,
    level: user.level,
    xp: user.xp,
    skills: user.skills ?? [],
    location: toPublicLocation(user.location),
    ...(user.distanceKm !== undefined ? { distanceKm: user.distanceKm } : {}),
  };
}
