import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth";
import { toggleExperience } from "@/lib/experience-service";

export const runtime = "nodejs";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  const { id } = await params;
  toggleExperience(id);

  const referer = request.headers.get("referer") ?? "/admin";
  return NextResponse.redirect(new URL(referer, request.url));
}
