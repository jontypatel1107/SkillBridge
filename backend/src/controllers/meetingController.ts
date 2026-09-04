import { Response } from "express";
import { Types } from "mongoose";
import { ApiError, ok } from "../utils/apiResponse";
import { AuthedRequest } from "../middleware/auth";
import { Meeting } from "../models/Meeting";
import { Booking } from "../models/Booking";
import { createDailyRoom } from "../services/dailyClient";

function handleDailyError(err: unknown): never {
  if (err instanceof Error && err.message.includes("DAILY_API_KEY")) {
    throw new ApiError(503, "Video meetings are not configured yet. Add DAILY_API_KEY to the server.");
  }
  throw err;
}

// One unique, persistent room per (conversation) pair. Deriving a stable name
// from the two user ids means both sides can always rejoin the same room.
function roomNameFor(a: string, b: string): string {
  return `skillbridge_${[a, b].sort().join("_")}`;
}

// GET /api/meetings/:otherUserId — return (creating if needed) the shared
// meeting room between the current user and another user. `bookingId` is
// optional and only used to tie the room to a booking for context.
export async function getOrCreateMeeting(req: AuthedRequest, res: Response) {
  const otherUserId = req.params.otherUserId;
  if (!Types.ObjectId.isValid(otherUserId)) {
    throw new ApiError(400, "Invalid user id");
  }

  const meId = req.user!.id;
  if (meId === otherUserId) {
    throw new ApiError(400, "Cannot create a meeting with yourself");
  }

  const roomName = roomNameFor(meId, otherUserId);

  let meeting = await Meeting.findOne({ roomName });

  if (!meeting) {
    const created = await createDailyRoom(roomName, { authenticated: true }).catch(handleDailyError);
    meeting = await Meeting.create({
      initiator: meId,
      participant: otherUserId,
      roomName,
      roomUrl: created.url,
      dailyToken: created.token,
    });
  }

  return ok(res, {
    meeting: {
      _id: meeting._id,
      roomName: meeting.roomName,
      roomUrl: meeting.roomUrl,
      dailyToken: meeting.dailyToken ?? undefined,
    },
  });
}

// POST /api/meetings/:otherUserId/end — mark a room as ended.
export async function endMeeting(req: AuthedRequest, res: Response) {
  const otherUserId = req.params.otherUserId;
  if (!Types.ObjectId.isValid(otherUserId)) {
    throw new ApiError(400, "Invalid user id");
  }

  const roomName = roomNameFor(req.user!.id, otherUserId);
  const meeting = await Meeting.findOneAndUpdate(
    { roomName },
    { endedAt: new Date() },
    { new: true }
  );

  if (!meeting) throw new ApiError(404, "Meeting not found");
  return ok(res, { meeting });
}

// POST /api/meetings/:bookingId/start — for starting a meeting tied to a
// confirmed online booking. Arbitrary-pair meetings (chat) use the above.
export async function startBookingMeeting(req: AuthedRequest, res: Response) {
  const bookingId = req.params.bookingId;
  if (!Types.ObjectId.isValid(bookingId)) {
    throw new ApiError(400, "Invalid booking id");
  }

  const booking = await Booking.findById(bookingId).exec();
  if (!booking) throw new ApiError(404, "Booking not found");

  const meId = req.user!.id;
  const me = String(booking.learner) === meId ? "learner" : String(booking.mentor) === meId ? "mentor" : null;
  if (!me) throw new ApiError(403, "You are not part of this booking");

  const otherId =
    String(booking.learner) === meId ? String(booking.mentor) : String(booking.learner);

  // Existing room for this booking, if any.
  let meeting = await Meeting.findOne({ booking: bookingId });

  if (!meeting) {
    const roomName = `sb_booking_${bookingId}`;
    const created = await createDailyRoom(roomName, {
      durationMinutes: booking.durationMinutes,
      authenticated: true,
    }).catch(handleDailyError);
    meeting = await Meeting.create({
      booking: bookingId,
      initiator: meId,
      participant: otherId,
      roomName,
      roomUrl: created.url,
      dailyToken: created.token,
      startedAt: new Date(),
    });
  } else {
    meeting.startedAt = meeting.startedAt ?? new Date();
    await meeting.save();
  }

  if (!booking.meetingUrl) {
    booking.meetingUrl = meeting.roomUrl;
    await booking.save();
  }

  return ok(res, {
    meeting: {
      _id: meeting._id,
      roomName: meeting.roomName,
      roomUrl: meeting.roomUrl,
      dailyToken: meeting.dailyToken ?? undefined,
      bookingId,
    },
  });
}
