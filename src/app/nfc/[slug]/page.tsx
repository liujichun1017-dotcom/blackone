import { notFound } from "next/navigation";
import { ExperiencePlayer } from "@/components/experience/experience-player";
import { getExperienceBySlug } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const experience = getExperienceBySlug(slug);

  return {
    title: experience ? `${experience.name} | Black One` : "Black One",
    description: experience?.quote ?? "NFC 触发的自然记忆体验页。",
  };
}

export default async function NfcExperiencePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const experience = getExperienceBySlug(slug);

  if (!experience) {
    notFound();
  }

  if (experience.status !== "active") {
    return (
      <main className="flex min-h-screen items-center justify-center px-6 py-10">
        <div className="glass-panel max-w-xl rounded-[32px] p-8 text-center">
          <div className="eyebrow mx-auto w-fit text-[11px] uppercase tracking-[0.24em]">
            Link Disabled
          </div>
          <h1 className="display-font mt-6 text-4xl text-white">这段自然记忆暂时休眠了</h1>
          <p className="mt-4 text-sm leading-7 text-white/58">
            当前链接已被后台停用。你仍然拿着这件物件，但它暂时不再对外播放这段声音。
          </p>
        </div>
      </main>
    );
  }

  return <ExperiencePlayer experience={experience} />;
}
