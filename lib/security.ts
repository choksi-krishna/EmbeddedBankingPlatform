import { createHash, createHmac, randomBytes, randomUUID } from "node:crypto";

import { slugify } from "@/lib/utils";

export function digestValue(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

export function generateId(prefix: string) {
  return `${prefix}-${randomUUID()}`;
}

export function createApiKeyMaterial(partnerName: string) {
  const prefix = `${slugify(partnerName).slice(0, 12) || "partner"}${randomBytes(
    3,
  ).toString("hex")}`;
  const secret = randomBytes(18).toString("hex");
  const rawKey = `baas.${prefix}.${secret}`;

  return {
    prefix,
    rawKey,
    keyHash: digestValue(rawKey),
  };
}

export function createWebhookSecret() {
  return `whsec_${randomBytes(18).toString("hex")}`;
}

export function signWebhookPayload(secret: string, payload: string) {
  return createHmac("sha256", secret).update(payload).digest("hex");
}
