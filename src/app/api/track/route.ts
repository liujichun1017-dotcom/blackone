import { NextResponse } from "next/server";
import { getExperienceBySlug, insertVisit } from "@/lib/db";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const body = (await request.json()) as { slug?: string };
  const slug = body.slug?.trim();

  if (!slug) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const experience = getExperienceBySlug(slug);
  if (!experience || experience.status !== "active") {
    return NextResponse.json({ ok: false }, { status: 404 });
  }

  insertVisit({
    experienceId: experience.id,
    referrer: request.headers.get("referer"),
    userAgent: request.headers.get("user-agent"),
    ipAddress: request.headers.get("x-forwarded-for"),
  });

  return NextResponse.json({ ok: true });
}
