import { z } from "zod";

export const FeeScheduleSchema = z
  .object({
    fee_type: z.enum([
      "ach",
      "wire",
      "card_issuance",
      "monthly",
      "per_transaction",
      "interchange_share",
    ]),
    fixed_amount: z.coerce.number().nonnegative().optional(),
    percentage: z.coerce.number().nonnegative().optional(),
    config: z.record(z.string(), z.unknown()).optional(),
  })
  .refine(
    (data) => (data.fixed_amount ?? 0) > 0 || (data.percentage ?? 0) > 0,
    "Either fixed_amount or percentage required",
  );
