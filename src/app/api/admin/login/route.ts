import { adminCookie, createAdminSessionToken, verifyAdminCredentials } from "@/lib/auth";
import { redirectRelative } from "@/lib/redirect";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const formData = await request.formData();
  const username = String(formData.get("username") ?? "");
  const password = String(formData.get("password") ?? "");

  if (!verifyAdminCredentials(username, password)) {
    return redirectRelative("/admin/login?error=1");
  }

  const response = redirectRelative("/admin");
  response.cookies.set({
    name: adminCookie.name,
    value: createAdminSessionToken(),
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: adminCookie.maxAge,
  });

  return response;
}
