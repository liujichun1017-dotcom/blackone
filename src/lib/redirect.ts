import { NextResponse } from "next/server";

export function redirectRelative(location: string, status = 303) {
  return new NextResponse(null, {
    status,
    headers: {
      Location: location,
    },
  });
}

export function getRelativeReferer(referer: string | null, fallback = "/admin") {
  if (!referer) {
    return fallback;
  }

  try {
    const parsed = new URL(referer);
    return `${parsed.pathname}${parsed.search}${parsed.hash}` || fallback;
  } catch {
    return fallback;
  }
}
