import { api } from "./baseApi";
import { ApiSuccess, Skill, User } from "@/types";

export interface RoadmapWeek {
  week: number;
  title: string;
  dailyTasks: string[];
  resources: string[];
  milestone: string;
}

export interface LearningPlan {
  _id: string;
  goal: string;
  durationDays: number;
  weeks: RoadmapWeek[];
  createdAt: string;
}

export const aiApi = api.injectEndpoints({
  endpoints: (builder) => ({
    generateRoadmap: builder.mutation<LearningPlan, { goal: string; durationDays?: number }>({
      query: (body) => ({ url: "/ai/roadmap", method: "POST", body }),
      transformResponse: (res: ApiSuccess<{ plan: LearningPlan }>) => res.data.plan,
    }),
    myRoadmaps: builder.query<LearningPlan[], void>({
      query: () => "/ai/roadmap/mine",
      transformResponse: (res: ApiSuccess<{ plans: LearningPlan[] }>) => res.data.plans,
    }),
    recommendedMentors: builder.query<User[], void>({
      query: () => "/ai/recommend-mentors",
      transformResponse: (res: ApiSuccess<{ mentors: User[] }>) => res.data.mentors,
    }),
    suggestedSkills: builder.query<Skill[], void>({
      query: () => "/ai/suggest-skills",
      transformResponse: (res: ApiSuccess<{ suggestions: Skill[] }>) => res.data.suggestions,
    }),
  }),
});

export const {
  useGenerateRoadmapMutation,
  useMyRoadmapsQuery,
  useRecommendedMentorsQuery,
  useSuggestedSkillsQuery,
} = aiApi;
