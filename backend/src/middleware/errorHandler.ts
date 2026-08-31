import { Request, Response, NextFunction } from "express";
import { ApiError } from "../utils/apiResponse";

export function notFound(req: Request, res: Response) {
  res.status(404).json({ success: false, message: `Route not found: ${req.originalUrl}` });
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(err: unknown, req: Request, res: Response, next: NextFunction) {
  if (err instanceof ApiError) {
    return res.status(err.status).json({ success: false, message: err.message });
  }

  // Mongoose duplicate key error
  if (typeof err === "object" && err !== null && (err as { code?: number }).code === 11000) {
    return res.status(409).json({ success: false, message: "Duplicate value — already exists" });
  }

  console.error("[unhandled error]", err);
  return res.status(500).json({ success: false, message: "Internal server error" });
}
