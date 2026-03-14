import { NextRequest, NextResponse } from "next/server";

import { resolveApiActor } from "@/lib/api-auth";
import { createTransfer, listTransfers } from "@/lib/services/platform";

export async function GET(request: NextRequest) {
  const actor = await resolveApiActor(request);
  if (!actor) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return NextResponse.json({ transfers: await listTransfers(actor) });
}

export async function POST(request: NextRequest) {
  const actor = await resolveApiActor(request);
  if (!actor) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const transfer = await createTransfer(actor, {
      sourceAccountId: body.sourceAccountId,
      destinationAccountId: body.destinationAccountId,
      amount: Number(body.amount),
      currency: body.currency ?? "USD",
      rail: body.rail ?? "ach",
      externalReference: body.externalReference,
    });
    return NextResponse.json({ transfer }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to create transfer." },
      { status: 400 },
    );
  }
}
