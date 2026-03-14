import { z } from "zod";

const isoCurrencySchema = z.string().trim().min(3).max(3).transform((value) => value.toUpperCase());

export const accountCreateSchema = z.object({
  userId: z.string().trim().min(1),
  nickname: z.string().trim().min(2).max(80),
  type: z.enum(["operating", "wallet", "reserve"]),
  currency: isoCurrencySchema.default("USD"),
});

export const accountUpdateSchema = z
  .object({
    nickname: z.string().trim().min(2).max(80).optional(),
    type: z.enum(["operating", "wallet", "reserve"]).optional(),
    status: z.enum(["active", "pending", "frozen"]).optional(),
    currency: isoCurrencySchema.optional(),
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: "At least one account field must be provided.",
  });

export const transactionFiltersSchema = z.object({
  accountId: z.string().trim().min(1).optional(),
  status: z.enum(["pending", "processing", "settled", "failed"]).optional(),
  type: z
    .enum([
      "deposit",
      "withdrawal",
      "transfer",
      "card_authorization",
      "card_settlement",
      "fee",
    ])
    .optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  limit: z.coerce.number().int().min(1).max(200).optional(),
});

export const transactionCreateSchema = z.object({
  accountId: z.string().trim().min(1),
  direction: z.enum(["credit", "debit"]),
  kind: z.enum([
    "deposit",
    "withdrawal",
    "transfer",
    "card_authorization",
    "card_settlement",
    "fee",
  ]),
  amount: z.coerce.number().positive(),
  currency: isoCurrencySchema.default("USD"),
  status: z.enum(["pending", "processing", "settled", "failed"]).default("settled"),
  description: z.string().trim().min(3).max(140),
  counterparty: z.string().trim().min(2).max(120),
  metadata: z.record(z.string(), z.string()).default({}),
});

export const authPasswordSignInSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(8),
});

export const authMagicLinkSchema = z.object({
  email: z.string().trim().email(),
});

export const authRegisterSchema = z.object({
  fullName: z.string().trim().min(2).max(80),
  companyName: z.string().trim().min(2).max(120),
  email: z.string().trim().email(),
  password: z.string().min(8),
  partnerCode: z.string().trim().max(80).optional(),
});

export function parseSearchParams<T extends z.ZodTypeAny>(
  schema: T,
  searchParams: URLSearchParams,
) {
  return schema.parse(Object.fromEntries(searchParams.entries()));
}
