/**
 * Database service using expo-sqlite.
 * Handles persistence for drive sessions and car profiles.
 *
 * Using SQLite over AsyncStorage because:
 * - Better for structured data with relationships
 * - Efficient querying for history lists
 * - Better performance with larger datasets
 * - Supports future features like searching/filtering
 */

import * as SQLite from 'expo-sqlite';
import type { DriveSession, CarProfile, ClassificationStats } from '../models/types';

const DB_NAME = 'mx5pocket.db';

let db: SQLite.SQLiteDatabase | null = null;

/**
 * Initialize the database and create tables if needed.
 */
export async function initDatabase(): Promise<void> {
  db = await SQLite.openDatabaseAsync(DB_NAME);

  // Create sessions table
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY,
      startedAt INTEGER NOT NULL,
      endedAt INTEGER NOT NULL,
      samplesCount INTEGER NOT NULL,
      distanceMeters INTEGER NOT NULL,
      durationSeconds INTEGER NOT NULL,
      straightPct INTEGER NOT NULL,
      flowPct INTEGER NOT NULL,
      tightPct INTEGER NOT NULL,
      transitionPct INTEGER NOT NULL,
      smoothnessScore INTEGER NOT NULL,
      keyInsight TEXT NOT NULL,
      polyline TEXT
    );
  `);

  // Create car profile table
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS car_profile (
      id TEXT PRIMARY KEY,
      generation TEXT NOT NULL,
      engine TEXT NOT NULL,
      transmission TEXT NOT NULL,
      createdAt INTEGER NOT NULL
    );
  `);
}

/**
 * Ensure database is initialized before operations.
 */
async function ensureDb(): Promise<SQLite.SQLiteDatabase> {
  if (!db) {
    await initDatabase();
  }
  return db!;
}

// --- Session Operations ---

/**
 * Save a completed drive session.
 */
export async function saveSession(session: DriveSession): Promise<void> {
  const database = await ensureDb();

  await database.runAsync(
    `INSERT OR REPLACE INTO sessions
     (id, startedAt, endedAt, samplesCount, distanceMeters, durationSeconds,
      straightPct, flowPct, tightPct, transitionPct, smoothnessScore, keyInsight, polyline)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      session.id,
      session.startedAt,
      session.endedAt,
      session.samplesCount,
      session.distanceMeters,
      session.durationSeconds,
      session.classificationStats.straightPct,
      session.classificationStats.flowPct,
      session.classificationStats.tightPct,
      session.classificationStats.transitionPct,
      session.smoothnessScore,
      session.keyInsight,
      session.polyline ?? null,
    ]
  );
}

/**
 * Get all sessions, ordered by most recent first.
 */
export async function getAllSessions(): Promise<DriveSession[]> {
  const database = await ensureDb();

  const rows = await database.getAllAsync<{
    id: string;
    startedAt: number;
    endedAt: number;
    samplesCount: number;
    distanceMeters: number;
    durationSeconds: number;
    straightPct: number;
    flowPct: number;
    tightPct: number;
    transitionPct: number;
    smoothnessScore: number;
    keyInsight: string;
    polyline: string | null;
  }>('SELECT * FROM sessions ORDER BY startedAt DESC');

  return rows.map((row) => ({
    id: row.id,
    startedAt: row.startedAt,
    endedAt: row.endedAt,
    samplesCount: row.samplesCount,
    distanceMeters: row.distanceMeters,
    durationSeconds: row.durationSeconds,
    classificationStats: {
      straightPct: row.straightPct,
      flowPct: row.flowPct,
      tightPct: row.tightPct,
      transitionPct: row.transitionPct,
    },
    smoothnessScore: row.smoothnessScore,
    keyInsight: row.keyInsight,
    polyline: row.polyline ?? undefined,
  }));
}

/**
 * Get a single session by ID.
 */
export async function getSessionById(id: string): Promise<DriveSession | null> {
  const database = await ensureDb();

  const row = await database.getFirstAsync<{
    id: string;
    startedAt: number;
    endedAt: number;
    samplesCount: number;
    distanceMeters: number;
    durationSeconds: number;
    straightPct: number;
    flowPct: number;
    tightPct: number;
    transitionPct: number;
    smoothnessScore: number;
    keyInsight: string;
    polyline: string | null;
  }>('SELECT * FROM sessions WHERE id = ?', [id]);

  if (!row) {
    return null;
  }

  return {
    id: row.id,
    startedAt: row.startedAt,
    endedAt: row.endedAt,
    samplesCount: row.samplesCount,
    distanceMeters: row.distanceMeters,
    durationSeconds: row.durationSeconds,
    classificationStats: {
      straightPct: row.straightPct,
      flowPct: row.flowPct,
      tightPct: row.tightPct,
      transitionPct: row.transitionPct,
    },
    smoothnessScore: row.smoothnessScore,
    keyInsight: row.keyInsight,
    polyline: row.polyline ?? undefined,
  };
}

/**
 * Delete a session by ID.
 */
export async function deleteSession(id: string): Promise<void> {
  const database = await ensureDb();
  await database.runAsync('DELETE FROM sessions WHERE id = ?', [id]);
}

/**
 * Get session count.
 */
export async function getSessionCount(): Promise<number> {
  const database = await ensureDb();
  const result = await database.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) as count FROM sessions'
  );
  return result?.count ?? 0;
}

// --- Car Profile Operations ---

/**
 * Save or update car profile.
 * We only store one profile for MVP.
 */
export async function saveCarProfile(profile: CarProfile): Promise<void> {
  const database = await ensureDb();

  // Delete any existing profiles (MVP: single profile)
  await database.runAsync('DELETE FROM car_profile');

  await database.runAsync(
    `INSERT INTO car_profile (id, generation, engine, transmission, createdAt)
     VALUES (?, ?, ?, ?, ?)`,
    [profile.id, profile.generation, profile.engine, profile.transmission, profile.createdAt]
  );
}

/**
 * Get the current car profile.
 */
export async function getCarProfile(): Promise<CarProfile | null> {
  const database = await ensureDb();

  const row = await database.getFirstAsync<{
    id: string;
    generation: string;
    engine: string;
    transmission: string;
    createdAt: number;
  }>('SELECT * FROM car_profile LIMIT 1');

  if (!row) {
    return null;
  }

  return {
    id: row.id,
    generation: row.generation as CarProfile['generation'],
    engine: row.engine as CarProfile['engine'],
    transmission: row.transmission as CarProfile['transmission'],
    createdAt: row.createdAt,
  };
}

/**
 * Delete car profile.
 */
export async function deleteCarProfile(): Promise<void> {
  const database = await ensureDb();
  await database.runAsync('DELETE FROM car_profile');
}
