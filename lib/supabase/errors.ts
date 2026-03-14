function collectErrorMessages(error: unknown): string[] {
  const messages: string[] = [];

  if (error instanceof Error) {
    messages.push(error.message);
    const cause = (error as Error & { cause?: unknown }).cause;
    if (cause instanceof Error) {
      messages.push(cause.message);
    } else if (typeof cause === "string") {
      messages.push(cause);
    }
  } else if (typeof error === "string") {
    messages.push(error);
  }

  if (error && typeof error === "object") {
    const details = error as {
      code?: unknown;
      error_code?: unknown;
      status?: unknown;
      name?: unknown;
    };

    if (typeof details.code === "string") {
      messages.push(details.code);
    }

    if (typeof details.error_code === "string") {
      messages.push(details.error_code);
    }

    if (typeof details.name === "string") {
      messages.push(details.name);
    }

    if (typeof details.status === "number") {
      messages.push(String(details.status));
    }
  }

  return messages.map((message) => message.toLowerCase());
}

export function isSupabaseServiceUnavailableError(error: unknown) {
  const messages = collectErrorMessages(error);

  return messages.some((message) =>
    [
      "timed out",
      "fetch failed",
      "failed to fetch",
      "unexpected token <",
      "web server is down",
      "eai_again",
      "enotfound",
      "econnreset",
      "521",
      "429",
      "bad gateway",
      "service unavailable",
      "too many requests",
      "rate limit",
      "limit exceeded",
      "quota",
      "over_",
    ].some((pattern) => message.includes(pattern)),
  );
}
