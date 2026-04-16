import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { appEnv } from "@/lib/env";

const COOKIE_NAME = "blackone_admin_session";
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 14;

function signValue(value: string) {
  return createHmac("sha256", appEnv.sessionSecret).update(value).digest("hex");
}

export function createAdminSessionToken() {
  const expiresAt = Date.now() + SESSION_TTL_SECONDS * 1000;
  const payload = `${appEnv.adminUsername}.${expiresAt}`;
  const encoded = Buffer.from(payload).toString("base64url");
  const signature = signValue(encoded);

  return `${encoded}.${signature}`;
}

export function verifyAdminSessionToken(token: string) {
  const [encoded, signature] = token.split(".");
  if (!encoded || !signature) {
    return false;
  }

  const expected = signValue(encoded);
  const providedBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);

  if (providedBuffer.length !== expectedBuffer.length) {
    return false;
  }

  if (!timingSafeEqual(providedBuffer, expectedBuffer)) {
    return false;
  }

  const decoded = Buffer.from(encoded, "base64url").toString("utf8");
  const [username, expiresAt] = decoded.split(".");

  return username === appEnv.adminUsername && Number(expiresAt) > Date.now();
}

export function verifyAdminCredentials(username: string, password: string) {
  return (
    username === appEnv.adminUsername && password === appEnv.adminPassword
  );
}

export async function isAdminAuthenticated() {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  return token ? verifyAdminSessionToken(token) : false;
}

export async function requireAdmin() {
  const authenticated = await isAdminAuthenticated();
  if (!authenticated) {
    redirect("/admin/login");
  }
}

export const adminCookie = {
  name: COOKIE_NAME,
  maxAge: SESSION_TTL_SECONDS,
};
