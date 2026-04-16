"use client";

import { useState } from "react";

export function CopyLinkButton({ slug }: { slug: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    const url = `${window.location.origin}/nfc/${slug}`;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="rounded-full border border-white/12 px-4 py-2 text-sm text-white/76 transition hover:border-[var(--gold)] hover:text-white"
    >
      {copied ? "链接已复制" : "复制链接"}
    </button>
  );
}
