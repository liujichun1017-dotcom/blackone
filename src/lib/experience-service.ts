import path from "node:path";
import { z } from "zod";
import {
  ALLOWED_AUDIO_EXTENSIONS,
  ALLOWED_AUDIO_TYPES,
  MAX_AUDIO_BYTES,
  MAX_COVER_BYTES,
  VISUAL_PRESET_MAP,
} from "@/lib/constants";
import { processAudioUpload } from "@/lib/audio";
import {
  createExperience,
  getExperienceById,
  setExperienceStatus,
  updateExperience,
} from "@/lib/db";
import {
  deleteStorageFile,
  writeStorageFile,
} from "@/lib/storage";
import { clamp, makeContentId, normalizeSlug, parseNumber } from "@/lib/utils";
import type { ExperienceRecord } from "@/types/nfc";

const payloadSchema = z.object({
  name: z.string().trim().min(1, "请输入内容名称。"),
  slug: z.string().trim().default(""),
  quote: z.string().trim().max(80, "文案建议控制在 80 字以内。").default(""),
  visualPreset: z.enum(["static", "breathing", "floating", "flicker"]),
  lineDensity: z.number().min(8).max(64),
  brightnessMin: z.number().min(0.05).max(0.95),
  brightnessMax: z.number().min(0.08).max(1),
  breathCycle: z.number().min(6).max(10),
  revealFrequency: z.number().min(0.1).max(1),
  dynamicIntensity: z.number().min(0.05).max(1),
  status: z.enum(["active", "inactive"]).default("active"),
});

function getFileExtension(file: File) {
  return path.extname(file.name).replace(".", "").toLowerCase();
}

function isPresentFile(file: FormDataEntryValue | null): file is File {
  return file instanceof File && file.size > 0;
}

function parsePayload(formData: FormData) {
  const payload = payloadSchema.parse({
    name: formData.get("name"),
    slug: formData.get("slug") ?? "",
    quote: formData.get("quote") ?? "",
    visualPreset: formData.get("visualPreset"),
    lineDensity: parseNumber(formData.get("lineDensity"), 24),
    brightnessMin: parseNumber(formData.get("brightnessMin"), 0.16),
    brightnessMax: parseNumber(formData.get("brightnessMax"), 0.4),
    breathCycle: parseNumber(formData.get("breathCycle"), 8),
    revealFrequency: parseNumber(formData.get("revealFrequency"), 0.4),
    dynamicIntensity: parseNumber(formData.get("dynamicIntensity"), 0.4),
    status: formData.get("status") ?? "active",
  });

  const brightnessMin = Math.min(payload.brightnessMin, payload.brightnessMax);
  const brightnessMax = Math.max(payload.brightnessMin, payload.brightnessMax);

  return {
    ...payload,
    visualConfig: {
      lineDensity: Math.round(payload.lineDensity),
      brightnessMin: clamp(brightnessMin, 0.05, 0.95),
      brightnessMax: clamp(brightnessMax, 0.08, 1),
      breathCycle: clamp(payload.breathCycle, 6, 10),
      revealFrequency: clamp(payload.revealFrequency, 0.1, 1),
      dynamicIntensity: clamp(payload.dynamicIntensity, 0.05, 1),
    },
  };
}

function validateAudioFile(file: File) {
  const extension = getFileExtension(file);
  if (
    !ALLOWED_AUDIO_EXTENSIONS.has(extension) &&
    !ALLOWED_AUDIO_TYPES.has(file.type)
  ) {
    throw new Error("仅支持 MP3 / WAV / AAC 音频文件。");
  }

  if (file.size > MAX_AUDIO_BYTES) {
    throw new Error("音频文件请控制在 10MB 以内。");
  }
}

function validateCoverFile(file: File) {
  if (!file.type.startsWith("image/")) {
    throw new Error("封面文件需为图片格式。");
  }

  if (file.size > MAX_COVER_BYTES) {
    throw new Error("封面图片请控制在 4MB 以内。");
  }
}

async function saveCoverFile(experienceId: string, file: File) {
  const extension = path.extname(file.name).toLowerCase() || ".jpg";
  const relativePath = `covers/${experienceId}${extension}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeStorageFile(relativePath, buffer);
  return relativePath;
}

function buildInput(
  current: ExperienceRecord | null,
  payload: ReturnType<typeof parsePayload>,
  assets: {
    coverPath: string | null;
    originalAudioPath: string;
    processedAudioPath: string;
    durationSeconds: number;
    analysis: ExperienceRecord["analysis"];
  },
) {
  const now = new Date().toISOString();

  return {
    id: current?.id ?? makeContentId(),
    slug: normalizeSlug(payload.slug || current?.slug || payload.name),
    name: payload.name,
    quote: payload.quote,
    coverPath: assets.coverPath,
    originalAudioPath: assets.originalAudioPath,
    processedAudioPath: assets.processedAudioPath,
    durationSeconds: assets.durationSeconds,
    analysis: assets.analysis,
    visualPreset: payload.visualPreset,
    visualConfig: payload.visualConfig,
    status: payload.status,
    createdAt: current?.createdAt ?? now,
    updatedAt: now,
  } satisfies Omit<ExperienceRecord, "visitCount" | "lastVisitedAt">;
}

export async function createExperienceFromForm(formData: FormData) {
  const payload = parsePayload(formData);
  const audioFile = formData.get("audio");
  const coverFile = formData.get("cover");

  if (!isPresentFile(audioFile)) {
    throw new Error("请先上传音频文件。");
  }

  validateAudioFile(audioFile);
  const recordId = makeContentId();

  const audioAsset = await processAudioUpload({
    experienceId: recordId,
    originalFileName: audioFile.name,
    buffer: Buffer.from(await audioFile.arrayBuffer()),
  });

  let coverPath: string | null = null;
  if (isPresentFile(coverFile)) {
    validateCoverFile(coverFile);
    coverPath = await saveCoverFile(recordId, coverFile);
  }

  const created = createExperience(
    buildInput(null, payload, {
      coverPath,
      originalAudioPath: audioAsset.originalPath,
      processedAudioPath: audioAsset.processedPath,
      durationSeconds: audioAsset.durationSeconds,
      analysis: audioAsset.analysis,
    }),
  );

  return created;
}

export async function updateExperienceFromForm(id: string, formData: FormData) {
  const current = getExperienceById(id);

  if (!current) {
    throw new Error("未找到要编辑的内容。");
  }

  const payload = parsePayload(formData);
  const audioFile = formData.get("audio");
  const coverFile = formData.get("cover");
  const removeCover = formData.get("removeCover") === "true";

  let nextOriginalAudioPath = current.originalAudioPath;
  let nextProcessedAudioPath = current.processedAudioPath;
  let nextDurationSeconds = current.durationSeconds;
  let nextAnalysis = current.analysis;
  let nextCoverPath = current.coverPath;

  if (isPresentFile(audioFile)) {
    validateAudioFile(audioFile);
    const audioAsset = await processAudioUpload({
      experienceId: current.id,
      originalFileName: audioFile.name,
      buffer: Buffer.from(await audioFile.arrayBuffer()),
    });

    nextOriginalAudioPath = audioAsset.originalPath;
    nextProcessedAudioPath = audioAsset.processedPath;
    nextDurationSeconds = audioAsset.durationSeconds;
    nextAnalysis = audioAsset.analysis;
  }

  if (removeCover && current.coverPath) {
    await deleteStorageFile(current.coverPath);
    nextCoverPath = null;
  }

  if (isPresentFile(coverFile)) {
    validateCoverFile(coverFile);
    if (current.coverPath) {
      await deleteStorageFile(current.coverPath);
    }
    nextCoverPath = await saveCoverFile(current.id, coverFile);
  }

  const updated = updateExperience(
    id,
    buildInput(current, payload, {
      coverPath: nextCoverPath,
      originalAudioPath: nextOriginalAudioPath,
      processedAudioPath: nextProcessedAudioPath,
      durationSeconds: nextDurationSeconds,
      analysis: nextAnalysis,
    }),
  );

  return updated;
}

export function toggleExperience(id: string) {
  const current = getExperienceById(id);
  if (!current) {
    throw new Error("内容不存在。");
  }

  return setExperienceStatus(id, current.status === "active" ? "inactive" : "active");
}

export function getPresetDefaults(preset: ExperienceRecord["visualPreset"]) {
  return VISUAL_PRESET_MAP[preset];
}
