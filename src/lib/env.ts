export const appEnv = {
  siteName: process.env.NEXT_PUBLIC_SITE_NAME ?? "Black One",
  siteUrl:
    process.env.SITE_URL ??
    process.env.NEXT_PUBLIC_SITE_URL ??
    "http://localhost:3000",
  sessionSecret:
    process.env.SESSION_SECRET ??
    "replace-this-before-production-blackone-session-secret",
  adminUsername: process.env.ADMIN_USERNAME ?? "operator",
  adminPassword: process.env.ADMIN_PASSWORD ?? "change-me-now",
};
