/**
 * packages/core/src/orchestration/SqliteSaver.ts
 *
 * LangGraph `BaseCheckpointSaver` implementation backed by the Flight Recorder
 * SQLite database (`better-sqlite3`).
 *
 * ## Purpose
 *
 * `SqliteSaver` is the "Glass-Box" audit trail component of the devs orchestrator.
 * Every node transition in the LangGraph StateGraph triggers a `put()` call that
 * persists the full serialized graph state to SQLite. This enables:
 * - **Crash recovery:** Resume an interrupted run from the last committed checkpoint.
 * - **Historical analysis:** All node transitions are queryable via `list()`.
 * - **ACID guarantees:** Every `put` and `putWrites` call is wrapped in a
 *   `better-sqlite3` transaction — no partial checkpoints can exist on disk.
 *
 * ## Schema
 *
 * Two tables are created on construction (using `CREATE TABLE IF NOT EXISTS`):
 *
 * ```sql
 * checkpoints (
 *   thread_id            TEXT NOT NULL,
 *   checkpoint_ns        TEXT NOT NULL DEFAULT '',
 *   checkpoint_id        TEXT NOT NULL,
 *   parent_checkpoint_id TEXT,
 *   type                 TEXT,          -- serde type tag
 *   checkpoint           BLOB NOT NULL, -- JSON-serialized Checkpoint object
 *   metadata             BLOB NOT NULL, -- JSON-serialized CheckpointMetadata
 *   created_at           TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
 *   PRIMARY KEY (thread_id, checkpoint_ns, checkpoint_id)
 * )
 *
 * checkpoint_writes (
 *   thread_id     TEXT NOT NULL,
 *   checkpoint_ns TEXT NOT NULL DEFAULT '',
 *   checkpoint_id TEXT NOT NULL,
 *   task_id       TEXT NOT NULL,
 *   idx           INTEGER NOT NULL,
 *   channel       TEXT NOT NULL,
 *   type          TEXT,                  -- serde type tag
 *   value         BLOB,                  -- JSON-serialized channel value
 *   PRIMARY KEY (thread_id, checkpoint_ns, checkpoint_id, task_id, idx)
 * )
 * ```
 *
 * ## ACID contract
 *
 * `better-sqlite3` is fully synchronous; wrapping each statement in
 * `db.transaction(fn)()` guarantees that writes are atomic.
 * If any error is thrown inside the transaction callback, better-sqlite3
 * automatically rolls back — no partial row is ever committed.
 *
 * ## Serialization
 *
 * The `serde` protocol inherited from `BaseCheckpointSaver` is used to
 * serialize and deserialize all checkpoint and write payloads.
 * `dumpsTyped(data)` returns `[type: string, bytes: Uint8Array]`.
 * `loadsTyped(type, bytes)` reconstructs the original value.
 * Both `Checkpoint` and `CheckpointMetadata` objects go through this path.
 *
 * Requirements: [9_ROADMAP-REQ-014]
 */

import type Database from "better-sqlite3";
import type { Statement } from "better-sqlite3";
import type { RunnableConfig } from "@langchain/core/runnables";
import { EventEmitter } from "events";
import {
  BaseCheckpointSaver,
  type Checkpoint,
  type CheckpointMetadata,
  type CheckpointTuple,
} from "@langchain/langgraph";
import { SecretMaskerFactory, type ISecretMasker } from "../../../secret-masker/src/index.js";

// Local type aliases for checkpoint types not re-exported by @langchain/langgraph.
// These are structurally compatible with the definitions in @langchain/langgraph-checkpoint.
/** Mapping from channel name to its current version (number or string). */
type ChannelVersions = Record<string, number | string>;
/** Options for the `list()` generator. */
type CheckpointListOptions = {
  limit?: number;
  before?: RunnableConfig;
  filter?: Record<string, unknown>;
};
/** A pending channel write: [channel_name, value]. */
type PendingWrite = [string, unknown];

// ── DDL ───────────────────────────────────────────────────────────────────────

const DDL_CHECKPOINTS = `
  CREATE TABLE IF NOT EXISTS checkpoints (
    thread_id            TEXT NOT NULL,
    checkpoint_ns        TEXT NOT NULL DEFAULT '',
    checkpoint_id        TEXT NOT NULL,
    parent_checkpoint_id TEXT,
    type                 TEXT,
    checkpoint           BLOB NOT NULL,
    metadata             BLOB NOT NULL,
    created_at           TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
    PRIMARY KEY (thread_id, checkpoint_ns, checkpoint_id)
  )
`;

const DDL_CHECKPOINT_WRITES = `
  CREATE TABLE IF NOT EXISTS checkpoint_writes (
    thread_id     TEXT NOT NULL,
    checkpoint_ns TEXT NOT NULL DEFAULT '',
    checkpoint_id TEXT NOT NULL,
    task_id       TEXT NOT NULL,
    idx           INTEGER NOT NULL,
    channel       TEXT NOT NULL,
    type          TEXT,
    value         BLOB,
    PRIMARY KEY (thread_id, checkpoint_ns, checkpoint_id, task_id, idx)
  )
`;

// ── Raw DB row shapes ─────────────────────────────────────────────────────────

interface CheckpointRow {
  thread_id: string;
  checkpoint_ns: string;
  checkpoint_id: string;
  parent_checkpoint_id: string | null;
  type: string | null;
  checkpoint: Buffer | Uint8Array | string;
  metadata: Buffer | Uint8Array | string;
  created_at: string;
}

// ── SqliteSaver ───────────────────────────────────────────────────────────────

/**
 * Synchronous SQLite-backed LangGraph checkpoint saver.
 *
 * Construct with an open, schema-initialised `Database.Database` instance
 * (obtained from `createDatabase()` or `getDatabase()`).
 *
 * The class creates its own `checkpoints` and `checkpoint_writes` tables if
 * they do not already exist (idempotent `CREATE TABLE IF NOT EXISTS`).
 *
 * All write operations are wrapped in `better-sqlite3` transactions to
 * guarantee ACID semantics. The async API contract inherited from
 * `BaseCheckpointSaver` is satisfied by returning resolved Promises wrapping
 * the synchronous results — `better-sqlite3` is always synchronous.
 *
 * @example
 * ```ts
 * import { createDatabase } from "@devs/core";
 * import { SqliteSaver } from "@devs/core";
 * import { StateGraph, START, END } from "@langchain/langgraph";
 *
 * const db = createDatabase({ dbPath: ".devs/state.sqlite" });
 * const saver = new SqliteSaver(db);
 *
 * const graph = new StateGraph(MyAnnotation)
 *   .addNode("node", myNode)
 *   .addEdge(START, "node")
 *   .addEdge("node", END)
 *   .compile({ checkpointer: saver });
 *
 * await graph.invoke(initialState, { configurable: { thread_id: "run-1" } });
 * ```
 */
export class SqliteSaver extends BaseCheckpointSaver {
  private readonly db: Database.Database;
  private readonly masker: ISecretMasker;
  private readonly _emitter = new EventEmitter();

  public get emitter() {
    return this._emitter;
  }

  // ── Prepared statements ──────────────────────────────────────────────────

  /** @internal exposed for tests that need to spy on transactional put */
  _stmtPutCheckpoint: Statement;
  private readonly _stmtGetCheckpointLatest: Statement;
  private readonly _stmtGetCheckpointById: Statement;
  private readonly _stmtListCheckpoints: Statement;
  private readonly _stmtListCheckpointsLimit: Statement;
  private readonly _stmtPutWrite: Statement;
  private readonly _stmtDeleteCheckpoints: Statement;
  private readonly _stmtDeleteWrites: Statement;

  constructor(db: Database.Database) {
    super();
    this.db = db;
    this.masker = SecretMaskerFactory.create();

    // Create tables (idempotent).
    db.transaction(() => {
      db.exec(DDL_CHECKPOINTS);
      db.exec(DDL_CHECKPOINT_WRITES);
    })();

    // Compile all statements once in the constructor.
    this._stmtPutCheckpoint = db.prepare(`
      INSERT OR REPLACE INTO checkpoints
        (thread_id, checkpoint_ns, checkpoint_id, parent_checkpoint_id, type, checkpoint, metadata)
      VALUES
        (@thread_id, @checkpoint_ns, @checkpoint_id, @parent_checkpoint_id, @type, @checkpoint, @metadata)
    `);

    // Fetch latest checkpoint for a thread (most recent by rowid).
    this._stmtGetCheckpointLatest = db.prepare(`
      SELECT * FROM checkpoints
      WHERE thread_id = ? AND checkpoint_ns = ?
      ORDER BY rowid DESC
      LIMIT 1
    `);

    // Fetch a specific checkpoint by thread_id + checkpoint_ns + checkpoint_id.
    this._stmtGetCheckpointById = db.prepare(`
      SELECT * FROM checkpoints
      WHERE thread_id = ? AND checkpoint_ns = ? AND checkpoint_id = ?
    `);

    // List all checkpoints for a thread (most recent first) — no limit.
    this._stmtListCheckpoints = db.prepare(`
      SELECT * FROM checkpoints
      WHERE thread_id = ? AND checkpoint_ns = ?
      ORDER BY rowid DESC
    `);

    // List checkpoints with a LIMIT clause.
    this._stmtListCheckpointsLimit = db.prepare(`
      SELECT * FROM checkpoints
      WHERE thread_id = ? AND checkpoint_ns = ?
      ORDER BY rowid DESC
      LIMIT ?
    `);

    // SECURITY: checkpoint_writes.value is redacted via SecretMasker before persistence (see SqliteSaver.redactBeforeSave).
    this._stmtPutWrite = db.prepare(`
      INSERT OR REPLACE INTO checkpoint_writes
        (thread_id, checkpoint_ns, checkpoint_id, task_id, idx, channel, type, value)
      VALUES
        (@thread_id, @checkpoint_ns, @checkpoint_id, @task_id, @idx, @channel, @type, @value)
    `);

    this._stmtDeleteCheckpoints = db.prepare(
      "DELETE FROM checkpoints WHERE thread_id = ?"
    );

    this._stmtDeleteWrites = db.prepare(
      "DELETE FROM checkpoint_writes WHERE thread_id = ?"
    );
  }

  // ── Private helpers ───────────────────────────────────────────────────────

  private _threadId(config: RunnableConfig): string {
    return String(config.configurable?.thread_id ?? "");
  }

  private _checkpointNs(config: RunnableConfig): string {
    return String(config.configurable?.checkpoint_ns ?? "");
  }

  private _checkpointId(config: RunnableConfig): string | undefined {
    const id = config.configurable?.checkpoint_id;
    return typeof id === "string" ? id : undefined;
  }

  /**
   * Deserializes a raw checkpoint row from SQLite into a `CheckpointTuple`.
   */
  private async _rowToTuple(row: CheckpointRow): Promise<CheckpointTuple> {
    // Convert Buffer / string to Uint8Array for the serde protocol.
    const toUint8 = (v: Buffer | Uint8Array | string): Uint8Array => {
      if (typeof v === "string") {
        return new TextEncoder().encode(v);
      }
      return v instanceof Buffer ? new Uint8Array(v) : v;
    };

    const checkpoint = (await this.serde.loadsTyped(
      row.type ?? "json",
      toUint8(row.checkpoint)
    )) as Checkpoint;

    const metadata = (await this.serde.loadsTyped(
      row.type ?? "json",
      toUint8(row.metadata)
    )) as CheckpointMetadata;

    const config: RunnableConfig = {
      configurable: {
        thread_id: row.thread_id,
        checkpoint_ns: row.checkpoint_ns,
        checkpoint_id: row.checkpoint_id,
      },
    };

    const parentConfig: RunnableConfig | undefined =
      row.parent_checkpoint_id !== null
        ? {
            configurable: {
              thread_id: row.thread_id,
              checkpoint_ns: row.checkpoint_ns,
              checkpoint_id: row.parent_checkpoint_id,
            },
          }
        : undefined;

    return { config, checkpoint, metadata, parentConfig };
  }

  // ── BaseCheckpointSaver interface ─────────────────────────────────────────

  /**
   * Redacts a value before it is saved to SQLite.
   * - Returns null for null/undefined inputs.
   * - Converts non-string values to string (Buffer -> utf8) before masking.
   */
  private redactBeforeSave(value: unknown): string | null {
    if (value === null || typeof value === "undefined") {
      return null;
    }

    let s: string;
    if (typeof value === "string") {
      s = value;
    } else if (value instanceof Buffer) {
      s = value.toString("utf8");
    } else {
      try {
        s = String(value);
      } catch {
        s = "";
      }
    }

    const result = this.masker.mask(s) as any;
    const hitCount: number = result.hitCount ?? (Array.isArray(result.hits) ? result.hits.length : 0);

    if (hitCount > 0) {
      const patterns = Array.isArray(result.hits) ? result.hits.map((h: any) => h.pattern) : [];
      this._emitter.emit("secret-redacted", {
        table: "checkpoint_writes",
        column: "value",
        hitCount,
        patterns,
      });
    }

    return result.masked ?? s;
  }

  /**
   * Loads the latest (or a specific) checkpoint for the given thread.
   *
   * If `config.configurable.checkpoint_id` is set, returns that exact
   * checkpoint. Otherwise returns the most recently inserted checkpoint for
   * `config.configurable.thread_id`.
   *
   * @returns `CheckpointTuple` or `undefined` if no matching checkpoint exists.
   */
  async getTuple(config: RunnableConfig): Promise<CheckpointTuple | undefined> {
    const threadId = this._threadId(config);
    const ns = this._checkpointNs(config);
    const checkpointId = this._checkpointId(config);

    let row: CheckpointRow | undefined;

    if (checkpointId !== undefined) {
      row = this._stmtGetCheckpointById.get(threadId, ns, checkpointId) as
        | CheckpointRow
        | undefined;
    } else {
      row = this._stmtGetCheckpointLatest.get(threadId, ns) as
        | CheckpointRow
        | undefined;
    }

    if (row === undefined) {
      return undefined;
    }

    return this._rowToTuple(row);
  }

  /**
   * Yields all checkpoints for `config.configurable.thread_id` in reverse
   * chronological order (most recent first).
   *
   * Supports an optional `options.limit` to cap the number of results.
   *
   * Note: `options.before` (filter checkpoints older than a given config) is
   * not implemented in this Phase 1 version. The orchestration graph uses a
   * strictly linear topology so `getTuple` (latest or by ID) is sufficient
   * for crash recovery. Phase 13 will add `before` support for branching
   * scenarios.
   */
  async *list(
    config: RunnableConfig,
    options?: CheckpointListOptions
  ): AsyncGenerator<CheckpointTuple> {
    const threadId = this._threadId(config);
    const ns = this._checkpointNs(config);

    let rows: CheckpointRow[];

    if (options?.limit !== undefined) {
      rows = this._stmtListCheckpointsLimit.all(threadId, ns, options.limit) as CheckpointRow[];
    } else {
      rows = this._stmtListCheckpoints.all(threadId, ns) as CheckpointRow[];
    }

    for (const row of rows) {
      yield await this._rowToTuple(row);
    }
  }

  /**
   * Persists a checkpoint for a node transition.
   *
   * The entire write is wrapped in a `better-sqlite3` transaction — if the
   * database throws (e.g. disk full, constraint violation), the transaction
   * is automatically rolled back and the previous checkpoint remains intact.
   *
   * @param config     - The current run config carrying `thread_id` etc.
   * @param checkpoint - The full LangGraph checkpoint snapshot.
   * @param metadata   - Per-checkpoint metadata (step, source, parents).
   * @param _newVersions - Channel version map (stored in the checkpoint blob).
   * @returns A new `RunnableConfig` with `checkpoint_id` pointing to this checkpoint.
   */
  async put(
    config: RunnableConfig,
    checkpoint: Checkpoint,
    metadata: CheckpointMetadata,
    _newVersions: ChannelVersions
  ): Promise<RunnableConfig> {
    const threadId = this._threadId(config);
    const ns = this._checkpointNs(config);
    const parentCheckpointId = this._checkpointId(config) ?? null;

    // Serialize checkpoint and metadata via the inherited serde protocol.
    const [cpType, cpBytes] = await this.serde.dumpsTyped(checkpoint);
    const [, metaBytes] = await this.serde.dumpsTyped(metadata);

    // Wrap the write in a transaction — ACID guarantee.
    this.db.transaction(() => {
      this._stmtPutCheckpoint.run({
        thread_id: threadId,
        checkpoint_ns: ns,
        checkpoint_id: checkpoint.id,
        parent_checkpoint_id: parentCheckpointId,
        type: cpType,
        checkpoint: Buffer.from(cpBytes),
        metadata: Buffer.from(metaBytes),
      });
    })();

    // Return a new config pointing at the newly stored checkpoint.
    return {
      configurable: {
        ...config.configurable,
        thread_id: threadId,
        checkpoint_ns: ns,
        checkpoint_id: checkpoint.id,
      },
    };
  }

  /**
   * Persists intermediate channel writes associated with an in-progress checkpoint.
   *
   * Each write is stored as a separate row in `checkpoint_writes`, keyed by
   * `(thread_id, checkpoint_ns, checkpoint_id, task_id, idx)`.
   * The entire batch is wrapped in a single transaction.
   *
   * @param config  - Run config carrying `thread_id` and `checkpoint_id`.
   * @param writes  - Array of `[channel, value]` pairs to store.
   * @param taskId  - The task that produced these writes.
   */
  async putWrites(
    config: RunnableConfig,
    writes: PendingWrite[],
    taskId: string
  ): Promise<void> {
    const threadId = this._threadId(config);
    const ns = this._checkpointNs(config);
    const checkpointId = this._checkpointId(config) ?? "";

    this.db.transaction(() => {
      for (let idx = 0; idx < writes.length; idx++) {
        const [channel, value] = writes[idx]!;
        // Serialize the channel value; ignore the returned type string since
        // the value is trivially JSON-compatible for the built-in serde.
        const redacted = this.redactBeforeSave(value);
        const serialized = redacted === null ? null : JSON.stringify(redacted);
        this._stmtPutWrite.run({
          thread_id: threadId,
          checkpoint_ns: ns,
          checkpoint_id: checkpointId,
          task_id: taskId,
          idx,
          channel,
          type: "json",
          value: serialized,
        });
      }
    })();
  }

  /**
   * Deletes all checkpoints and associated writes for the specified `thread_id`.
   *
   * Both deletions are wrapped in a single transaction so either both succeed
   * or neither does.
   *
   * @param threadId - The thread whose state should be erased.
   */
  async deleteThread(threadId: string): Promise<void> {
    this.db.transaction(() => {
      this._stmtDeleteWrites.run(threadId);
      this._stmtDeleteCheckpoints.run(threadId);
    })();
  }

  /**
   * Closes the underlying database connection.
   *
   * Call this in test `afterEach` / `afterAll` hooks. In production the
   * lifetime of the database is managed by `createDatabase()` / `closeDatabase()`.
   */
  close(): void {
    // Only close if this instance directly owns the db (not the singleton).
    // We close unconditionally here since tests pass isolated db instances.
    try {
      this.db.close();
    } catch {
      // Already closed — ignore.
    }
  }
}
