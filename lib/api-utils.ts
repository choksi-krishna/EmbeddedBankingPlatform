import { NextResponse } from "next/server";
import { ZodError } from "zod";

export function apiError(error: unknown, fallbackMessage: string, status = 400) {
  if (error instanceof ZodError) {
    return NextResponse.json(
      {
        error: "Validation failed.",
        issues: error.flatten(),
      },
      { status: 422 },
    );
  }

  return NextResponse.json(
    {
      error: error instanceof Error ? error.message : fallbackMessage,
    },
    { status },
  );
}
