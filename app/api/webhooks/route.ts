import { NextRequest, NextResponse } from "next/server";

import { resolveApiActor } from "@/lib/api-auth";
import { listWebhooks, registerWebhook } from "@/lib/services/platform";

export async function GET(request: NextRequest) {
  const actor = await resolveApiActor(request);
  if (!actor) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return NextResponse.json({ webhooks: await listWebhooks(actor) });
}

export async function POST(request: NextRequest) {
  const actor = await resolveApiActor(request);
  if (!actor) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const webhook = await registerWebhook(actor, {
      url: body.url,
      events: body.events,
    });
    return NextResponse.json({ webhook }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to register webhook." },
      { status: 400 },
    );
  }
}
