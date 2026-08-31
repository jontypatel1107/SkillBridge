import { api } from "./baseApi";
import { ApiSuccess, Skill, SkillCategory } from "@/types";

interface SearchSkillsParams {
  q?: string;
  category?: SkillCategory;
  minPrice?: number;
  maxPrice?: number;
  sort?: "newest" | "priceLowHigh" | "priceHighLow" | "topRated";
  page?: number;
}

interface SkillsPage {
  skills: Skill[];
  pagination: { page: number; totalPages: number; total: number };
}

export const skillsApi = api.injectEndpoints({
  endpoints: (builder) => ({
    searchSkills: builder.query<SkillsPage, SearchSkillsParams | void>({
      query: (params) => ({ url: "/skills", params: params ?? {} }),
      transformResponse: (res: ApiSuccess<SkillsPage>) => res.data,
      providesTags: ["Skill"],
    }),
    getSkill: builder.query<Skill, string>({
      query: (id) => `/skills/${id}`,
      transformResponse: (res: ApiSuccess<{ skill: Skill }>) => res.data.skill,
      providesTags: (result, error, id) => [{ type: "Skill", id }],
    }),
    myListings: builder.query<Skill[], void>({
      query: () => "/skills/mentor/mine",
      transformResponse: (res: ApiSuccess<{ skills: Skill[] }>) => res.data.skills,
      providesTags: ["Skill"],
    }),
    createSkill: builder.mutation<Skill, Partial<Skill>>({
      query: (body) => ({ url: "/skills", method: "POST", body }),
      transformResponse: (res: ApiSuccess<{ skill: Skill }>) => res.data.skill,
      invalidatesTags: ["Skill"],
    }),
    updateSkill: builder.mutation<Skill, { id: string; body: Partial<Skill> }>({
      query: ({ id, body }) => ({ url: `/skills/${id}`, method: "PATCH", body }),
      transformResponse: (res: ApiSuccess<{ skill: Skill }>) => res.data.skill,
      invalidatesTags: ["Skill"],
    }),
    deleteSkill: builder.mutation<void, string>({
      query: (id) => ({ url: `/skills/${id}`, method: "DELETE" }),
      invalidatesTags: ["Skill"],
    }),
  }),
});

export const {
  useSearchSkillsQuery,
  useGetSkillQuery,
  useMyListingsQuery,
  useCreateSkillMutation,
  useUpdateSkillMutation,
  useDeleteSkillMutation,
} = skillsApi;
