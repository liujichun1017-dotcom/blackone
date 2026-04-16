import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth";
import { createExperienceFromForm } from "@/lib/experience-service";

export const runtime = "nodejs";

function toMessage(error: unknown) {
  const message = error instanceof Error ? error.message : "保存失败，请稍后重试。";
  if (message.includes("UNIQUE constraint failed: experiences.slug")) {
    return "链接标识重复了，请换一个 slug / 编号。";
  }
  return message;
}

export async function POST(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "未登录或会话已过期。" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const experience = await createExperienceFromForm(formData);
    return NextResponse.json({ experience });
  } catch (error) {
    return NextResponse.json({ error: toMessage(error) }, { status: 400 });
  }
}
