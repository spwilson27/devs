/**
 * packages/core/test/persistence/sqlite_hardening.test.ts
 *
 * Unit tests for the SqliteManager WAL hardening and file security enforcement.
 *
 * Verifies:
 *   - `.devs/state.sqlite` is created with 0600 permissions (owner r/w only)
 *   - Database runs in WAL (Write-Ahead Logging) mode
 *   - Synchronous mode is NORMAL (1) or FULL (2)
 *   - Startup throws when file permissions are looser than 0600
 *   - open() is idempotent (same instance returned on repeat calls)
 *   - Singleton is initialised once and reused
 *
 * Requirements: TAS-070, 8_RISKS-REQ-093
 */

import { describe, it, expect, afterEach } from "vitest";
import { existsSync, rmSync, chmodSync, statSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { tmpdir } from "node:os";
import {
  SqliteManager,
  closeSqliteManager,
  getSqliteManager,
} from "../../src/persistence/SqliteManager.js";

/**
 * Creates a unique temporary database path for each test so tests are isolated
 * and never touch the real project-root `.devs/state.sqlite`.
 */
function makeTestDbPath(): string {
  const unique = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  return resolve(
    tmpdir(),
    `devs-hardening-${unique}`,
    ".devs",
    "state.sqlite"
  );
}

describe("SqliteManager – WAL & Hardening", () => {
  let testDbPath: string;
  let manager: SqliteManager | null = null;

  afterEach(() => {
    // Close any open managers to release file handles before cleanup.
    if (manager !== null) {
      manager.close();
      manager = null;
    }
    closeSqliteManager();

    // Remove the temp directory tree created for this test.
    if (testDbPath) {
      const root = resolve(dirname(testDbPath), "..");
      if (existsSync(root)) {
        rmSync(root, { recursive: true, force: true });
      }
    }
  });

  // ── File permissions ──────────────────────────────────────────────────────

  it("creates the database file with 0600 permissions (owner r/w only)", () => {
    testDbPath = makeTestDbPath();
    manager = new SqliteManager({ dbPath: testDbPath });
    manager.open();

    const stat = statSync(testDbPath);
    const mode = stat.mode & 0o777;

    // 0600 = read/write for owner only; no group or other permissions.
    expect(mode).toBe(0o600);
  });

  // ── WAL mode ──────────────────────────────────────────────────────────────

  it("configures journal_mode = WAL", () => {
    testDbPath = makeTestDbPath();
    manager = new SqliteManager({ dbPath: testDbPath });
    const db = manager.open();

    const journalMode = db.pragma("journal_mode", { simple: true }) as string;
    expect(journalMode).toBe("wal");
  });

  // ── Synchronous mode ──────────────────────────────────────────────────────

  it("configures synchronous = NORMAL (1) or FULL (2)", () => {
    testDbPath = makeTestDbPath();
    manager = new SqliteManager({ dbPath: testDbPath });
    const db = manager.open();

    // SQLite PRAGMA synchronous values: 0=OFF, 1=NORMAL, 2=FULL, 3=EXTRA
    const synchronous = db.pragma("synchronous", { simple: true }) as number;
    expect(synchronous === 1 || synchronous === 2).toBe(true);
  });

  // ── Permission enforcement ────────────────────────────────────────────────

  it("throws on startup when file permissions are looser than 0600", () => {
    testDbPath = makeTestDbPath();

    // First, create the database normally so the file exists.
    const setup = new SqliteManager({ dbPath: testDbPath });
    setup.open();
    setup.close();

    // Loosen permissions to 0644 (owner r/w, group r, other r).
    chmodSync(testDbPath, 0o644);

    // A fresh manager pointing at the loose file should throw.
    const badManager = new SqliteManager({ dbPath: testDbPath });
    expect(() => badManager.open()).toThrow(/insecure file permissions/i);
  });

  it("throws on startup for 0o444 (world-readable, numerically < 0o600)", () => {
    // 0o444 = 292 decimal — numerically LESS than 0o600 (384) but still
    // insecure because group and other read bits are set. A simple
    // `mode > 0o600` numeric comparison would silently pass this case.
    testDbPath = makeTestDbPath();

    const setup = new SqliteManager({ dbPath: testDbPath });
    setup.open();
    setup.close();

    chmodSync(testDbPath, 0o444);

    const badManager = new SqliteManager({ dbPath: testDbPath });
    expect(() => badManager.open()).toThrow(/insecure file permissions/i);
  });

  // ── Idempotency ───────────────────────────────────────────────────────────

  it("open() is idempotent – returns the same db instance on repeat calls", () => {
    testDbPath = makeTestDbPath();
    manager = new SqliteManager({ dbPath: testDbPath });

    const db1 = manager.open();
    const db2 = manager.open();

    expect(db1).toBe(db2);
  });

  // ── Singleton ─────────────────────────────────────────────────────────────

  describe("getSqliteManager() singleton", () => {
    it("returns the same SqliteManager instance on successive calls", () => {
      testDbPath = makeTestDbPath();

      const m1 = getSqliteManager({ dbPath: testDbPath });
      const m2 = getSqliteManager({ dbPath: testDbPath });

      expect(m1).toBe(m2);
    });

    it("creates a fresh instance after closeSqliteManager()", () => {
      testDbPath = makeTestDbPath();

      const m1 = getSqliteManager({ dbPath: testDbPath });
      closeSqliteManager();

      const newDbPath = makeTestDbPath();
      const m2 = getSqliteManager({ dbPath: newDbPath });

      expect(m1).not.toBe(m2);
      expect(m2.path).toBe(newDbPath);

      // Cleanup the extra temp dir created for m2.
      m2.close();
      closeSqliteManager();
      const newRoot = resolve(dirname(newDbPath), "..");
      if (existsSync(newRoot)) {
        rmSync(newRoot, { recursive: true, force: true });
      }
    });
  });
});
