import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth";
import { toggleExperience } from "@/lib/experience-service";

export const runtime = "nodejs";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ ok: false, error: "未登录或会话已过期。" }, { status: 401 });
  }

  const { id } = await params;
  const experience = toggleExperience(id);
  return NextResponse.json({ ok: true, experience });
}
