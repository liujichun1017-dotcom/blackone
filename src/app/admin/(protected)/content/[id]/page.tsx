import { notFound } from "next/navigation";
import { ContentForm } from "@/components/admin/content-form";
import { getExperienceById } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function EditContentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const experience = getExperienceById(id);

  if (!experience) {
    notFound();
  }

  return <ContentForm mode="edit" experience={experience} />;
}
