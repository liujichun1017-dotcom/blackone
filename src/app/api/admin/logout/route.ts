import { adminCookie } from "@/lib/auth";
import { redirectRelative } from "@/lib/redirect";

export const runtime = "nodejs";

export async function POST() {
  const response = redirectRelative("/admin/login");
  response.cookies.set({
    name: adminCookie.name,
    value: "",
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });

  return response;
}
