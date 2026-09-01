import { Response } from "express";
import { Types } from "mongoose";
import { LearningPlan, RoadmapWeek } from "../models/LearningPlan";
import { Booking } from "../models/Booking";
import { Message } from "../models/Message";
import { Skill } from "../models/Skill";
import { User } from "../models/User";
import { ApiError, ok } from "../utils/apiResponse";
import { AuthedRequest } from "../middleware/auth";
import { generateJsonWithGemini } from "../services/geminiClient";
import { GenerateRoadmapInput, ChatSummaryInput } from "../validators/aiValidators";

export async function generateRoadmap(req: AuthedRequest, res: Response) {
  const { goal, durationDays } = req.body as GenerateRoadmapInput;
  const weekCount = Math.ceil(durationDays / 7);

  const prompt = `You are an expert learning coach. Create a ${weekCount}-week learning
roadmap for this goal: "${goal}" (target: ${durationDays} days total).

Return JSON matching exactly this shape:
{
  "weeks": [
    {
      "week": 1,
      "title": "short week theme",
      "dailyTasks": ["task for day 1", "task for day 2", "..."],
      "resources": ["resource name or type", "..."],
      "milestone": "what the learner should be able to do by end of week"
    }
  ]
}
Include all ${weekCount} weeks. Keep dailyTasks concrete and actionable, 3-5 per week (not one per literal day). Keep resources general (e.g. "official docs", "a beginner YouTube course") rather than inventing specific URLs or titles you're not sure exist.`;

  let parsed: { weeks: RoadmapWeek[] };
  try {
    parsed = await generateJsonWithGemini<{ weeks: RoadmapWeek[] }>(prompt);
  } catch (err) {
    throw new ApiError(502, `Failed to generate roadmap: ${(err as Error).message}`);
  }

  const plan = await LearningPlan.create({
    user: req.user!.id,
    goal,
    durationDays,
    weeks: parsed.weeks,
  });

  return ok(res, { plan }, 201);
}

export async function listMyRoadmaps(req: AuthedRequest, res: Response) {
  const plans = await LearningPlan.find({ user: req.user!.id }).sort({ createdAt: -1 });
  return ok(res, { plans });
}

export async function chatSummary(req: AuthedRequest, res: Response) {
  const { bookingId } = req.body as ChatSummaryInput;

  const booking = await Booking.findById(bookingId);
  if (!booking) {
    throw new ApiError(404, "Booking not found");
  }

  const isParticipant =
    booking.learner.toString() === req.user!.id || booking.mentor.toString() === req.user!.id;
  if (!isParticipant) {
    throw new ApiError(403, "You don't have access to this booking");
  }

  if (booking.status !== "completed") {
    throw new ApiError(400, "Session must be completed before generating a summary");
  }

  const messages = await Message.find({ booking: booking._id }).sort({ createdAt: 1 });
  if (messages.length === 0) {
    throw new ApiError(400, "No chat messages found for this booking to summarize");
  }

  const transcript = messages
    .map((m) => `${m.sender.toString() === booking.learner.toString() ? "Learner" : "Mentor"}: ${m.text ?? "[image]"}`)
    .join("\n");

  const prompt = `Here is a chat transcript between a learner and mentor from a
completed tutoring session:

${transcript}

Summarize it as JSON with exactly this shape:
{
  "keyConcepts": ["concept 1", "concept 2"],
  "notes": "a short paragraph summarizing what was covered",
  "homework": ["task 1", "task 2"],
  "nextSessionGoals": ["goal 1", "goal 2"]
}`;

  let summary;
  try {
    summary = await generateJsonWithGemini(prompt);
  } catch (err) {
    throw new ApiError(502, `Failed to generate summary: ${(err as Error).message}`);
  }

  return ok(res, { summary });
}

export async function recommendMentors(req: AuthedRequest, res: Response) {
  const user = await User.findById(req.user!.id);
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const interestTags = [...(user.skills ?? []), ...(user.interests ?? [])];

  // Always include all active mentors so the section is never empty.
  // Mentors sharing the learner's skills/interests are ranked higher via
  // overlapCount, rather than excluding everyone who doesn't match.
  const matchStage: Record<string, unknown> = {
    _id: { $ne: new Types.ObjectId(req.user!.id) },
    role: "mentor",
    isSuspended: false,
  };

  // When there are no interests, use a sentinel so every mentor gets an
  // overlapCount of 0 and sorting falls back to rating.
  const overlapSource = interestTags.length > 0 ? interestTags : ["__SKILLBRIDGE_NO_MATCH__"];

  const mentors = await User.aggregate([
    { $match: matchStage },
    {
      $addFields: {
        overlapCount: {
          $size: {
            $setIntersection: [{ $ifNull: ["$skills", []] }, overlapSource],
          },
        },
      },
    },
    { $sort: { overlapCount: -1, rating: -1, ratingCount: -1 } },
    { $limit: 20 },
    {
      $project: {
        name: 1,
        username: 1,
        avatarUrl: 1,
        bio: 1,
        skills: 1,
        rating: 1,
        ratingCount: 1,
        overlapCount: 1,
      },
    },
  ]);

  return ok(res, { mentors });
}

export async function suggestSkills(req: AuthedRequest, res: Response) {
  const completedBookings = await Booking.find({
    learner: req.user!.id,
    status: "completed",
  }).populate("skill", "category tags title");

  const user = await User.findById(req.user!.id);
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const completedCategories = completedBookings
    .map((b) => (b.skill as unknown as { category?: string })?.category)
    .filter(Boolean);

  const excludeCategories = new Set(completedCategories);

  // Suggest active listings the learner hasn't already completed a session
  // in, biased toward their stated interests.
  const filter: Record<string, unknown> = { isActive: true };
  if (user.interests?.length) {
    filter.$or = [
      { category: { $in: user.interests } },
      { tags: { $in: user.interests } },
    ];
  }

  const suggestions = await Skill.find(filter)
    .limit(20)
    .populate("mentor", "name username rating");

  const filtered = suggestions.filter(
    (s) => !excludeCategories.has(s.category) || completedCategories.length === 0
  );

  return ok(res, { suggestions: filtered.length > 0 ? filtered : suggestions });
}
