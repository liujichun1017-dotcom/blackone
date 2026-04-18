import { isAdminAuthenticated } from "@/lib/auth";
import { toggleExperience } from "@/lib/experience-service";
import { getRelativeReferer, redirectRelative } from "@/lib/redirect";

export const runtime = "nodejs";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await isAdminAuthenticated())) {
    return redirectRelative("/admin/login");
  }

  const { id } = await params;
  toggleExperience(id);

  const referer = getRelativeReferer(request.headers.get("referer"));
  return redirectRelative(referer);
}
