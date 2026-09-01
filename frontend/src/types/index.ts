export type UserRole = "student" | "mentor" | "admin";

export interface User {
  id: string;
  _id?: string;
  name: string;
  username: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
  bio?: string;
  skills?: string[];
  interests?: string[];
  languages?: string[];
  rating?: number;
  ratingCount?: number;
  isVerified?: boolean;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface ApiSuccess<T> {
  success: true;
  data: T;
}

export interface ApiError {
  success: false;
  message: string;
  errors?: Record<string, string[]>;
}

export type SkillCategory =
  | "development"
  | "ai"
  | "music"
  | "fitness"
  | "design"
  | "business"
  | "photography"
  | "cooking"
  | "languages";

export interface Skill {
  _id: string;
  mentor: User | string;
  title: string;
  category: SkillCategory;
  description: string;
  hourlyPrice: number;
  tags: string[];
  isActive: boolean;
  createdAt: string;
}

export type BookingStatus = "pending" | "confirmed" | "completed" | "cancelled" | "expired";

export interface Booking {
  _id: string;
  learner: User | string;
  mentor: User | string;
  skill: Skill | string;
  mode: "online" | "offline";
  scheduledAt: string;
  durationMinutes: number;
  status: BookingStatus;
  meetingUrl?: string;
}
