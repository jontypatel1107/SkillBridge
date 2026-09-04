import { Types } from "mongoose";
import { User, IUser } from "../models/User";
import { Booking } from "../models/Booking";
import { notify } from "./notificationService";

export interface BadgeDef {
  code: string;
  name: string;
  description: string;
}

export const BADGES: Record<string, BadgeDef> = {
  first_session: { code: "first_session", name: "First Session", description: "Completed your first session" },
  first_mentor: { code: "first_mentor", name: "First Mentor", description: "Completed your first session as a mentor" },
  fast_learner: { code: "fast_learner", name: "Fast Learner", description: "Completed 3 sessions as a learner" },
  five_star_mentor: { code: "five_star_mentor", name: "5-Star Mentor", description: "Received a 5-star review" },
  ten_sessions: { code: "ten_sessions", name: "10 Sessions", description: "Completed 10 sessions total" },
  community_hero: { code: "community_hero", name: "Community Hero", description: "Reached 10 followers" },
};

const XP_AWARDS = {
  SESSION_COMPLETED_LEARNER: 20,
  SESSION_COMPLETED_MENTOR: 30,
  POSITIVE_REVIEW_BONUS: 15, // rating >= 4
  STREAK_DAY_BONUS: 5, // multiplied by min(streak, 10), capped
};

// Level N requires N*100 XP beyond the previous level (cumulative, not flat).
function xpForLevel(level: number): number {
  return level * 100;
}

function cumulativeXp(level: number): number {
  let total = 0;
  for (let i = 1; i < level; i++) total += xpForLevel(i);
  return total;
}

// Walk the cumulative thresholds until the next level is out of reach.
function calculateLevel(xp: number): number {
  let level = 1;
  let remaining = Math.max(0, xp);
  let need = xpForLevel(level);
  while (remaining >= need) {
    remaining -= need;
    level += 1;
    need = xpForLevel(level);
  }
  return level;
}

export function levelTitle(level: number): string {
  if (level >= 20) return "Expert";
  if (level >= 10) return "Skilled";
  if (level >= 5) return "Explorer";
  return "Beginner";
}

function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

function isYesterday(last: string, today: string): boolean {
  const lastDate = new Date(last + "T00:00:00.000Z").getTime();
  const todayDate = new Date(today + "T00:00:00.000Z").getTime();
  return todayDate - lastDate === 24 * 60 * 60 * 1000;
}

async function awardXp(userId: Types.ObjectId | string, amount: number) {
  const user = await User.findById(userId);
  if (!user) return;

  const prevLevel = user.level;
  user.xp += amount;
  user.level = calculateLevel(user.xp);
  await user.save();

  if (user.level > prevLevel) {
    await notify({
      recipient: user._id,
      type: "level_up",
      title: "Level up!",
      body: `You reached level ${user.level}`,
    });
  }
}

async function updateStreak(userId: Types.ObjectId | string) {
  const user = await User.findById(userId);
  if (!user) return;

  const today = todayKey();
  const last = user.streak.lastActiveDate;
  if (last === today) return; // same day — no-op

  if (last && isYesterday(last, today)) {
    user.streak.current += 1;
    user.streak.longest = Math.max(user.streak.longest, user.streak.current);
  } else {
    user.streak.current = 1;
  }
  user.streak.lastActiveDate = today;
  await user.save();

  await awardXp(userId, Math.min(user.streak.current, 10) * XP_AWARDS.STREAK_DAY_BONUS);
}

async function awardBadge(userId: Types.ObjectId | string, code: string) {
  const def = BADGES[code];
  if (!def) return;

  const user = await User.findById(userId);
  if (!user) return;
  if (user.badges.includes(code)) return; // already unlocked — no-op

  user.badges.push(code);
  await user.save();

  await notify({
    recipient: user._id,
    type: "badge_unlocked",
    title: "Badge unlocked",
    body: `You unlocked the "${def.name}" badge`,
  });
}

// Badge-eligibility counts come from the database, never from the caller.
export async function onBookingCompleted(booking: {
  _id: Types.ObjectId;
  learner: Types.ObjectId;
  mentor: Types.ObjectId;
}): Promise<void> {
  try {
    // XP + streak for both parties.
    await awardXp(booking.learner, XP_AWARDS.SESSION_COMPLETED_LEARNER);
    await awardXp(booking.mentor, XP_AWARDS.SESSION_COMPLETED_MENTOR);
    await updateStreak(booking.learner);
    await updateStreak(booking.mentor);

    // Real counts — this booking is already saved as completed, so it counts.
    const [learnerTotal, mentorTotal, learnerAsLearner, mentorAsMentor] = await Promise.all([
      Booking.countDocuments({
        $or: [{ learner: booking.learner }, { mentor: booking.learner }],
        status: "completed",
      }),
      Booking.countDocuments({
        $or: [{ learner: booking.mentor }, { mentor: booking.mentor }],
        status: "completed",
      }),
      Booking.countDocuments({ learner: booking.learner, status: "completed" }),
      Booking.countDocuments({ mentor: booking.mentor, status: "completed" }),
    ]);

    // Badges are per-user, not per-role.
    if (learnerTotal <= 1) await awardBadge(booking.learner, "first_session");
    if (mentorTotal <= 1) await awardBadge(booking.mentor, "first_session");
    if (mentorAsMentor <= 1) await awardBadge(booking.mentor, "first_mentor");
    if (learnerAsLearner >= 3) await awardBadge(booking.learner, "fast_learner");
    if (learnerTotal >= 10) await awardBadge(booking.learner, "ten_sessions");
    if (mentorTotal >= 10) await awardBadge(booking.mentor, "ten_sessions");
  } catch (err) {
    console.error("[gamification] onBookingCompleted failed:", err);
  }
}

export async function onReviewCreated(review: {
  mentor: Types.ObjectId;
  rating: number;
}): Promise<void> {
  try {
    if (review.rating >= 4) {
      await awardXp(review.mentor, XP_AWARDS.POSITIVE_REVIEW_BONUS);
    }
    if (review.rating === 5) {
      await awardBadge(review.mentor, "five_star_mentor");
    }
  } catch (err) {
    console.error("[gamification] onReviewCreated failed:", err);
  }
}

export async function onFollowerGained(targetUserId: Types.ObjectId | string): Promise<void> {
  try {
    const target = await User.findById(targetUserId);
    if (!target) return;
    if (target.followers.length >= 10) {
      await awardBadge(target._id, "community_hero");
    }
  } catch (err) {
    console.error("[gamification] onFollowerGained failed:", err);
  }
}

export function getGamificationSummary(user: IUser): {
  xp: number;
  level: number;
  levelTitle: string;
  xpIntoLevel: number;
  xpNeededForLevel: number;
  streak: IUser["streak"];
  badges: BadgeDef[];
} {
  const xp = user.xp ?? 0;
  const level = user.level ?? 1;
  const streak = user.streak ?? { current: 0, longest: 0, lastActiveDate: null };
  const base = cumulativeXp(level);

  return {
    xp,
    level,
    levelTitle: levelTitle(level),
    xpIntoLevel: xp - base,
    xpNeededForLevel: xpForLevel(level),
    streak,
    badges: (user.badges ?? [])
      .map((code) => BADGES[code])
      .filter((badge): badge is BadgeDef => Boolean(badge)),
  };
}