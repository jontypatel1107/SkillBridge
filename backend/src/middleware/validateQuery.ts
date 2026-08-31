import { Request, Response, NextFunction } from "express";
import { ZodSchema } from "zod";

export function validateQuery(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.query);
    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid query parameters",
        errors: result.error.flatten().fieldErrors,
      });
    }
    // Express 5 makes req.query a getter-only property in some setups,
    // so stash the parsed/coerced result separately rather than reassigning req.query.
    (req as Request & { validatedQuery: unknown }).validatedQuery = result.data;
    next();
  };
}
