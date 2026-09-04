import type { User } from "@/types";

export type AuthStackParamList = {
  Login: undefined;
  Signup: undefined;
  ForgotPassword: undefined;
  VerifyOTP: { email: string; purpose: "forgot-password" };
  ResetPassword: { email: string; code: string };
};

export type HomeStackParamList = {
  HomeFeed: undefined;
  SkillDetail: { skillId: string };
  BookSession: { skillId: string };
  BookingSuccess: { bookingId: string };
  MentorDetail: { username: string; mentor: User };
};

export type ExploreStackParamList = {
  Explore: undefined;
  SkillDetail: { skillId: string };
  BookSession: { skillId: string };
  BookingSuccess: { bookingId: string };
  MentorDetail: { username: string; mentor: User };
};

export type BookingsStackParamList = {
  MyBookings: undefined;
  BookingDetail: { bookingId: string };
  LeaveReview: { bookingId: string };
};

export type ChatStackParamList = {
  ChatList: undefined;
  Conversation: { userId: string; userName: string };
  VideoCall: { userId: string; userName: string };
};

export type ProfileStackParamList = {
  ProfileHome: undefined;
  EditProfile: undefined;
  VerifyEmail: undefined;
  MyListings: undefined;
  CreateSkill: undefined;
  EditSkill: { skillId: string };
  Roadmaps: undefined;
  Leaderboard: undefined;
  Notifications: undefined;
};

export type MainTabParamList = {
  HomeTab: undefined;
  ExploreTab: undefined;
  BookingsTab: undefined;
  ChatTab: undefined;
  ProfileTab: undefined;
};

export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
  MapPicker: {
    initial?: { latitude: number; longitude: number };
    title?: string;
  };
};
