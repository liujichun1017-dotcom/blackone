import { adminCookie, createAdminSessionToken, verifyAdminCredentials } from "@/lib/auth";
import { NextResponse } from "next/server";
import { appEnv } from "@/lib/env";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const formData = await request.formData();
  const username = String(formData.get("username") ?? "");
  const password = String(formData.get("password") ?? "");

  if (!verifyAdminCredentials(username, password)) {
    return NextResponse.json(
      { ok: false, error: "账号或密码不正确，请检查后重试。" },
      { status: 401 },
    );
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set({
    name: adminCookie.name,
    value: createAdminSessionToken(),
    httpOnly: true,
    sameSite: "lax",
    secure: appEnv.adminCookieSecure,
    path: "/",
    maxAge: adminCookie.maxAge,
  });

  return response;
}
