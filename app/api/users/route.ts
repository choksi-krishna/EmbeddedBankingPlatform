import { NextRequest, NextResponse } from "next/server";

import { resolveApiActor } from "@/lib/api-auth";
import { inviteUser, listUsers } from "@/lib/services/platform";

export async function GET(request: NextRequest) {
  const actor = await resolveApiActor(request);
  if (!actor) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return NextResponse.json({ users: await listUsers(actor) });
}

export async function POST(request: NextRequest) {
  const actor = await resolveApiActor(request);
  if (!actor) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const user = await inviteUser(actor, {
      email: body.email,
      fullName: body.fullName,
      role: body.role,
    });
    return NextResponse.json({ user }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to invite user." },
      { status: 400 },
    );
  }
}
