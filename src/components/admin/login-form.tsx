"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

export function LoginForm() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    const formData = new FormData(event.currentTarget);

    startTransition(async () => {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        body: formData,
      });

      const payload = (await response.json().catch(() => ({}))) as {
        ok?: boolean;
        error?: string;
      };

      if (!response.ok || !payload.ok) {
        setError(payload.error ?? "账号或密码不正确，请检查后重试。");
        return;
      }

      router.replace("/admin");
      router.refresh();
    });
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 space-y-5">
      <label className="block space-y-3">
        <span className="text-sm text-white">后台账号</span>
        <input
          name="username"
          className="input-shell w-full px-5 py-4 text-white outline-none"
          placeholder="operator"
          required
        />
      </label>
      <label className="block space-y-3">
        <span className="text-sm text-white">后台密码</span>
        <input
          type="password"
          name="password"
          className="input-shell w-full px-5 py-4 text-white outline-none"
          placeholder="••••••••"
          required
        />
      </label>

      {error ? (
        <div className="rounded-[20px] border border-red-400/24 bg-red-500/8 px-4 py-3 text-sm text-red-200">
          {error}
        </div>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="metal-button mt-4 w-full px-6 py-4 text-sm tracking-[0.2em] uppercase disabled:opacity-60"
      >
        {pending ? "登录中…" : "进入后台"}
      </button>
    </form>
  );
}
