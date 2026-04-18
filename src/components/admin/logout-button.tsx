"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";

export function LogoutButton() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  async function handleLogout() {
    startTransition(async () => {
      await fetch("/api/admin/logout", {
        method: "POST",
      });
      router.replace("/admin/login");
      router.refresh();
    });
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={pending}
      className="rounded-full border border-white/12 px-4 py-2 text-sm text-white/78 transition hover:border-[var(--gold)] hover:text-white disabled:opacity-60"
    >
      {pending ? "退出中…" : "退出后台"}
    </button>
  );
}
