import { customAlphabet } from "nanoid";
import slugify from "slugify";

const shortId = customAlphabet("1234567890abcdefghijklmnopqrstuvwxyz", 8);

export function formatDateTime(input: string | null) {
  if (!input) {
    return "暂未访问";
  }

  return new Intl.DateTimeFormat("zh-CN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(input));
}

export function formatDuration(seconds: number) {
  const totalSeconds = Math.max(0, Math.round(seconds));
  const minutes = Math.floor(totalSeconds / 60)
    .toString()
    .padStart(2, "0");
  const remain = (totalSeconds % 60).toString().padStart(2, "0");

  return `${minutes}:${remain}`;
}

export function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export function normalizeSlug(value: string, fallbackSeed?: string) {
  const trimmed = value.trim().toLowerCase();
  const latinSlug = slugify(trimmed, { lower: true, strict: true, locale: "zh" });
  const cleaned = trimmed.replace(/[^a-z0-9-_]/gi, "");
  const finalSlug = latinSlug || cleaned || fallbackSeed || shortId();
  return finalSlug.slice(0, 42);
}

export function makeContentId() {
  return `exp_${shortId()}`;
}

export function parseNumber(input: FormDataEntryValue | null, fallback: number) {
  const raw = typeof input === "string" ? Number(input) : Number.NaN;
  return Number.isFinite(raw) ? raw : fallback;
}
