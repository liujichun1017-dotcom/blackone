export type VisualPreset = "static" | "breathing" | "floating" | "flicker";

export type ExperienceStatus = "active" | "inactive";

export interface VisualConfig {
  lineDensity: number;
  brightnessMin: number;
  brightnessMax: number;
  breathCycle: number;
  revealFrequency: number;
  dynamicIntensity: number;
}

export interface AudioAnalysis {
  sampleRate: number;
  frameCount: number;
  durationSeconds: number;
  amplitudeFrames: number[];
  spectrumFrames: number[][];
  bandLabels: string[];
}

export interface ExperienceRecord {
  id: string;
  slug: string;
  name: string;
  quote: string;
  coverPath: string | null;
  originalAudioPath: string;
  processedAudioPath: string;
  durationSeconds: number;
  analysis: AudioAnalysis;
  visualPreset: VisualPreset;
  visualConfig: VisualConfig;
  status: ExperienceStatus;
  visitCount: number;
  lastVisitedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface DashboardMetrics {
  totalContents: number;
  activeContents: number;
  totalVisits: number;
  todayVisits: number;
}
