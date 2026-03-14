import { z } from "zod";

export const SubmitKycSchema = z.object({
  doc_type: z.enum([
    "passport",
    "drivers_license",
    "national_id",
    "utility_bill",
    "business_registration",
  ]),
});
