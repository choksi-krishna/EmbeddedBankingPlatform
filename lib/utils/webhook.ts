import { createHmac } from "node:crypto";

export function signPayload(secret: string, payload: string) {
  return createHmac("sha256", secret).update(payload).digest("hex");
}

export async function dispatchWebhook(input: {
  url: string;
  event: string;
  payload: Record<string, unknown>;
  secret: string;
}) {
  const body = JSON.stringify(input.payload);
  const signature = signPayload(input.secret, body);

  return fetch(input.url, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-baas-event": input.event,
      "x-baas-signature": signature,
    },
    body,
  });
}
