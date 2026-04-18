"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";

export function ToggleStatusButton({
  id,
  status,
}: {
  id: string;
  status: "active" | "inactive";
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  async function handleClick() {
    startTransition(async () => {
      await fetch(`/api/admin/content/${id}/toggle`, {
        method: "POST",
      });
      router.refresh();
    });
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={pending}
      className="rounded-full border border-white/12 px-4 py-2 text-sm text-white/74 transition hover:border-white/28 hover:text-white disabled:opacity-60"
    >
      {pending
        ? "处理中…"
        : status === "active"
          ? "停用链接"
          : "重新启用"}
    </button>
  );
}
