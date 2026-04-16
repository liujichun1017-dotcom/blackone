import { mkdirSync, promises as fs } from "node:fs";
import path from "node:path";

const STORAGE_ROOT = path.join(process.cwd(), "storage");

const CONTENT_TYPES: Record<string, string> = {
  ".mp3": "audio/mpeg",
  ".wav": "audio/wav",
  ".aac": "audio/aac",
  ".m4a": "audio/mp4",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
};

export async function ensureStorageDirectories() {
  await Promise.all([
    fs.mkdir(resolveStoragePath("audio/original"), { recursive: true }),
    fs.mkdir(resolveStoragePath("audio/processed"), { recursive: true }),
    fs.mkdir(resolveStoragePath("covers"), { recursive: true }),
    fs.mkdir(resolveStoragePath("data"), { recursive: true }),
  ]);
}

export function ensureStorageDirectoriesSync() {
  mkdirSync(resolveStoragePath("audio/original"), { recursive: true });
  mkdirSync(resolveStoragePath("audio/processed"), { recursive: true });
  mkdirSync(resolveStoragePath("covers"), { recursive: true });
  mkdirSync(resolveStoragePath("data"), { recursive: true });
}

export function resolveStoragePath(relativePath: string) {
  return path.join(STORAGE_ROOT, relativePath);
}

export async function writeStorageFile(relativePath: string, content: Buffer | Uint8Array) {
  const target = resolveStoragePath(relativePath);
  await fs.mkdir(path.dirname(target), { recursive: true });
  await fs.writeFile(target, content);
  return relativePath;
}

export async function deleteStorageFile(relativePath: string | null | undefined) {
  if (!relativePath) {
    return;
  }

  try {
    await fs.unlink(resolveStoragePath(relativePath));
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
      throw error;
    }
  }
}

export async function readStorageFile(relativePath: string) {
  const absolutePath = resolveStoragePath(relativePath);
  const file = await fs.readFile(absolutePath);
  return {
    absolutePath,
    file,
    contentType: CONTENT_TYPES[path.extname(absolutePath).toLowerCase()] ?? "application/octet-stream",
  };
}
