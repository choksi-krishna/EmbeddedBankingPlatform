import { z } from "zod";

export const CreateAccountSchema = z.object({
  type: z.enum(["checking", "savings", "business"]),
  currency: z.string().trim().length(3).default("USD"),
  user_id: z.string().uuid().optional(),
});

export const UpdateAccountSchema = z.object({
  status: z.enum(["active", "frozen", "closed"]).optional(),
});
