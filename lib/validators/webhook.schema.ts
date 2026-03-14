import { z } from "zod";

export const RegisterWebhookSchema = z.object({
  url: z.string().url().refine((value) => value.startsWith("https://"), {
    message: "Webhook URLs must start with https://",
  }),
  events: z.array(z.string().min(1)).min(1),
  secret: z.string().min(16),
});
