import { notFound, redirect } from "next/navigation";
import { findExperienceByIdOrSlug } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function ExperienceRedirectPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>;
}) {
  const params = await searchParams;
  const id = params.id?.trim();

  if (!id) {
    redirect("/");
  }

  const experience = findExperienceByIdOrSlug(id);
  if (!experience) {
    notFound();
  }

  redirect(`/nfc/${experience.slug}`);
}
