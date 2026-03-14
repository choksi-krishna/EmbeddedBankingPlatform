import { z } from "zod";

export const InitiateTransferSchema = z.object({
  from_account_id: z.string().uuid(),
  to_account_id: z.string().uuid(),
  amount: z.coerce.number().positive(),
  type: z.enum(["ach", "wire", "internal", "direct_deposit"]),
  beneficiary_id: z.string().uuid().optional(),
});
