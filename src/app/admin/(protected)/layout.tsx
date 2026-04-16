import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { LogoutButton } from "@/components/admin/logout-button";

export const dynamic = "force-dynamic";

export default async function AdminProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdmin();

  return (
    <div className="min-h-screen px-4 py-4 sm:px-6 sm:py-6">
      <div className="glass-panel mx-auto min-h-[calc(100vh-2rem)] max-w-7xl overflow-hidden rounded-[36px]">
        <header className="flex flex-col gap-6 border-b border-white/8 px-6 py-6 sm:px-8 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="eyebrow w-fit text-[11px] uppercase tracking-[0.24em]">
              Black One Backstage
            </p>
            <h1 className="display-font mt-4 text-3xl text-white">
              NFC 内容运营后台
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/admin"
              className="rounded-full border border-white/12 px-4 py-2 text-sm text-white/78 transition hover:border-[var(--gold)] hover:text-white"
            >
              内容列表
            </Link>
            <Link
              href="/admin/content/new"
              className="metal-button px-4 py-2 text-sm tracking-[0.18em] uppercase"
            >
              新建内容
            </Link>
            <LogoutButton />
          </div>
        </header>

        <main className="px-6 py-6 sm:px-8 sm:py-8">{children}</main>
      </div>
    </div>
  );
}
