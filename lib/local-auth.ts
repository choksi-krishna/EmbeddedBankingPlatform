import type { NextRequest } from "next/server";

import { env } from "@/lib/env";

export const LOCAL_DEMO_SESSION_COOKIE = "embeddyfi_local_demo_session";

export function canUseLocalDemoAuth() {
  return /localhost|127\.0\.0\.1/.test(env.appUrl);
}

export function hasLocalDemoSession(request: NextRequest) {
  return request.cookies.get(LOCAL_DEMO_SESSION_COOKIE)?.value === "mock";
}
