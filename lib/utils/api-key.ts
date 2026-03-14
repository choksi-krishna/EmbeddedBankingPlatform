import { createHash, randomBytes } from "node:crypto";

export function hashApiKey(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

export function generateApiKey(isSandbox: boolean) {
  const prefix = isSandbox ? "baas_test_" : "baas_live_";
  const raw = `${prefix}${randomBytes(32).toString("hex")}`;

  return {
    raw,
    hash: hashApiKey(raw),
  };
}
