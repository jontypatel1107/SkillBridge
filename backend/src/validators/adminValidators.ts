import { z } from "zod";

export const setSuspendedSchema = z.object({
  suspended: z.boolean(),
});
