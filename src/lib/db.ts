import { DatabaseSync } from "node:sqlite";
import { ensureStorageDirectoriesSync, resolveStoragePath } from "@/lib/storage";
import type { DashboardMetrics, ExperienceRecord } from "@/types/nfc";

type ExperienceRow = {
  id: string;
  slug: string;
  name: string;
  quote: string;
  cover_path: string | null;
  original_audio_path: string;
  processed_audio_path: string;
  duration_seconds: number;
  analysis_json: string;
  visual_preset: ExperienceRecord["visualPreset"];
  visual_config_json: string;
  status: ExperienceRecord["status"];
  created_at: string;
  updated_at: string;
  visitCount?: number;
  lastVisitedAt?: string | null;
};

ensureStorageDirectoriesSync();

const database = new DatabaseSync(resolveStoragePath("data/blackone.sqlite"));

database.exec(`
  PRAGMA journal_mode = WAL;
  PRAGMA foreign_keys = ON;

  CREATE TABLE IF NOT EXISTS experiences (
    id TEXT PRIMARY KEY,
    slug TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    quote TEXT NOT NULL DEFAULT '',
    cover_path TEXT,
    original_audio_path TEXT NOT NULL,
    processed_audio_path TEXT NOT NULL,
    duration_seconds REAL NOT NULL,
    analysis_json TEXT NOT NULL,
    visual_preset TEXT NOT NULL,
    visual_config_json TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'active',
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS visits (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    experience_id TEXT NOT NULL,
    visited_at TEXT NOT NULL,
    referrer TEXT,
    user_agent TEXT,
    ip_address TEXT,
    FOREIGN KEY (experience_id) REFERENCES experiences(id) ON DELETE CASCADE
  );
`);

function hydrateExperience(row: ExperienceRow): ExperienceRecord {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    quote: row.quote,
    coverPath: row.cover_path,
    originalAudioPath: row.original_audio_path,
    processedAudioPath: row.processed_audio_path,
    durationSeconds: Number(row.duration_seconds),
    analysis: JSON.parse(row.analysis_json),
    visualPreset: row.visual_preset,
    visualConfig: JSON.parse(row.visual_config_json),
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    visitCount: Number(row.visitCount ?? 0),
    lastVisitedAt: row.lastVisitedAt ?? null,
  };
}

const dashboardSelect = `
  SELECT
    e.*,
    COUNT(v.id) AS visitCount,
    MAX(v.visited_at) AS lastVisitedAt
  FROM experiences e
  LEFT JOIN visits v ON v.experience_id = e.id
`;

export type ExperienceUpsertInput = Omit<
  ExperienceRecord,
  "visitCount" | "lastVisitedAt"
>;

export function listExperiences() {
  const rows = database
    .prepare(`${dashboardSelect} GROUP BY e.id ORDER BY e.created_at DESC`)
    .all() as ExperienceRow[];

  return rows.map(hydrateExperience);
}

export function getExperienceById(id: string) {
  const row = database
    .prepare(`${dashboardSelect} WHERE e.id = ? GROUP BY e.id LIMIT 1`)
    .get(id) as ExperienceRow | undefined;

  return row ? hydrateExperience(row) : null;
}

export function getExperienceBySlug(slug: string) {
  const row = database
    .prepare(`${dashboardSelect} WHERE e.slug = ? GROUP BY e.id LIMIT 1`)
    .get(slug) as ExperienceRow | undefined;

  return row ? hydrateExperience(row) : null;
}

export function findExperienceByIdOrSlug(value: string) {
  const row = database
    .prepare(`${dashboardSelect} WHERE e.id = ? OR e.slug = ? GROUP BY e.id LIMIT 1`)
    .get(value, value) as ExperienceRow | undefined;

  return row ? hydrateExperience(row) : null;
}

export function createExperience(input: ExperienceUpsertInput) {
  database
    .prepare(
      `
        INSERT INTO experiences (
          id,
          slug,
          name,
          quote,
          cover_path,
          original_audio_path,
          processed_audio_path,
          duration_seconds,
          analysis_json,
          visual_preset,
          visual_config_json,
          status,
          created_at,
          updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
    )
    .run(
      input.id,
      input.slug,
      input.name,
      input.quote,
      input.coverPath,
      input.originalAudioPath,
      input.processedAudioPath,
      input.durationSeconds,
      JSON.stringify(input.analysis),
      input.visualPreset,
      JSON.stringify(input.visualConfig),
      input.status,
      input.createdAt,
      input.updatedAt,
    );

  return getExperienceById(input.id);
}

export function updateExperience(id: string, input: ExperienceUpsertInput) {
  database
    .prepare(
      `
        UPDATE experiences
        SET
          slug = ?,
          name = ?,
          quote = ?,
          cover_path = ?,
          original_audio_path = ?,
          processed_audio_path = ?,
          duration_seconds = ?,
          analysis_json = ?,
          visual_preset = ?,
          visual_config_json = ?,
          status = ?,
          updated_at = ?
        WHERE id = ?
      `,
    )
    .run(
      input.slug,
      input.name,
      input.quote,
      input.coverPath,
      input.originalAudioPath,
      input.processedAudioPath,
      input.durationSeconds,
      JSON.stringify(input.analysis),
      input.visualPreset,
      JSON.stringify(input.visualConfig),
      input.status,
      input.updatedAt,
      id,
    );

  return getExperienceById(id);
}

export function setExperienceStatus(id: string, status: ExperienceRecord["status"]) {
  database
    .prepare(`UPDATE experiences SET status = ?, updated_at = ? WHERE id = ?`)
    .run(status, new Date().toISOString(), id);

  return getExperienceById(id);
}

export function insertVisit(params: {
  experienceId: string;
  referrer: string | null;
  userAgent: string | null;
  ipAddress: string | null;
}) {
  database
    .prepare(
      `
        INSERT INTO visits (
          experience_id,
          visited_at,
          referrer,
          user_agent,
          ip_address
        ) VALUES (?, ?, ?, ?, ?)
      `,
    )
    .run(
      params.experienceId,
      new Date().toISOString(),
      params.referrer,
      params.userAgent,
      params.ipAddress,
    );
}

export function getDashboardMetrics(): DashboardMetrics {
  const contents = database
    .prepare(
      `
        SELECT
          COUNT(*) AS totalContents,
          SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) AS activeContents
        FROM experiences
      `,
    )
    .get() as { totalContents: number; activeContents: number };

  const visits = database
    .prepare(
      `
        SELECT
          COUNT(*) AS totalVisits,
          SUM(
            CASE
              WHEN date(visited_at) = date('now', 'localtime') THEN 1
              ELSE 0
            END
          ) AS todayVisits
        FROM visits
      `,
    )
    .get() as { totalVisits: number; todayVisits: number };

  return {
    totalContents: Number(contents.totalContents ?? 0),
    activeContents: Number(contents.activeContents ?? 0),
    totalVisits: Number(visits.totalVisits ?? 0),
    todayVisits: Number(visits.todayVisits ?? 0),
  };
}
