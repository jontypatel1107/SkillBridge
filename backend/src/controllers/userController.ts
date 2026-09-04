import { Response } from "express";
import { Types } from "mongoose";
import { User } from "../models/User";
import { ApiError, ok } from "../utils/apiResponse";
import { AuthedRequest } from "../middleware/auth";
import { UpdateProfileInput, NearbyQuery, LeaderboardQuery } from "../validators/userValidators";
import { notify } from "../services/notificationService";
import { onFollowerGained, getGamificationSummary, levelTitle } from "../services/gamificationService";

export async function updateProfile(req: AuthedRequest, res: Response) {
  const input = req.body as UpdateProfileInput;

  const update: Record<string, unknown> = { ...input };
  delete update.location;

  if (input.location) {
    update.location = {
      type: "Point",
      coordinates: [input.location.lng, input.location.lat],
      city: input.location.city,
    };
  }

  const user = await User.findByIdAndUpdate(req.user!.id, update, {
    new: true,
    runValidators: true,
  });

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  return ok(res, { user });
}

export async function getPublicProfile(req: AuthedRequest, res: Response) {
  const { username } = req.params;

  const user = await User.findOne({ username }).select(
    "-refreshTokenHash -email"
  );
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  return ok(res, { user });
}

export async function followUser(req: AuthedRequest, res: Response) {
  if (!Types.ObjectId.isValid(req.params.id)) {
    throw new ApiError(400, "Invalid user id");
  }
  if (req.params.id === req.user!.id) {
    throw new ApiError(400, "You can't follow yourself");
  }

  const target = await User.findById(req.params.id);
  if (!target) {
    throw new ApiError(404, "User not found");
  }

  const alreadyFollowing = target.followers.some((f) => f.toString() === req.user!.id);
  if (alreadyFollowing) {
    return ok(res, { message: "Already following" });
  }

  target.followers.push(new Types.ObjectId(req.user!.id));
  await target.save();

  await User.findByIdAndUpdate(req.user!.id, {
    $addToSet: { following: target._id },
  });

  await notify({
    recipient: target._id,
    type: "new_follower",
    title: "New follower",
    body: "Someone started following you",
    relatedId: new Types.ObjectId(req.user!.id),
  });

  await onFollowerGained(target._id);

  return ok(res, { message: "Followed" });
}

export async function unfollowUser(req: AuthedRequest, res: Response) {
  if (!Types.ObjectId.isValid(req.params.id)) {
    throw new ApiError(400, "Invalid user id");
  }

  await User.findByIdAndUpdate(req.params.id, {
    $pull: { followers: req.user!.id },
  });
  await User.findByIdAndUpdate(req.user!.id, {
    $pull: { following: req.params.id },
  });

  return ok(res, { message: "Unfollowed" });
}

export async function nearbyMentors(req: AuthedRequest, res: Response) {
  const query = (req as AuthedRequest & { validatedQuery: NearbyQuery }).validatedQuery;
  const { lng, lat, radiusKm, limit } = query;

  const mentors = await User.find({
    role: "mentor",
    isSuspended: false,
    location: {
      $near: {
        $geometry: { type: "Point", coordinates: [lng, lat] },
        $maxDistance: radiusKm * 1000,
      },
    },
  })
    .select("name username avatarUrl bio skills rating ratingCount location")
    .limit(limit);

  return ok(res, { mentors });
}

export async function myGamification(req: AuthedRequest, res: Response) {
  const user = await User.findById(req.user!.id);
  if (!user) {
    throw new ApiError(404, "User not found");
  }
  return ok(res, getGamificationSummary(user));
}

export async function leaderboard(req: AuthedRequest, res: Response) {
  const { limit } = (req as AuthedRequest & { validatedQuery: LeaderboardQuery }).validatedQuery;
  const users = await User.find({ isSuspended: false })
    .select("name username avatarUrl xp level role")
    .sort({ xp: -1 })
    .limit(limit);
  const leaderboard = users.map((user) => ({
    _id: user._id,
    name: user.name,
    username: user.username,
    avatarUrl: user.avatarUrl,
    role: user.role,
    xp: user.xp ?? 0,
    level: user.level ?? 1,
    levelTitle: levelTitle(user.level ?? 1),
  }));
  return ok(res, { leaderboard });
}
