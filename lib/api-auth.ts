import type { NextRequest } from "next/server";

import { getViewer, verifyApiKey } from "@/lib/services/platform";

export async function resolveApiActor(request: NextRequest) {
  const authorization = request.headers.get("authorization");
  const headerApiKey = request.headers.get("x-api-key");
  const bearer =
    authorization?.startsWith("Bearer ") ? authorization.slice(7) : null;
  const apiKey = headerApiKey ?? bearer;

  if (apiKey) {
    return verifyApiKey(apiKey);
  }

  return getViewer();
}
