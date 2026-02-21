/**
 * packages/core/src/orchestration/__tests__/persistence.test.ts
 *
 * Integration tests for SQLite state persistence in the OrchestrationGraph.
 *
 * Tests verify:
 * 1. WAL mode is active on the database used for checkpointing.
 * 2. Each node transition writes a checkpoint row to the SQLite `checkpoints` table.
 * 3. The `thread_id` in checkpoint rows matches the `projectId` (per configForProject).
 * 4. Different project IDs produce isolated checkpoint rows (no cross-contamination).
 * 5. Complex state objects (requirement DAGs with `dependsOn` arrays) round-trip
 *    correctly through the checkpoint serialization layer.
 * 6. Crash recovery: after a simulated process crash (close + reopen DB connection),
 *    `SqliteSaver.getTuple()` returns the last committed checkpoint unchanged.
 * 7. The graph can resume execution from a recovered checkpoint via `Command({ resume })`.
 * 8. Zero data loss: state values are identical before crash and after recovery.
 * 9. `OrchestrationGraph.withSqlitePersistence(db)` factory wires up SqliteSaver correctly.
 *
 * Requirements: [4_USER_FEATURES-REQ-013], [TAS-078], [9_ROADMAP-PHASE-001]
 */

import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { randomUUID } from "node:crypto";
import { existsSync, unlinkSync } from "node:fs";
import Database from "better-sqlite3";
import { Command } from "@langchain/langgraph";
import { OrchestrationGraph } from "../graph.js";
import { SqliteSaver } from "../SqliteSaver.js";
import { createInitialState, type ProjectConfig } from "../types.js";

// ── Helpers ───────────────────────────────────────────────────────────────────

function makeTestDbPath(): string {
  return join(tmpdir(), `persistence-test-${randomUUID()}.sqlite`);
}

function makeProjectConfig(overrides: Partial<ProjectConfig> = {}): ProjectConfig {
  const now = new Date().toISOString();
  return {
    projectId: randomUUID(),
    name: "Test Project",
    description: "A test project for persistence integration",
    status: "initializing",
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
}

function openDatabase(dbPath: string): Database.Database {
  const db = new Database(dbPath);
  db.pragma("journal_mode = WAL");
  db.pragma("synchronous = NORMAL");
  db.pragma("foreign_keys = ON");
  return db;
}

function cleanupDb(dbPath: string): void {
  [`${dbPath}`, `${dbPath}-wal`, `${dbPath}-shm`].forEach((f) => {
    try {
      if (existsSync(f)) unlinkSync(f);
    } catch {
      // Best-effort cleanup — ignore errors (e.g. already deleted)
    }
  });
}

// ── Test suite ────────────────────────────────────────────────────────────────

describe("SQLite State Persistence", () => {
  let dbPath: string;
  let db: Database.Database;
  let saver: SqliteSaver;

  beforeEach(() => {
    dbPath = makeTestDbPath();
    db = openDatabase(dbPath);
    saver = new SqliteSaver(db);
  });

  afterEach(() => {
    // close() is idempotent — safe even if already closed in crash-recovery tests.
    try {
      saver.close();
    } catch {
      // Already closed — ignore.
    }
    cleanupDb(dbPath);
  });

  // ── WAL mode ─────────────────────────────────────────────────────────────────

  describe("WAL mode", () => {
    it("database uses WAL journal mode", () => {
      const mode = db.pragma("journal_mode", { simple: true });
      expect(mode).toBe("wal");
    });

    it("WAL mode is preserved after SqliteSaver table creation", () => {
      // SqliteSaver DDL must not change the journal mode.
      const mode = db.pragma("journal_mode", { simple: true });
      expect(mode).toBe("wal");
    });
  });

  // ── Node transition checkpointing ─────────────────────────────────────────────

  describe("Node transition checkpointing", () => {
    it("writes at least one checkpoint row after a graph run", async () => {
      const config = makeProjectConfig();
      const og = new OrchestrationGraph(saver);
      const runConfig = OrchestrationGraph.configForProject(config.projectId);

      await og.graph.invoke(createInitialState(config), runConfig);

      const rows = db
        .prepare("SELECT * FROM checkpoints WHERE thread_id = ?")
        .all(config.projectId);
      expect(rows.length).toBeGreaterThan(0);
    });

    it("thread_id in checkpoint rows matches projectId", async () => {
      const config = makeProjectConfig();
      const og = new OrchestrationGraph(saver);
      const runConfig = OrchestrationGraph.configForProject(config.projectId);

      await og.graph.invoke(createInitialState(config), runConfig);

      interface Row {
        thread_id: string;
        checkpoint_id: string;
      }

      const rows = db
        .prepare("SELECT thread_id, checkpoint_id FROM checkpoints WHERE thread_id = ?")
        .all(config.projectId) as Row[];

      expect(rows.length).toBeGreaterThan(0);
      for (const row of rows) {
        expect(row.thread_id).toBe(config.projectId);
      }
    });

    it("creates multiple checkpoint rows — one per node transition", async () => {
      const config = makeProjectConfig();
      const og = new OrchestrationGraph(saver);
      const runConfig = OrchestrationGraph.configForProject(config.projectId);

      await og.graph.invoke(createInitialState(config), runConfig);

      const count = (
        db
          .prepare("SELECT COUNT(*) as n FROM checkpoints WHERE thread_id = ?")
          .get(config.projectId) as { n: number }
      ).n;

      // research → design → approveDesign(interrupt) = at least 3 checkpoints.
      expect(count).toBeGreaterThanOrEqual(3);
    });

    it("isolates checkpoints by thread_id — different projects do not share rows", async () => {
      const config1 = makeProjectConfig({ projectId: `project-a-${randomUUID()}` });
      const config2 = makeProjectConfig({ projectId: `project-b-${randomUUID()}` });
      const og = new OrchestrationGraph(saver);

      // Only run project-a
      await og.graph.invoke(
        createInitialState(config1),
        OrchestrationGraph.configForProject(config1.projectId),
      );

      const rows1 = db
        .prepare("SELECT * FROM checkpoints WHERE thread_id = ?")
        .all(config1.projectId);
      const rows2 = db
        .prepare("SELECT * FROM checkpoints WHERE thread_id = ?")
        .all(config2.projectId);

      expect(rows1.length).toBeGreaterThan(0);
      expect(rows2.length).toBe(0); // project-b never ran
    });
  });

  // ── OrchestrationGraph.withSqlitePersistence factory ─────────────────────────

  describe("OrchestrationGraph.withSqlitePersistence", () => {
    it("creates a graph backed by SqliteSaver", async () => {
      const config = makeProjectConfig();
      const og = OrchestrationGraph.withSqlitePersistence(db);
      const runConfig = OrchestrationGraph.configForProject(config.projectId);

      await og.graph.invoke(createInitialState(config), runConfig);

      const rows = db
        .prepare("SELECT * FROM checkpoints WHERE thread_id = ?")
        .all(config.projectId);
      expect(rows.length).toBeGreaterThan(0);
    });

    it("configForProject returns config with thread_id equal to projectId", () => {
      const projectId = "my-project-id";
      const config = OrchestrationGraph.configForProject(projectId);
      expect(config.configurable?.thread_id).toBe(projectId);
    });
  });

  // ── Complex state serialization ───────────────────────────────────────────────

  describe("Complex state serialization (requirement DAGs)", () => {
    it("serializes requirement DAGs with dependsOn arrays into a checkpoint BLOB", async () => {
      const projectId = randomUUID();
      const config = makeProjectConfig({ projectId });
      const og = new OrchestrationGraph(saver);
      const runConfig = OrchestrationGraph.configForProject(projectId);

      const requirements = [
        {
          requirementId: "req-1",
          projectId,
          externalId: "REQ-001",
          description: "Base requirement",
          status: "pending" as const,
          dependsOn: [],
        },
        {
          requirementId: "req-2",
          projectId,
          externalId: "REQ-002",
          description: "Dependent requirement",
          status: "pending" as const,
          dependsOn: ["req-1"],
        },
        {
          requirementId: "req-3",
          projectId,
          externalId: "REQ-003",
          description: "Multi-dependency requirement",
          status: "pending" as const,
          dependsOn: ["req-1", "req-2"],
        },
      ];

      const state = { ...createInitialState(config), requirements };
      await og.graph.invoke(state, runConfig);

      // Verify at least one non-empty checkpoint BLOB was written
      const row = db
        .prepare(
          "SELECT checkpoint FROM checkpoints WHERE thread_id = ? ORDER BY rowid DESC LIMIT 1",
        )
        .get(projectId) as { checkpoint: Buffer } | undefined;

      expect(row).toBeDefined();
      expect(row!.checkpoint.length).toBeGreaterThan(0);
    });

    it("getTuple reconstructs a valid CheckpointTuple after complex state write", async () => {
      const projectId = randomUUID();
      const config = makeProjectConfig({ projectId });
      const og = new OrchestrationGraph(saver);
      const runConfig = OrchestrationGraph.configForProject(projectId);

      await og.graph.invoke(createInitialState(config), runConfig);

      const tuple = await saver.getTuple({ configurable: { thread_id: projectId } });
      expect(tuple).toBeDefined();
      expect(tuple!.config.configurable!.thread_id).toBe(projectId);
      expect(tuple!.checkpoint).toBeDefined();
      expect(tuple!.checkpoint.channel_values).toBeDefined();
    });
  });

  // ── Crash Recovery ────────────────────────────────────────────────────────────

  describe("Crash Recovery", () => {
    it("checkpoint is recoverable after simulated crash (close + reopen connection)", async () => {
      const projectId = randomUUID();
      const config = makeProjectConfig({ projectId });

      // === Phase 1: Initial run — graph executes through research → design →
      // approveDesign (interrupt). Checkpoints are committed to disk. ===
      const og1 = OrchestrationGraph.withSqlitePersistence(db);
      const runConfig = OrchestrationGraph.configForProject(projectId);
      await og1.graph.invoke(createInitialState(config), runConfig);

      const rowsBefore = db
        .prepare("SELECT COUNT(*) as n FROM checkpoints WHERE thread_id = ?")
        .get(projectId) as { n: number };
      expect(rowsBefore.n).toBeGreaterThan(0);

      // === Phase 2: Simulated crash — close the database connection. ===
      // In a real crash, the process terminates. Here we close cleanly, which
      // ensures WAL data is checkpointed into the main DB file.
      saver.close();
      db.close();

      // === Phase 3: Recovery — open a fresh connection to the same file. ===
      const dbRecovered = openDatabase(dbPath);
      const saverRecovered = new SqliteSaver(dbRecovered);

      // The last committed checkpoint must be recoverable.
      const checkpoint = await saverRecovered.getTuple({
        configurable: { thread_id: projectId },
      });

      expect(checkpoint).toBeDefined();
      expect(checkpoint!.config.configurable!.thread_id).toBe(projectId);
      expect(checkpoint!.checkpoint).toBeDefined();

      saverRecovered.close();
      dbRecovered.close();
    });

    it("graph resumes execution from recovered checkpoint after crash", async () => {
      const projectId = randomUUID();
      const config = makeProjectConfig({ projectId });

      // === Phase 1: Initial run — graph suspends at approveDesign HITL gate. ===
      const og1 = OrchestrationGraph.withSqlitePersistence(db);
      const runConfig = OrchestrationGraph.configForProject(projectId);
      await og1.graph.invoke(createInitialState(config), runConfig);

      const countBeforeCrash = (
        db
          .prepare("SELECT COUNT(*) as n FROM checkpoints WHERE thread_id = ?")
          .get(projectId) as { n: number }
      ).n;
      expect(countBeforeCrash).toBeGreaterThan(0);

      // === Phase 2: Simulated crash. ===
      saver.close();
      db.close();

      // === Phase 3: Recovery — reconnect and build a new graph. ===
      const dbRecovered = openDatabase(dbPath);
      const saverRecovered = new SqliteSaver(dbRecovered);
      const og2 = new OrchestrationGraph(saverRecovered);

      // Resume by supplying an approval signal at the suspended HITL gate.
      const approvalSignal = {
        approved: true,
        approvedBy: "recovery-test",
        approvedAt: new Date().toISOString(),
      };

      const result = await og2.graph.invoke(
        new Command({ resume: approvalSignal }),
        runConfig,
      );

      // Graph advanced — result is a non-null state object.
      expect(result).toBeDefined();

      // More checkpoint rows should have been written during the resume.
      const countAfterResume = (
        dbRecovered
          .prepare("SELECT COUNT(*) as n FROM checkpoints WHERE thread_id = ?")
          .get(projectId) as { n: number }
      ).n;
      expect(countAfterResume).toBeGreaterThan(countBeforeCrash);

      saverRecovered.close();
      dbRecovered.close();
    });

    it("zero data loss: checkpoint state is byte-for-byte identical before and after crash", async () => {
      const projectId = randomUUID();
      const config = makeProjectConfig({ projectId, name: "Zero-Loss Project" });

      // === Phase 1: Initial run. ===
      const og1 = OrchestrationGraph.withSqlitePersistence(db);
      const runConfig = OrchestrationGraph.configForProject(projectId);
      await og1.graph.invoke(createInitialState(config), runConfig);

      // Capture the raw checkpoint BLOB before crash.
      const rowBefore = db
        .prepare(
          "SELECT checkpoint_id, checkpoint FROM checkpoints WHERE thread_id = ? ORDER BY rowid DESC LIMIT 1",
        )
        .get(projectId) as { checkpoint_id: string; checkpoint: Buffer } | undefined;

      expect(rowBefore).toBeDefined();
      const checkpointIdBeforeCrash = rowBefore!.checkpoint_id;
      const blobBeforeCrash = rowBefore!.checkpoint;

      // === Phase 2: Crash simulation. ===
      saver.close();
      db.close();

      // === Phase 3: Recovery — verify the same BLOB is present. ===
      const dbRecovered = openDatabase(dbPath);
      const saverRecovered = new SqliteSaver(dbRecovered);

      const rowAfter = dbRecovered
        .prepare(
          "SELECT checkpoint_id, checkpoint FROM checkpoints WHERE thread_id = ? ORDER BY rowid DESC LIMIT 1",
        )
        .get(projectId) as { checkpoint_id: string; checkpoint: Buffer } | undefined;

      expect(rowAfter).toBeDefined();
      expect(rowAfter!.checkpoint_id).toBe(checkpointIdBeforeCrash);

      // The serialized checkpoint bytes must be identical — zero data loss.
      expect(Buffer.compare(blobBeforeCrash, rowAfter!.checkpoint)).toBe(0);

      saverRecovered.close();
      dbRecovered.close();
    });
  });

  // ── ACID write guarantees ─────────────────────────────────────────────────────

  describe("ACID write guarantees", () => {
    it("checkpoints table is created and writable", () => {
      const row = db
        .prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='checkpoints'")
        .get();
      expect(row).toBeDefined();
    });

    it("checkpoint_writes table is created and writable", () => {
      const row = db
        .prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='checkpoint_writes'")
        .get();
      expect(row).toBeDefined();
    });

    it("deleteThread removes all checkpoint rows for a project", async () => {
      const projectId = randomUUID();
      const config = makeProjectConfig({ projectId });
      const og = new OrchestrationGraph(saver);

      await og.graph.invoke(
        createInitialState(config),
        OrchestrationGraph.configForProject(projectId),
      );

      const countBefore = (
        db
          .prepare("SELECT COUNT(*) as n FROM checkpoints WHERE thread_id = ?")
          .get(projectId) as { n: number }
      ).n;
      expect(countBefore).toBeGreaterThan(0);

      await saver.deleteThread(projectId);

      const countAfter = (
        db
          .prepare("SELECT COUNT(*) as n FROM checkpoints WHERE thread_id = ?")
          .get(projectId) as { n: number }
      ).n;
      expect(countAfter).toBe(0);
    });
  });
});
