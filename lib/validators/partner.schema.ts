import { z } from "zod";

export const OnboardPartnerSchema = z.object({
  name: z.string().min(2),
  tier: z.enum(["starter", "growth", "enterprise"]),
  config: z.record(z.string(), z.unknown()).optional(),
});
