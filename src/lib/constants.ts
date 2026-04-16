import type { VisualConfig, VisualPreset } from "@/types/nfc";

export const MAX_AUDIO_BYTES = 10 * 1024 * 1024;
export const MAX_COVER_BYTES = 4 * 1024 * 1024;

export const ALLOWED_AUDIO_EXTENSIONS = new Set(["mp3", "wav", "aac", "m4a"]);
export const ALLOWED_AUDIO_TYPES = new Set([
  "audio/mpeg",
  "audio/mp3",
  "audio/wav",
  "audio/x-wav",
  "audio/wave",
  "audio/aac",
  "audio/x-aac",
  "audio/mp4",
  "audio/m4a",
  "audio/x-m4a",
]);

export const ANALYSIS_BANDS = [80, 160, 320, 640, 1280, 2560];
export const ANALYSIS_LABELS = ["Deep", "Low", "Warm", "Body", "Air", "Mist"];

export const VISUAL_PRESET_OPTIONS: Array<{
  value: VisualPreset;
  label: string;
  description: string;
  defaults: VisualConfig;
}> = [
  {
    value: "static",
    label: "静态型",
    description: "留白更多，适合更安静的自然环境与冥想场景。",
    defaults: {
      lineDensity: 18,
      brightnessMin: 0.16,
      brightnessMax: 0.28,
      breathCycle: 10,
      revealFrequency: 0.22,
      dynamicIntensity: 0.18,
    },
  },
  {
    value: "breathing",
    label: "呼吸型",
    description: "围绕 6-10 秒呼吸周期推进，适合温和脉冲感。",
    defaults: {
      lineDensity: 28,
      brightnessMin: 0.18,
      brightnessMax: 0.44,
      breathCycle: 8,
      revealFrequency: 0.36,
      dynamicIntensity: 0.36,
    },
  },
  {
    value: "floating",
    label: "漂浮型",
    description: "层层漂移更明显，适合云、雾、山谷或空域主题。",
    defaults: {
      lineDensity: 34,
      brightnessMin: 0.16,
      brightnessMax: 0.38,
      breathCycle: 9,
      revealFrequency: 0.48,
      dynamicIntensity: 0.52,
    },
  },
  {
    value: "flicker",
    label: "明灭型",
    description: "光感更强，适合夜、水面、火光、星空等主题。",
    defaults: {
      lineDensity: 40,
      brightnessMin: 0.12,
      brightnessMax: 0.52,
      breathCycle: 6,
      revealFrequency: 0.72,
      dynamicIntensity: 0.7,
    },
  },
];

export const VISUAL_PRESET_MAP = Object.fromEntries(
  VISUAL_PRESET_OPTIONS.map((option) => [option.value, option]),
) as Record<
  VisualPreset,
  (typeof VISUAL_PRESET_OPTIONS)[number]
>;
