/**
 * packages/core/test/persistence/database.test.ts
 *
 * Unit tests for the Flight Recorder database connection manager.
 * Verifies that the persistence layer initialises correctly:
 *   - `.devs/` directory is created automatically
 *   - `state.sqlite` file is created inside `.devs/`
 *   - Connection is established via better-sqlite3
 *   - PRAGMA journal_mode = WAL is applied
 *   - PRAGMA synchronous = NORMAL is applied
 *   - A simple connection-check query (SELECT 1) succeeds
 *
 * Requirements: TAS-066, TAS-010, 4_USER_FEATURES-REQ-086
 */

import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { existsSync, rmSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { tmpdir } from "node:os";
import {
  createDatabase,
  getDatabase,
  closeDatabase,
} from "../../src/persistence/database.js";

/**
 * Creates a unique temporary database path for each test.
 * Placed under OS tmp dir so tests are isolated and cleaned up.
 */
function makeTestDbPath(): string {
  const unique = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  return resolve(tmpdir(), `devs-test-${unique}`, ".devs", "state.sqlite");
}

describe("Persistence Layer – Database Initialization", () => {
  let testDbPath: string;

  beforeEach(() => {
    testDbPath = makeTestDbPath();
  });

  afterEach(() => {
    // Always close the singleton before cleanup.
    closeDatabase();
    // Remove the temp directory created for this test.
    const testRoot = resolve(dirname(testDbPath), "..");
    if (existsSync(testRoot)) {
      rmSync(testRoot, { recursive: true, force: true });
    }
  });

  // ── Directory creation ────────────────────────────────────────────────────

  it("creates the .devs/ directory automatically when it does not exist", () => {
    const devsDir = dirname(testDbPath);
    expect(existsSync(devsDir)).toBe(false);

    const db = createDatabase({ dbPath: testDbPath });
    db.close();

    expect(existsSync(devsDir)).toBe(true);
  });

  // ── File creation ─────────────────────────────────────────────────────────

  it("creates state.sqlite inside the .devs/ directory", () => {
    expect(existsSync(testDbPath)).toBe(false);

    const db = createDatabase({ dbPath: testDbPath });
    db.close();

    expect(existsSync(testDbPath)).toBe(true);
  });

  // ── Connection ────────────────────────────────────────────────────────────

  it("establishes an open database connection using better-sqlite3", () => {
    const db = createDatabase({ dbPath: testDbPath });

    expect(db.open).toBe(true);
    expect(db.name).toBe(testDbPath);

    db.close();
  });

  // ── PRAGMA settings ───────────────────────────────────────────────────────

  it("sets journal_mode = WAL", () => {
    const db = createDatabase({ dbPath: testDbPath });

    // better-sqlite3 pragma({ simple: true }) returns the scalar value.
    const journalMode = db.pragma("journal_mode", { simple: true }) as string;
    db.close();

    expect(journalMode).toBe("wal");
  });

  it("sets synchronous = NORMAL (value 1)", () => {
    const db = createDatabase({ dbPath: testDbPath });

    // SQLite PRAGMA synchronous values: 0=OFF, 1=NORMAL, 2=FULL, 3=EXTRA
    const synchronous = db.pragma("synchronous", {
      simple: true,
    }) as number;
    db.close();

    expect(synchronous).toBe(1);
  });

  // ── Connection check ──────────────────────────────────────────────────────

  it("passes a connection-check query (SELECT 1)", () => {
    const db = createDatabase({ dbPath: testDbPath });

    const row = db.prepare("SELECT 1 AS value").get() as { value: number };
    db.close();

    expect(row.value).toBe(1);
  });

  // ── Idempotency ───────────────────────────────────────────────────────────

  it("succeeds when called a second time with the same path (idempotent init)", () => {
    const db1 = createDatabase({ dbPath: testDbPath });
    db1.close();

    // Opening the same database again should not throw.
    const db2 = createDatabase({ dbPath: testDbPath });
    expect(db2.open).toBe(true);
    db2.close();
  });

  // ── Singleton ─────────────────────────────────────────────────────────────

  describe("getDatabase() singleton", () => {
    it("returns the same instance on successive calls", () => {
      const db1 = getDatabase({ dbPath: testDbPath });
      const db2 = getDatabase({ dbPath: testDbPath });

      expect(db1).toBe(db2);
    });

    it("creates a fresh instance after closeDatabase()", () => {
      const db1 = getDatabase({ dbPath: testDbPath });
      closeDatabase();

      // Use a different path for the new instance to avoid conflicts.
      const newDbPath = makeTestDbPath();
      const db2 = getDatabase({ dbPath: newDbPath });

      expect(db1).not.toBe(db2);
      expect(db2.open).toBe(true);

      // Cleanup the second temp db.
      db2.close();
      const newRoot = resolve(dirname(newDbPath), "..");
      if (existsSync(newRoot)) {
        rmSync(newRoot, { recursive: true, force: true });
      }
    });
  });
});
