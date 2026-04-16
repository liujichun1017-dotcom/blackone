import path from "node:path";
import { spawn } from "node:child_process";
import { ANALYSIS_BANDS, ANALYSIS_LABELS } from "@/lib/constants";
import { resolveStoragePath, writeStorageFile } from "@/lib/storage";
import type { AudioAnalysis } from "@/types/nfc";

const OUTPUT_SAMPLE_RATE = 22_050;

function runBinary(command: string, args: string[]) {
  return new Promise<Buffer>((resolve, reject) => {
    const child = spawn(command, args, {
      stdio: ["ignore", "pipe", "pipe"],
    });

    const stdoutChunks: Buffer[] = [];
    let stderr = "";

    child.stdout.on("data", (chunk) => {
      stdoutChunks.push(Buffer.from(chunk));
    });

    child.stderr.setEncoding("utf8");
    child.stderr.on("data", (chunk) => {
      stderr += chunk;
    });

    child.on("error", (error) => {
      reject(error);
    });

    child.on("close", (code) => {
      if (code !== 0) {
        reject(new Error(stderr || `${command} exited with code ${code}`));
        return;
      }

      resolve(Buffer.concat(stdoutChunks));
    });
  });
}

function normalizeSeries(values: number[]) {
  const maxValue = Math.max(...values, 0);
  if (maxValue <= 0) {
    return values.map(() => 0);
  }

  return values.map((value) => Number((value / maxValue).toFixed(4)));
}

function goertzel(window: Float32Array, sampleRate: number, targetFrequency: number) {
  const omega = (2 * Math.PI * targetFrequency) / sampleRate;
  const coefficient = 2 * Math.cos(omega);
  let previous = 0;
  let previous2 = 0;

  for (let index = 0; index < window.length; index += 1) {
    const current = window[index] + coefficient * previous - previous2;
    previous2 = previous;
    previous = current;
  }

  const power = previous2 ** 2 + previous ** 2 - coefficient * previous * previous2;
  return Math.sqrt(Math.max(power, 0) / Math.max(window.length, 1));
}

function analyseSamples(samples: Float32Array, durationSeconds: number): AudioAnalysis {
  const frameCount = Math.max(96, Math.min(240, Math.round(durationSeconds * 2.5)));
  const frameSize = Math.max(1024, Math.floor(samples.length / frameCount));
  const amplitudeFrames: number[] = [];
  const spectrumFrames: number[][] = [];

  for (let frameIndex = 0; frameIndex < frameCount; frameIndex += 1) {
    const start = frameIndex * frameSize;
    const end = Math.min(samples.length, start + frameSize);
    const slice = samples.subarray(start, end);

    let sumSquares = 0;
    for (let index = 0; index < slice.length; index += 1) {
      sumSquares += slice[index] * slice[index];
    }

    const rms = Math.sqrt(sumSquares / Math.max(slice.length, 1));
    amplitudeFrames.push(rms);

    const spectrumWindow = slice.subarray(0, Math.min(2048, slice.length));
    spectrumFrames.push(
      ANALYSIS_BANDS.map((frequency) => goertzel(spectrumWindow, OUTPUT_SAMPLE_RATE, frequency)),
    );
  }

  const normalizedAmplitude = normalizeSeries(amplitudeFrames);
  const spectrumFlat = spectrumFrames.flat();
  const maxSpectrum = Math.max(...spectrumFlat, 0);

  const normalizedSpectrum = spectrumFrames.map((row) =>
    row.map((value) =>
      Number((maxSpectrum > 0 ? value / maxSpectrum : 0).toFixed(4)),
    ),
  );

  return {
    sampleRate: OUTPUT_SAMPLE_RATE,
    frameCount,
    durationSeconds: Number(durationSeconds.toFixed(2)),
    amplitudeFrames: normalizedAmplitude,
    spectrumFrames: normalizedSpectrum,
    bandLabels: ANALYSIS_LABELS,
  };
}

async function probeDuration(filePath: string) {
  const raw = await runBinary("ffprobe", [
    "-v",
    "error",
    "-show_entries",
    "format=duration",
    "-of",
    "json",
    filePath,
  ]);

  const parsed = JSON.parse(raw.toString("utf8")) as {
    format?: { duration?: string };
  };

  return Number(parsed.format?.duration ?? 0);
}

async function extractPcm(filePath: string) {
  const raw = await runBinary("ffmpeg", [
    "-v",
    "error",
    "-i",
    filePath,
    "-ac",
    "1",
    "-ar",
    String(OUTPUT_SAMPLE_RATE),
    "-f",
    "f32le",
    "pipe:1",
  ]);

  const arrayBuffer = raw.buffer.slice(
    raw.byteOffset,
    raw.byteOffset + raw.byteLength,
  );

  return new Float32Array(arrayBuffer);
}

export async function processAudioUpload(params: {
  experienceId: string;
  originalFileName: string;
  buffer: Buffer;
}) {
  const originalExtension =
    path.extname(params.originalFileName).toLowerCase() || ".mp3";
  const originalPath = `audio/original/${params.experienceId}${originalExtension}`;
  const processedPath = `audio/processed/${params.experienceId}.mp3`;

  await writeStorageFile(originalPath, params.buffer);

  await runBinary("ffmpeg", [
    "-v",
    "error",
    "-y",
    "-i",
    resolveStoragePath(originalPath),
    "-vn",
    "-ac",
    "1",
    "-ar",
    String(OUTPUT_SAMPLE_RATE),
    "-b:a",
    "96k",
    resolveStoragePath(processedPath),
  ]);

  const processedAbsolutePath = resolveStoragePath(processedPath);
  const durationSeconds = await probeDuration(processedAbsolutePath);
  const pcmSamples = await extractPcm(processedAbsolutePath);

  if (!pcmSamples.length) {
    throw new Error("音频解析失败，请更换文件后重试。");
  }

  return {
    originalPath,
    processedPath,
    durationSeconds,
    analysis: analyseSamples(pcmSamples, durationSeconds),
  };
}
