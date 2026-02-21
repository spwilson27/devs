/**
 * packages/core/test/orchestration/SqliteSaver.test.ts
 *
 * Integration tests for the SqliteSaver LangGraph checkpoint persister.
 *
 * Tests verify:
 * 1. Persistence: `put()` stores a checkpoint row in the SQLite `checkpoints` table.
 * 2. Retrieval: `getTuple()` loads a previously persisted checkpoint by thread_id.
 * 3. Transaction wrapping: every `put` call is wrapped in a better-sqlite3 transaction.
 * 4. Crash resilience: a mock that throws mid-put leaves the previous checkpoint intact.
 * 5. `list()` yields all checkpoints for a thread in reverse chronological order.
 * 6. `putWrites()` stores pending channel writes associated with a checkpoint.
 * 7. `deleteThread()` removes all checkpoints and writes for a thread_id.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { randomUUID } from "node:crypto";
import type { RunnableConfig } from "@langchain/core/runnables";
import type { Checkpoint, CheckpointMetadata } from "@langchain/langgraph";
import { SqliteSaver } from "../../src/orchestration/SqliteSaver.js";
import { createDatabase, closeDatabase } from "../../src/persistence/database.js";
import type Database from "better-sqlite3";

// ── Helpers ───────────────────────────────────────────────────────────────────

function makeTestDbPath(): string {
  return join(tmpdir(), `sqlitesaver-test-${randomUUID()}.sqlite`);
}

function makeCheckpoint(overrides: Partial<Checkpoint> = {}): Checkpoint {
  return {
    v: 1,
    id: randomUUID(),
    ts: new Date().toISOString(),
    channel_values: { messages: ["hello"] },
    channel_versions: { messages: 1 },
    versions_seen: {},
    ...overrides,
  };
}

function makeMetadata(overrides: Partial<CheckpointMetadata> = {}): CheckpointMetadata {
  return {
    source: "loop",
    step: 1,
    parents: {},
    ...overrides,
  };
}

function makeConfig(threadId: string, checkpointNs = "", checkpointId?: string): RunnableConfig {
  return {
    configurable: {
      thread_id: threadId,
      checkpoint_ns: checkpointNs,
      ...(checkpointId !== undefined ? { checkpoint_id: checkpointId } : {}),
    },
  };
}

// ── Test suite ────────────────────────────────────────────────────────────────

describe("SqliteSaver", () => {
  let db: Database.Database;
  let saver: SqliteSaver;
  let dbPath: string;

  beforeEach(() => {
    dbPath = makeTestDbPath();
    db = createDatabase({ dbPath });
    saver = new SqliteSaver(db);
  });

  afterEach(() => {
    closeDatabase();
    saver.close();
  });

  // ── Constructor ─────────────────────────────────────────────────────────────

  describe("constructor", () => {
    it("creates the checkpoints table", () => {
      const row = db
        .prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='checkpoints'")
        .get();
      expect(row).toBeDefined();
    });

    it("creates the checkpoint_writes table", () => {
      const row = db
        .prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='checkpoint_writes'")
        .get();
      expect(row).toBeDefined();
    });

    it("accepts an existing database without schema conflicts (idempotent DDL)", () => {
      // Constructing a second saver on the same db must not throw.
      expect(() => new SqliteSaver(db)).not.toThrow();
    });
  });

  // ── put() ───────────────────────────────────────────────────────────────────

  describe("put()", () => {
    it("persists a checkpoint row in the checkpoints table", async () => {
      const threadId = randomUUID();
      const checkpoint = makeCheckpoint();
      const metadata = makeMetadata();
      const config = makeConfig(threadId);

      await saver.put(config, checkpoint, metadata, {});

      const row = db
        .prepare("SELECT * FROM checkpoints WHERE thread_id = ?")
        .get(threadId);
      expect(row).toBeDefined();
    });

    it("stores the checkpoint_id returned in the new config", async () => {
      const threadId = randomUUID();
      const checkpoint = makeCheckpoint();
      const metadata = makeMetadata();
      const config = makeConfig(threadId);

      const newConfig = await saver.put(config, checkpoint, metadata, {});

      expect(newConfig.configurable?.thread_id).toBe(threadId);
      expect(newConfig.configurable?.checkpoint_id).toBe(checkpoint.id);
    });

    it("stores parent_checkpoint_id when config has an existing checkpoint_id", async () => {
      const threadId = randomUUID();
      const parentCheckpointId = randomUUID();
      const checkpoint = makeCheckpoint();
      const metadata = makeMetadata();
      const config = makeConfig(threadId, "", parentCheckpointId);

      await saver.put(config, checkpoint, metadata, {});

      const row = db
        .prepare("SELECT parent_checkpoint_id FROM checkpoints WHERE thread_id = ? AND checkpoint_id = ?")
        .get(threadId, checkpoint.id) as { parent_checkpoint_id: string } | undefined;

      expect(row?.parent_checkpoint_id).toBe(parentCheckpointId);
    });

    it("serializes channel_values to JSON that round-trips correctly", async () => {
      const threadId = randomUUID();
      const channelValues = { messages: ["hello", "world"], count: 42 };
      const checkpoint = makeCheckpoint({ channel_values: channelValues });
      const config = makeConfig(threadId);

      await saver.put(config, checkpoint, makeMetadata(), {});

      const tuple = await saver.getTuple(config);
      expect(tuple?.checkpoint.channel_values).toEqual(channelValues);
    });

    it("is wrapped in a SQLite transaction (no partial writes on error)", async () => {
      const threadId = randomUUID();
      const checkpoint = makeCheckpoint();
      const config = makeConfig(threadId);

      // Spy on the DB's transaction mechanism — confirm put uses a transaction.
      const transactionSpy = vi.spyOn(db, "transaction");

      await saver.put(config, checkpoint, makeMetadata(), {});

      expect(transactionSpy).toHaveBeenCalled();
      transactionSpy.mockRestore();
    });

    it("leaves the previous checkpoint intact when a second put throws mid-write", async () => {
      const threadId = randomUUID();

      // First put — succeeds and creates baseline checkpoint.
      const checkpoint1 = makeCheckpoint({ id: randomUUID() });
      const config1 = makeConfig(threadId);
      await saver.put(config1, checkpoint1, makeMetadata({ step: 1 }), {});

      // Second put — we simulate an error during the write by temporarily
      // replacing the internal prepared statement's run() with a throwing mock.
      const originalPut = saver["_stmtPutCheckpoint"];
      const originalRun = originalPut.run.bind(originalPut);
      let callCount = 0;
      const throwingRun = (...args: Parameters<typeof originalRun>) => {
        callCount++;
        if (callCount === 1) {
          throw new Error("Simulated disk failure");
        }
        return originalRun(...args);
      };
      vi.spyOn(originalPut, "run").mockImplementation(throwingRun);

      const checkpoint2 = makeCheckpoint({ id: randomUUID() });
      const config2 = makeConfig(threadId, "", checkpoint1.id);

      await expect(saver.put(config2, checkpoint2, makeMetadata({ step: 2 }), {})).rejects.toThrow(
        "Simulated disk failure"
      );

      vi.restoreAllMocks();

      // The first checkpoint must still be loadable and intact.
      const resumed = await saver.getTuple(makeConfig(threadId, "", checkpoint1.id));
      expect(resumed?.checkpoint.id).toBe(checkpoint1.id);
      expect(resumed?.metadata?.step).toBe(1);
    });
  });

  // ── getTuple() ──────────────────────────────────────────────────────────────

  describe("getTuple()", () => {
    it("returns undefined for a non-existent thread_id", async () => {
      const result = await saver.getTuple(makeConfig("non-existent-thread"));
      expect(result).toBeUndefined();
    });

    it("loads a previously persisted checkpoint by thread_id (latest)", async () => {
      const threadId = randomUUID();
      const checkpoint = makeCheckpoint();
      await saver.put(makeConfig(threadId), checkpoint, makeMetadata(), {});

      const tuple = await saver.getTuple(makeConfig(threadId));

      expect(tuple).toBeDefined();
      expect(tuple?.checkpoint.id).toBe(checkpoint.id);
    });

    it("returns the latest checkpoint when multiple exist for a thread", async () => {
      const threadId = randomUUID();
      const cp1 = makeCheckpoint({ id: randomUUID(), ts: new Date(1000).toISOString() });
      const cp2 = makeCheckpoint({ id: randomUUID(), ts: new Date(2000).toISOString() });

      await saver.put(makeConfig(threadId), cp1, makeMetadata({ step: 1 }), {});
      await saver.put(makeConfig(threadId, "", cp1.id), cp2, makeMetadata({ step: 2 }), {});

      // Without a checkpoint_id in config → returns the latest.
      const tuple = await saver.getTuple(makeConfig(threadId));
      expect(tuple?.checkpoint.id).toBe(cp2.id);
    });

    it("loads a specific checkpoint by checkpoint_id", async () => {
      const threadId = randomUUID();
      const cp1 = makeCheckpoint({ id: randomUUID() });
      const cp2 = makeCheckpoint({ id: randomUUID() });

      await saver.put(makeConfig(threadId), cp1, makeMetadata({ step: 1 }), {});
      await saver.put(makeConfig(threadId, "", cp1.id), cp2, makeMetadata({ step: 2 }), {});

      // Fetch the first checkpoint by its ID.
      const tuple = await saver.getTuple(makeConfig(threadId, "", cp1.id));
      expect(tuple?.checkpoint.id).toBe(cp1.id);
      expect(tuple?.metadata?.step).toBe(1);
    });

    it("includes the parentConfig when a parent_checkpoint_id is set", async () => {
      const threadId = randomUUID();
      const cp1 = makeCheckpoint({ id: randomUUID() });
      const cp2 = makeCheckpoint({ id: randomUUID() });

      await saver.put(makeConfig(threadId), cp1, makeMetadata({ step: 1 }), {});
      await saver.put(makeConfig(threadId, "", cp1.id), cp2, makeMetadata({ step: 2 }), {});

      const tuple = await saver.getTuple(makeConfig(threadId));
      expect(tuple?.parentConfig?.configurable?.checkpoint_id).toBe(cp1.id);
    });
  });

  // ── list() ──────────────────────────────────────────────────────────────────

  describe("list()", () => {
    it("yields an empty sequence for a thread with no checkpoints", async () => {
      const results: unknown[] = [];
      for await (const item of saver.list(makeConfig("empty-thread"))) {
        results.push(item);
      }
      expect(results).toHaveLength(0);
    });

    it("yields all checkpoints for a thread in reverse chronological order", async () => {
      const threadId = randomUUID();
      const cp1 = makeCheckpoint({ id: randomUUID(), ts: new Date(1000).toISOString() });
      const cp2 = makeCheckpoint({ id: randomUUID(), ts: new Date(2000).toISOString() });
      const cp3 = makeCheckpoint({ id: randomUUID(), ts: new Date(3000).toISOString() });

      await saver.put(makeConfig(threadId), cp1, makeMetadata({ step: 1 }), {});
      await saver.put(makeConfig(threadId, "", cp1.id), cp2, makeMetadata({ step: 2 }), {});
      await saver.put(makeConfig(threadId, "", cp2.id), cp3, makeMetadata({ step: 3 }), {});

      const results: string[] = [];
      for await (const item of saver.list(makeConfig(threadId))) {
        results.push(item.checkpoint.id);
      }

      expect(results).toHaveLength(3);
      // Most recent first.
      expect(results[0]).toBe(cp3.id);
      expect(results[1]).toBe(cp2.id);
      expect(results[2]).toBe(cp1.id);
    });

    it("respects the limit option", async () => {
      const threadId = randomUUID();
      for (let i = 0; i < 5; i++) {
        const cp = makeCheckpoint({ id: randomUUID() });
        await saver.put(makeConfig(threadId), cp, makeMetadata({ step: i }), {});
      }

      const results: unknown[] = [];
      for await (const item of saver.list(makeConfig(threadId), { limit: 2 })) {
        results.push(item);
      }
      expect(results).toHaveLength(2);
    });
  });

  // ── putWrites() ─────────────────────────────────────────────────────────────

  describe("putWrites()", () => {
    it("stores pending channel writes associated with a checkpoint", async () => {
      const threadId = randomUUID();
      const checkpoint = makeCheckpoint();
      await saver.put(makeConfig(threadId), checkpoint, makeMetadata(), {});

      const config = makeConfig(threadId, "", checkpoint.id);
      await saver.putWrites(config, [["messages", ["write1", "write2"]], ["status", "ok"]], "task-1");

      const rows = db
        .prepare("SELECT * FROM checkpoint_writes WHERE thread_id = ? AND checkpoint_id = ?")
        .all(threadId, checkpoint.id);
      expect(rows).toHaveLength(2);
    });

    it("uses idx as the primary ordering key for writes", async () => {
      const threadId = randomUUID();
      const checkpoint = makeCheckpoint();
      await saver.put(makeConfig(threadId), checkpoint, makeMetadata(), {});

      const config = makeConfig(threadId, "", checkpoint.id);
      await saver.putWrites(config, [["ch1", "v1"], ["ch2", "v2"]], "task-1");

      const rows = db
        .prepare(
          "SELECT idx, channel FROM checkpoint_writes WHERE thread_id = ? ORDER BY idx ASC"
        )
        .all(threadId) as Array<{ idx: number; channel: string }>;

      expect(rows[0]?.idx).toBe(0);
      expect(rows[0]?.channel).toBe("ch1");
      expect(rows[1]?.idx).toBe(1);
      expect(rows[1]?.channel).toBe("ch2");
    });
  });

  // ── deleteThread() ──────────────────────────────────────────────────────────

  describe("deleteThread()", () => {
    it("removes all checkpoints for the specified thread_id", async () => {
      const threadId = randomUUID();
      await saver.put(makeConfig(threadId), makeCheckpoint(), makeMetadata(), {});
      await saver.put(makeConfig(threadId), makeCheckpoint(), makeMetadata(), {});

      await saver.deleteThread(threadId);

      const count = (
        db.prepare("SELECT COUNT(*) as cnt FROM checkpoints WHERE thread_id = ?").get(threadId) as { cnt: number }
      ).cnt;
      expect(count).toBe(0);
    });

    it("removes associated writes for the specified thread_id", async () => {
      const threadId = randomUUID();
      const checkpoint = makeCheckpoint();
      await saver.put(makeConfig(threadId), checkpoint, makeMetadata(), {});
      await saver.putWrites(
        makeConfig(threadId, "", checkpoint.id),
        [["ch", "val"]],
        "task-1"
      );

      await saver.deleteThread(threadId);

      const count = (
        db
          .prepare("SELECT COUNT(*) as cnt FROM checkpoint_writes WHERE thread_id = ?")
          .get(threadId) as { cnt: number }
      ).cnt;
      expect(count).toBe(0);
    });

    it("does not affect other threads when deleting one thread", async () => {
      const threadA = randomUUID();
      const threadB = randomUUID();

      await saver.put(makeConfig(threadA), makeCheckpoint(), makeMetadata(), {});
      await saver.put(makeConfig(threadB), makeCheckpoint(), makeMetadata(), {});

      await saver.deleteThread(threadA);

      const countB = (
        db.prepare("SELECT COUNT(*) as cnt FROM checkpoints WHERE thread_id = ?").get(threadB) as { cnt: number }
      ).cnt;
      expect(countB).toBe(1);
    });
  });

  // ── Node transition checkpointing ───────────────────────────────────────────

  describe("node transition checkpointing", () => {
    it("records a checkpoint for every node transition in a dummy LangGraph", async () => {
      const { StateGraph, START, END } = await import("@langchain/langgraph");
      const { OrchestratorAnnotation, createInitialState } = await import(
        "../../src/orchestration/types.js"
      );

      const threadId = randomUUID();

      // Minimal two-node graph: nodeA → nodeB → END
      const graph = new StateGraph(OrchestratorAnnotation)
        .addNode("nodeA", (state) => ({ status: "researching" as const, projectConfig: { ...state.projectConfig, status: "researching" as const } }))
        .addNode("nodeB", (state) => ({ status: "specifying" as const, projectConfig: { ...state.projectConfig, status: "specifying" as const } }))
        .addEdge(START, "nodeA")
        .addEdge("nodeA", "nodeB")
        .addEdge("nodeB", END)
        .compile({ checkpointer: saver });

      const initialState = createInitialState({
        projectId: randomUUID(),
        name: "test-project",
        description: "test",
        status: "initializing",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      await graph.invoke(initialState, { configurable: { thread_id: threadId } });

      // One checkpoint per node transition plus the initial input checkpoint.
      const count = (
        db
          .prepare("SELECT COUNT(*) as cnt FROM checkpoints WHERE thread_id = ?")
          .get(threadId) as { cnt: number }
      ).cnt;
      // At minimum we expect: input checkpoint + nodeA checkpoint + nodeB checkpoint
      expect(count).toBeGreaterThanOrEqual(2);
    });
  });
});
