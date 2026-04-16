import { NextResponse } from "next/server";
import { getExperienceById } from "@/lib/db";
import { isAdminAuthenticated } from "@/lib/auth";
import { updateExperienceFromForm } from "@/lib/experience-service";

export const runtime = "nodejs";

function toMessage(error: unknown) {
  const message = error instanceof Error ? error.message : "保存失败，请稍后重试。";
  if (message.includes("UNIQUE constraint failed: experiences.slug")) {
    return "链接标识重复了，请换一个 slug / 编号。";
  }
  return message;
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "未登录或会话已过期。" }, { status: 401 });
  }

  const { id } = await params;
  const experience = getExperienceById(id);
  if (!experience) {
    return NextResponse.json({ error: "内容不存在。" }, { status: 404 });
  }

  return NextResponse.json({ experience });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "未登录或会话已过期。" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const { id } = await params;
    const experience = await updateExperienceFromForm(id, formData);
    return NextResponse.json({ experience });
  } catch (error) {
    return NextResponse.json({ error: toMessage(error) }, { status: 400 });
  }
}
