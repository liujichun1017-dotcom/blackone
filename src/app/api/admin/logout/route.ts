import { adminCookie } from "@/lib/auth";
import { NextResponse } from "next/server";
import { appEnv } from "@/lib/env";

export const runtime = "nodejs";

export async function POST() {
  const response = NextResponse.json({ ok: true });
  response.cookies.set({
    name: adminCookie.name,
    value: "",
    httpOnly: true,
    sameSite: "lax",
    secure: appEnv.adminCookieSecure,
    path: "/",
    maxAge: 0,
  });

  return response;
}
