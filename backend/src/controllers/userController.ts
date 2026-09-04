import { Response } from "express";
import { Types } from "mongoose";
import { promises as fs } from "fs";
import path from "path";
import { User } from "../models/User";
import { Skill } from "../models/Skill";
import { ApiError, ok } from "../utils/apiResponse";
import { AuthedRequest } from "../middleware/auth";
import {
  UpdateProfileInput,
  NearbyQuery,
  LeaderboardQuery,
  AvatarUploadInput,
} from "../validators/userValidators";
import { notify } from "../services/notificationService";
import { onFollowerGained, getGamificationSummary, levelTitle } from "../services/gamificationService";
import { toPublicLocation, toPublicUser } from "../utils/publicUser";

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

  const listings =
    user.role === "mentor"
      ? await Skill.find({ mentor: user._id, isActive: true }).sort({ createdAt: -1 })
      : [];

  return ok(res, { user: toPublicUser(user), listings });
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

  const docs = await User.aggregate([
    {
      $geoNear: {
        near: { type: "Point", coordinates: [lng, lat] },
        distanceField: "distanceMeters",
        maxDistance: radiusKm * 1000,
        spherical: true,
        query: {
          role: "mentor",
          isSuspended: false,
          location: { $exists: true, $ne: null },
        },
      },
    },
    { $limit: limit },
    {
      $project: {
        name: 1,
        username: 1,
        avatarUrl: 1,
        bio: 1,
        skills: 1,
        rating: 1,
        ratingCount: 1,
        level: 1,
        xp: 1,
        distanceKm: { $round: [{ $divide: ["$distanceMeters", 1000] }, 1] },
        locationCity: "$location.city",
      },
    },
  ]);

  const mentors = docs.map((doc) =>
    toPublicUser({
      ...doc,
      location: { city: doc.locationCity },
      id: doc._id.toString(),
    })
  );

  return ok(res, { mentors, center: { lng, lat } });
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

export async function uploadAvatar(req: AuthedRequest, res: Response) {
  const { dataUrl } = req.body as AvatarUploadInput;

  const match = /^data:image\/(jpeg|png|webp|gif|heic);base64,(.+)$/.exec(dataUrl)!;
  const ext = match[1] === "jpeg" ? "jpg" : match[1];
  const buffer = Buffer.from(match[2], "base64");

  const dir = path.join(process.cwd(), "public", "avatars");
  await fs.mkdir(dir, { recursive: true });

  const filename = `${req.user!.id}-${Date.now()}.${ext}`;
  await fs.writeFile(path.join(dir, filename), buffer);

  const host = req.get("host") ?? "localhost:5000";
  const avatarUrl = `${req.protocol}://${host}/avatars/${filename}`;

  const user = await User.findByIdAndUpdate(req.user!.id, { avatarUrl }, { new: true, runValidators: true });
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  return ok(res, { user });
}
