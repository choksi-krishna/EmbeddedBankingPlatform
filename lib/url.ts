import type { NextRequest } from "next/server";

export function buildRequestUrl(
  request: NextRequest,
  pathname: string,
  searchParams?: Record<string, string | null | undefined>,
) {
  const url = request.nextUrl.clone();
  const host = request.headers.get("host");
  const forwardedProto = request.headers.get("x-forwarded-proto");

  if (host) {
    url.host = host;
  }

  if (forwardedProto) {
    url.protocol = `${forwardedProto}:`;
  }

  url.pathname = pathname;
  url.search = "";

  if (searchParams) {
    for (const [key, value] of Object.entries(searchParams)) {
      if (value) {
        url.searchParams.set(key, value);
      }
    }
  }

  return url;
}
