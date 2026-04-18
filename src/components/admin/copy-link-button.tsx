"use client";

import { useState } from "react";

export function CopyLinkButton({ slug }: { slug: string }) {
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");

  function fallbackCopy(text: string) {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.setAttribute("readonly", "true");
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    textarea.select();

    const succeeded = document.execCommand("copy");
    document.body.removeChild(textarea);
    return succeeded;
  }

  async function handleCopy() {
    const url = `${window.location.origin}/nfc/${slug}`;
    setError("");

    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(url);
      } else if (!fallbackCopy(url)) {
        throw new Error("copy-failed");
      }

      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      const copiedByFallback = fallbackCopy(url);
      if (copiedByFallback) {
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1500);
        return;
      }

      setError(url);
      window.prompt("复制这个链接", url);
    }
  }

  return (
    <div className="flex flex-col items-start gap-2">
      <button
        type="button"
        onClick={handleCopy}
        className="rounded-full border border-white/12 px-4 py-2 text-sm text-white/76 transition hover:border-[var(--gold)] hover:text-white"
      >
        {copied ? "链接已复制" : "复制链接"}
      </button>
      {error ? (
        <p className="max-w-56 break-all text-xs text-[var(--gold)]">{error}</p>
      ) : null}
    </div>
  );
}
