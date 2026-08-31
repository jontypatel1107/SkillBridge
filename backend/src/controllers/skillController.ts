import { Request, Response } from "express";
import { Types } from "mongoose";
import { Skill } from "../models/Skill";
import { ApiError, ok } from "../utils/apiResponse";
import { AuthedRequest } from "../middleware/auth";
import { CreateSkillInput, UpdateSkillInput, SearchSkillsQuery } from "../validators/skillValidators";

export async function createSkill(req: AuthedRequest, res: Response) {
  if (req.user!.role !== "mentor" && req.user!.role !== "admin") {
    throw new ApiError(403, "Only mentors can create skill listings");
  }

  const input = req.body as CreateSkillInput;
  const skill = await Skill.create({ ...input, mentor: req.user!.id });

  return ok(res, { skill }, 201);
}

export async function searchSkills(req: Request, res: Response) {
  const query = (req as Request & { validatedQuery: SearchSkillsQuery }).validatedQuery;
  const { q, category, minPrice, maxPrice, sort, page, limit } = query;

  const filter: Record<string, unknown> = { isActive: true };
  if (category) filter.category = category;
  if (minPrice !== undefined || maxPrice !== undefined) {
    filter.hourlyPrice = {
      ...(minPrice !== undefined ? { $gte: minPrice } : {}),
      ...(maxPrice !== undefined ? { $lte: maxPrice } : {}),
    };
  }
  if (q) {
    filter.$text = { $search: q };
  }

  const sortMap: Record<SearchSkillsQuery["sort"], Record<string, 1 | -1>> = {
    newest: { createdAt: -1 },
    priceLowHigh: { hourlyPrice: 1 },
    priceHighLow: { hourlyPrice: -1 },
    topRated: { createdAt: -1 }, // rating lives on User; refined once mentor rating join lands
  };

  const skip = (page - 1) * limit;

  const [skills, total] = await Promise.all([
    Skill.find(filter)
      .sort(sortMap[sort])
      .skip(skip)
      .limit(limit)
      .populate("mentor", "name username avatarUrl rating ratingCount"),
    Skill.countDocuments(filter),
  ]);

  return ok(res, {
    skills,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
}

export async function getSkill(req: Request, res: Response) {
  if (!Types.ObjectId.isValid(req.params.id)) {
    throw new ApiError(400, "Invalid skill id");
  }

  const skill = await Skill.findById(req.params.id).populate(
    "mentor",
    "name username avatarUrl bio rating ratingCount location"
  );

  if (!skill) {
    throw new ApiError(404, "Skill not found");
  }

  return ok(res, { skill });
}

export async function updateSkill(req: AuthedRequest, res: Response) {
  if (!Types.ObjectId.isValid(req.params.id)) {
    throw new ApiError(400, "Invalid skill id");
  }

  const skill = await Skill.findById(req.params.id);
  if (!skill) {
    throw new ApiError(404, "Skill not found");
  }

  const isOwner = skill.mentor.toString() === req.user!.id;
  if (!isOwner && req.user!.role !== "admin") {
    throw new ApiError(403, "You don't have permission to edit this listing");
  }

  const input = req.body as UpdateSkillInput;
  Object.assign(skill, input);
  await skill.save();

  return ok(res, { skill });
}

export async function deleteSkill(req: AuthedRequest, res: Response) {
  if (!Types.ObjectId.isValid(req.params.id)) {
    throw new ApiError(400, "Invalid skill id");
  }

  const skill = await Skill.findById(req.params.id);
  if (!skill) {
    throw new ApiError(404, "Skill not found");
  }

  const isOwner = skill.mentor.toString() === req.user!.id;
  if (!isOwner && req.user!.role !== "admin") {
    throw new ApiError(403, "You don't have permission to delete this listing");
  }

  await skill.deleteOne();
  return ok(res, { message: "Skill listing deleted" });
}

export async function myListings(req: AuthedRequest, res: Response) {
  const skills = await Skill.find({ mentor: req.user!.id }).sort({ createdAt: -1 });
  return ok(res, { skills });
}
