import Image from "next/image";
import Link from "next/link";
import { CopyLinkButton } from "@/components/admin/copy-link-button";
import { QrPreview } from "@/components/admin/qr-preview";
import { getDashboardMetrics, listExperiences } from "@/lib/db";
import { formatDateTime, formatDuration } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default function AdminDashboardPage() {
  const metrics = getDashboardMetrics();
  const experiences = listExperiences();

  return (
    <div className="space-y-8">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          ["内容总数", metrics.totalContents],
          ["启用中链接", metrics.activeContents],
          ["累计访问", metrics.totalVisits],
          ["今日访问", metrics.todayVisits],
        ].map(([label, value]) => (
          <div key={label} className="glass-panel rounded-[28px] p-5">
            <p className="text-xs uppercase tracking-[0.24em] text-white/42">{label}</p>
            <p className="mt-4 text-3xl text-white">{value}</p>
          </div>
        ))}
      </section>

      <section className="glass-panel rounded-[32px] p-6">
        <div className="flex flex-col gap-4 border-b border-white/8 pb-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="eyebrow w-fit text-[11px] uppercase tracking-[0.24em]">
              Content Units
            </p>
            <h2 className="display-font mt-4 text-3xl text-white">所有自然记忆单元</h2>
            <p className="mt-3 text-sm leading-7 text-white/56">
              每一个条目都能独立生成 URL，用于 NFC 写入、二维码分发或单独访问。
            </p>
          </div>
          <Link
            href="/admin/content/new"
            className="metal-button inline-flex w-fit px-5 py-3 text-sm tracking-[0.18em] uppercase"
          >
            创建新内容
          </Link>
        </div>

        {experiences.length === 0 ? (
          <div className="mt-8 rounded-[28px] border border-dashed border-white/10 px-6 py-10 text-center">
            <p className="display-font text-2xl text-white">还没有内容单元</p>
            <p className="mt-3 text-sm leading-7 text-white/56">
              先上传一段自然音频，再给它一个编号和视觉节奏，这套系统就会为它生成独立链接。
            </p>
          </div>
        ) : (
          <div className="mt-8 grid gap-5">
            {experiences.map((experience) => (
              <article
                key={experience.id}
                className="rounded-[30px] border border-white/8 bg-white/3 p-5"
              >
                <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
                  <div className="flex min-w-0 flex-1 gap-5">
                    <div className="flex h-28 w-24 shrink-0 overflow-hidden rounded-[20px] border border-white/8 bg-[radial-gradient(circle_at_50%_20%,rgba(216,185,141,0.18),transparent_28%),linear-gradient(180deg,#0d1727,#070b12)]">
                      {experience.coverPath ? (
                        <Image
                          src={`/media/${experience.coverPath}`}
                          alt={experience.name}
                          width={96}
                          height={112}
                          unoptimized
                          className="h-full w-full object-cover"
                        />
                      ) : null}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-3">
                        <h3 className="display-font truncate text-2xl text-white">
                          {experience.name}
                        </h3>
                        <span
                          className={`rounded-full px-3 py-1 text-xs uppercase tracking-[0.2em] ${
                            experience.status === "active"
                              ? "bg-emerald-500/14 text-emerald-100"
                              : "bg-white/8 text-white/54"
                          }`}
                        >
                          {experience.status === "active" ? "启用中" : "已停用"}
                        </span>
                      </div>

                      <p className="mt-3 text-sm text-[var(--gold)]">{`/nfc/${experience.slug}`}</p>
                      <p className="mt-3 max-w-2xl text-sm leading-7 text-white/58">
                        {experience.quote || "尚未填写短句文案。"}
                      </p>

                      <div className="mt-5 grid gap-3 text-xs text-white/48 sm:grid-cols-2 xl:grid-cols-4">
                        <div className="rounded-full border border-white/8 px-4 py-3">
                          模板：{
                            {
                              static: "静态型",
                              breathing: "呼吸型",
                              floating: "漂浮型",
                              flicker: "明灭型",
                            }[experience.visualPreset]
                          }
                        </div>
                        <div className="rounded-full border border-white/8 px-4 py-3">
                          音频时长：{formatDuration(experience.durationSeconds)}
                        </div>
                        <div className="rounded-full border border-white/8 px-4 py-3">
                          总访问：{experience.visitCount}
                        </div>
                        <div className="rounded-full border border-white/8 px-4 py-3">
                          最近访问：{formatDateTime(experience.lastVisitedAt)}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 xl:justify-end">
                    <Link
                      href={`/admin/content/${experience.id}`}
                      className="metal-button px-4 py-2 text-sm tracking-[0.18em] uppercase"
                    >
                      编辑
                    </Link>
                    <CopyLinkButton slug={experience.slug} />
                    <QrPreview slug={experience.slug} />
                    <form
                      action={`/api/admin/content/${experience.id}/toggle`}
                      method="post"
                    >
                      <button
                        type="submit"
                        className="rounded-full border border-white/12 px-4 py-2 text-sm text-white/74 transition hover:border-white/28 hover:text-white"
                      >
                        {experience.status === "active" ? "停用链接" : "重新启用"}
                      </button>
                    </form>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
