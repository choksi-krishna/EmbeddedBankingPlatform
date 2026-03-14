import { z } from "zod";

const SpendingLimitsSchema = z.object({
  daily_limit: z.coerce.number().nonnegative().nullable().optional(),
  per_transaction_limit: z.coerce.number().nonnegative().nullable().optional(),
  blocked_merchant_categories: z.array(z.string()).optional(),
});

export const IssueCardSchema = z.object({
  account_id: z.string().uuid(),
  type: z.enum(["virtual", "physical"]),
});

export const UpdateCardSchema = z.object({
  status: z.enum(["active", "frozen", "cancelled"]).optional(),
  spending_limits: SpendingLimitsSchema.optional(),
});
