"use client";

export function LogoutButton() {
  return (
    <form action="/api/admin/logout" method="post">
      <button
        type="submit"
        className="rounded-full border border-white/12 px-4 py-2 text-sm text-white/78 transition hover:border-[var(--gold)] hover:text-white"
      >
        退出后台
      </button>
    </form>
  );
}
