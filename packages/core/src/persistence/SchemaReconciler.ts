/**
 * @devs/core persistence/SchemaReconciler.ts
 *
 * Schema drift detection and reconciliation for the Flight Recorder state store.
 *
 * When a task involves a database schema migration, the orchestrator MUST run a
 * "Schema Reconciliation" turn before executing the task and again after. If the
 * task FAILS, `revert()` restores the database schema to its pre-task state.
 *
 * This module captures schema ONLY — no row data is ever read or stored.
 *
 * Core API:
 *   snapshot()         — Captures the current database schema (tables, columns,
 *                        explicit indexes) as a serialisable value.
 *   diff(baseline)     — Compares the current schema against a baseline snapshot
 *                        and returns a structured diff.
 *   revert(baseline)   — Restores the schema to the baseline state by:
 *                          1. Dropping tables created after the snapshot.
 *                          2. Recreating tables dropped after the snapshot.
 *                          3. Removing columns added after the snapshot (via
 *                             table recreation — preserves pre-existing rows).
 *                          4. Dropping explicit indexes created after the snapshot.
 *                          5. Recreating explicit indexes dropped after the snapshot.
 *
 * Integration: Instantiate with an open `Database.Database`; call `snapshot()`
 * before a task and `revert(snapshot)` if the task fails. The caller controls
 * the lifecycle of the database connection.
 *
 * Requirements: [8_RISKS-REQ-073]
 */

import type Database from "better-sqlite3";

// ── Public types ──────────────────────────────────────────────────────────────

/**
 * Column metadata returned by `PRAGMA table_info(tableName)`.
 * All fields map 1:1 to the PRAGMA output columns.
 */
export interface ColumnInfo {
  /** Column order (0-based). */
  cid: number;
  /** Column name. */
  name: string;
  /** Declared type string (e.g. "INTEGER", "TEXT"). */
  type: string;
  /** 1 if the column has a NOT NULL constraint; 0 otherwise. */
  notnull: number;
  /** Column default value expression as a string, or null if none. */
  dflt_value: string | null;
  /** Position in the PRIMARY KEY (1-based), or 0 if not part of the PK. */
  pk: number;
}

/**
 * Explicit CREATE INDEX metadata captured from `PRAGMA index_list` and
 * `sqlite_master`.
 *
 * Note: only indexes with `origin = 'c'` (explicitly created via `CREATE INDEX`)
 * are captured. Implicit indexes generated from UNIQUE or PRIMARY KEY constraints
 * are already embedded in the table's DDL and are excluded.
 */
export interface IndexInfo {
  /** Index name. */
  name: string;
  /** 1 if the index enforces uniqueness; 0 otherwise. */
  unique: number;
  /** The original `CREATE [UNIQUE] INDEX …` SQL from `sqlite_master`. */
  sql: string;
}

/**
 * Schema metadata for a single table — columns plus all explicit indexes.
 * The `sql` field is the original `CREATE TABLE` DDL from `sqlite_master`;
 * it is used by `revert()` to recreate a dropped table verbatim.
 */
export interface TableSchema {
  /** Table name. */
  name: string;
  /** Original `CREATE TABLE` DDL (from `sqlite_master.sql`). */
  sql: string;
  /** Ordered column metadata (cid ascending). */
  columns: ColumnInfo[];
  /**
   * Explicit CREATE INDEX entries associated with this table.
   * Does NOT include implicit UNIQUE/PK constraint indexes.
   */
  indexes: IndexInfo[];
}

/**
 * A point-in-time snapshot of the full database schema.
 * Contains ONLY structural information — no row data.
 */
export interface SchemaSnapshot {
  /** Map from table name to its full schema description. */
  tables: Record<string, TableSchema>;
  /** ISO-8601 timestamp of when the snapshot was taken. */
  capturedAt: string;
}

/** Per-table diff between a baseline and the current schema. */
export interface TableDiff {
  /** The name of the table that was modified. */
  name: string;
  /** Columns present in the current schema that were absent from the baseline. */
  addedColumns: ColumnInfo[];
  /** Columns present in the baseline that are absent from the current schema. */
  removedColumns: ColumnInfo[];
  /** Explicit indexes present in the current schema that were absent from the baseline. */
  addedIndexes: IndexInfo[];
  /** Explicit indexes present in the baseline that are absent from the current schema. */
  removedIndexes: IndexInfo[];
}

/**
 * Full diff between a baseline snapshot and the current database schema.
 */
export interface SchemaDiff {
  /** Table names present in the current schema but absent from the baseline. */
  addedTables: string[];
  /** Table names present in the baseline but absent from the current schema. */
  removedTables: string[];
  /** Tables present in both but with column/index differences. */
  modifiedTables: TableDiff[];
  /** `true` if any change was detected; `false` if schema is identical. */
  hasChanges: boolean;
}

// ── Internal query result types ───────────────────────────────────────────────

interface SqliteMasterRow {
  name: string;
  sql: string;
  tbl_name: string;
}

interface PragmaTableInfoRow {
  cid: number;
  name: string;
  type: string;
  notnull: number;
  dflt_value: string | null;
  pk: number;
}

interface PragmaIndexListRow {
  seq: number;
  name: string;
  unique: number;
  origin: string;
  partial: number;
}

// ── SchemaReconciler ──────────────────────────────────────────────────────────

/**
 * Schema drift detection and reconciliation utility.
 *
 * Construct with an open, initialised `Database.Database` instance.
 * All PRAGMA queries and DDL operations are synchronous (better-sqlite3).
 *
 * @example
 * ```typescript
 * const reconciler = new SchemaReconciler(db);
 * const baseline = reconciler.snapshot();          // before task
 * try {
 *   runTaskMigration(db);
 *   runTask();
 * } catch {
 *   reconciler.revert(baseline);                   // restore pre-task schema
 * }
 * ```
 */
export class SchemaReconciler {
  private readonly _db: Database.Database;

  constructor(db: Database.Database) {
    this._db = db;
  }

  // ── Public API ─────────────────────────────────────────────────────────────

  /**
   * Captures the current database schema as a serialisable snapshot.
   *
   * Uses `sqlite_master` to enumerate user tables and retrieve their original
   * DDL. For each table, `PRAGMA table_info` is queried for column metadata
   * and `PRAGMA index_list` for explicit CREATE INDEX entries.
   *
   * Only schema is captured — no row data is ever read.
   *
   * @returns A `SchemaSnapshot` representing the current database schema.
   */
  snapshot(): SchemaSnapshot {
    const tables: Record<string, TableSchema> = {};

    // Query all user-created tables from sqlite_master.
    // Exclude: sqlite_* system tables, views, virtual tables (no sql).
    const tableRows = this._db
      .prepare(
        `SELECT name, sql
         FROM sqlite_master
         WHERE type = 'table'
           AND name NOT LIKE 'sqlite_%'
           AND sql IS NOT NULL
         ORDER BY name`
      )
      .all() as SqliteMasterRow[];

    for (const row of tableRows) {
      const columns = this._getTableColumns(row.name);
      const indexes = this._getTableIndexes(row.name);

      tables[row.name] = {
        name: row.name,
        sql: row.sql,
        columns,
        indexes,
      };
    }

    return {
      tables,
      capturedAt: new Date().toISOString(),
    };
  }

  /**
   * Compares the current database schema against a baseline snapshot.
   *
   * @param baseline - The snapshot to compare against (typically captured
   *                   before a task's schema migration began).
   * @returns A `SchemaDiff` describing every structural change.
   */
  diff(baseline: SchemaSnapshot): SchemaDiff {
    const current = this.snapshot();

    const baselineNames = new Set(Object.keys(baseline.tables));
    const currentNames = new Set(Object.keys(current.tables));

    // Tables present in current but not in baseline.
    const addedTables = [...currentNames].filter((n) => !baselineNames.has(n));

    // Tables present in baseline but not in current.
    const removedTables = [...baselineNames].filter(
      (n) => !currentNames.has(n)
    );

    // Tables present in both — check for column/index modifications.
    const modifiedTables: TableDiff[] = [];

    for (const tableName of baselineNames) {
      if (!currentNames.has(tableName)) continue; // Already counted as removed.

      const baselineTable = baseline.tables[tableName];
      const currentTable = current.tables[tableName];

      const tableDiff = this._diffTable(baselineTable, currentTable);
      if (
        tableDiff.addedColumns.length > 0 ||
        tableDiff.removedColumns.length > 0 ||
        tableDiff.addedIndexes.length > 0 ||
        tableDiff.removedIndexes.length > 0
      ) {
        modifiedTables.push(tableDiff);
      }
    }

    const hasChanges =
      addedTables.length > 0 ||
      removedTables.length > 0 ||
      modifiedTables.length > 0;

    return { addedTables, removedTables, modifiedTables, hasChanges };
  }

  /**
   * Restores the database schema to the state captured in `baseline`.
   *
   * Operations performed (all within a single SQLite transaction):
   *   1. **Drop added tables** — tables created after the snapshot are dropped.
   *      Foreign key enforcement is temporarily suspended to allow arbitrary
   *      drop order. Multiple passes are attempted to handle inter-table FKs.
   *   2. **Recreate removed tables** — tables dropped after the snapshot are
   *      recreated verbatim using the DDL stored in the snapshot, then their
   *      baseline explicit indexes are recreated.
   *   3. **Restore modified tables with column changes** — tables with added
   *      or removed columns are recreated from the snapshot DDL; rows for the
   *      original columns are copied over (task-added columns are discarded;
   *      task-removed columns reappear with NULL / default values). After
   *      recreation, ALL baseline explicit indexes for that table are restored
   *      (because table recreation drops every index on the table, including
   *      pre-existing ones that are not part of the `CREATE TABLE` DDL).
   *   4. **Drop added indexes** — for tables that were NOT recreated in step 3,
   *      drop any explicit CREATE INDEX entries added since the baseline.
   *   5. **Recreate removed indexes** — for tables that were NOT recreated in
   *      step 3, recreate any explicit CREATE INDEX entries dropped since the
   *      baseline.
   *
   * This method only touches schema, never reads or modifies row data beyond
   * what is necessary to preserve rows during table recreation.
   *
   * @param baseline - The pre-task schema snapshot to restore.
   */
  revert(baseline: SchemaSnapshot): void {
    const currentDiff = this.diff(baseline);
    if (!currentDiff.hasChanges) return;

    // Disable FK enforcement for the duration of the revert so tables can be
    // dropped and recreated in any order. Restored afterward in a finally block.
    const fkWasEnabled =
      (this._db.pragma("foreign_keys", { simple: true }) as number) === 1;
    this._db.pragma("foreign_keys = OFF");

    try {
      this._db.transaction(() => {
        // ── 1. Drop tables added since the baseline ────────────────────────
        // Multiple passes to handle FK inter-dependencies among added tables.
        let pending = [...currentDiff.addedTables];
        let maxPasses = pending.length + 1;

        while (pending.length > 0 && maxPasses-- > 0) {
          const failed: string[] = [];
          for (const tableName of pending) {
            try {
              this._db
                .prepare(`DROP TABLE IF EXISTS "${tableName}"`)
                .run();
            } catch {
              failed.push(tableName);
            }
          }
          pending = failed;
        }

        // ── 2. Recreate tables that were removed since the baseline ────────
        for (const tableName of currentDiff.removedTables) {
          const snapshotTable = baseline.tables[tableName];
          if (snapshotTable?.sql) {
            this._db.prepare(snapshotTable.sql).run();
          }
          // Restore the baseline explicit indexes for the recreated table.
          for (const idx of snapshotTable?.indexes ?? []) {
            if (idx.sql) {
              this._db.prepare(idx.sql).run();
            }
          }
        }

        // ── 3. Fix modified tables with column changes ─────────────────────
        // Track tables that underwent full recreation so steps 4 and 5 can
        // skip them (their index state is fully managed here).
        const recreatedTables = new Set<string>();

        for (const tableDiff of currentDiff.modifiedTables) {
          if (
            tableDiff.addedColumns.length === 0 &&
            tableDiff.removedColumns.length === 0
          ) {
            // Index-only change: handled in steps 4 and 5.
            continue;
          }

          this._revertTableColumns(
            tableDiff.name,
            baseline.tables[tableDiff.name]
          );
          recreatedTables.add(tableDiff.name);

          // Table recreation (rename → create → copy → drop) drops ALL indexes
          // on the table, including pre-existing baseline indexes that are NOT
          // embedded in the CREATE TABLE DDL. Restore them now.
          for (const idx of baseline.tables[tableDiff.name].indexes) {
            if (idx.sql) {
              this._db.prepare(idx.sql).run();
            }
          }
        }

        // ── 4. Drop explicit indexes added since the baseline ──────────────
        // Only applies to tables that were NOT fully recreated in step 3.
        for (const tableDiff of currentDiff.modifiedTables) {
          if (recreatedTables.has(tableDiff.name)) continue;
          for (const idx of tableDiff.addedIndexes) {
            this._db.prepare(`DROP INDEX IF EXISTS "${idx.name}"`).run();
          }
        }

        // ── 5. Recreate explicit indexes removed since the baseline ────────
        // Only applies to tables that were NOT fully recreated in step 3.
        for (const tableDiff of currentDiff.modifiedTables) {
          if (recreatedTables.has(tableDiff.name)) continue;
          for (const idx of tableDiff.removedIndexes) {
            if (idx.sql) {
              this._db.prepare(idx.sql).run();
            }
          }
        }
      })();
    } finally {
      // Always restore FK enforcement to its prior state.
      if (fkWasEnabled) {
        this._db.pragma("foreign_keys = ON");
      }
    }
  }

  // ── Private helpers ────────────────────────────────────────────────────────

  /**
   * Reads column metadata for `tableName` via `PRAGMA table_info`.
   */
  private _getTableColumns(tableName: string): ColumnInfo[] {
    return this._db
      .prepare(`PRAGMA table_info("${tableName}")`)
      .all() as PragmaTableInfoRow[];
  }

  /**
   * Reads explicit CREATE INDEX entries for `tableName`.
   *
   * Only indexes with `origin = 'c'` (explicitly created) are included.
   * Implicit UNIQUE/PK constraint indexes are excluded because they are
   * already captured in the table's CREATE TABLE DDL.
   */
  private _getTableIndexes(tableName: string): IndexInfo[] {
    const indexRows = this._db
      .prepare(`PRAGMA index_list("${tableName}")`)
      .all() as PragmaIndexListRow[];

    const explicitIndexes = indexRows.filter((r) => r.origin === "c");
    if (explicitIndexes.length === 0) return [];

    const result: IndexInfo[] = [];

    for (const idx of explicitIndexes) {
      // Look up the DDL in sqlite_master to enable exact recreation on revert.
      const masterRow = this._db
        .prepare(
          `SELECT sql FROM sqlite_master WHERE type = 'index' AND name = ?`
        )
        .get(idx.name) as { sql: string } | undefined;

      if (masterRow?.sql) {
        result.push({
          name: idx.name,
          unique: idx.unique,
          sql: masterRow.sql,
        });
      }
    }

    return result;
  }

  /**
   * Compares the column and index lists of a single table between two snapshots.
   */
  private _diffTable(
    baselineTable: TableSchema,
    currentTable: TableSchema
  ): TableDiff {
    const baselineColNames = new Set(baselineTable.columns.map((c) => c.name));
    const currentColNames = new Set(currentTable.columns.map((c) => c.name));

    const addedColumns = currentTable.columns.filter(
      (c) => !baselineColNames.has(c.name)
    );
    const removedColumns = baselineTable.columns.filter(
      (c) => !currentColNames.has(c.name)
    );

    const baselineIdxNames = new Set(baselineTable.indexes.map((i) => i.name));
    const currentIdxNames = new Set(currentTable.indexes.map((i) => i.name));

    const addedIndexes = currentTable.indexes.filter(
      (i) => !baselineIdxNames.has(i.name)
    );
    const removedIndexes = baselineTable.indexes.filter(
      (i) => !currentIdxNames.has(i.name)
    );

    return {
      name: currentTable.name,
      addedColumns,
      removedColumns,
      addedIndexes,
      removedIndexes,
    };
  }

  /**
   * Recreates `tableName` using the DDL from `snapshotTable`, copying only the
   * columns that existed in the snapshot (discarding task-added columns).
   *
   * If the task *removed* a column that was in the snapshot, the recreated
   * table will have that column back (populated with NULL / the column default).
   *
   * Steps:
   *   1. Rename the current table to a temporary name.
   *   2. Recreate the original table from snapshot DDL.
   *   3. Copy rows for the columns that exist in BOTH the current table and
   *      the snapshot (common columns). Task-added columns are excluded from
   *      the SELECT; task-removed columns are filled with NULL / default.
   *   4. Drop the temporary table.
   *
   * All steps run inside the caller's transaction (no nested begin/commit).
   */
  private _revertTableColumns(
    tableName: string,
    snapshotTable: TableSchema
  ): void {
    const tmpName = `_devs_revert_${tableName}_${Date.now()}_${Math.trunc(Math.random() * 1e6)}`;

    // Determine which columns are safe to copy: those that exist in BOTH the
    // current table (now renamed to tmp) AND the snapshot (new table structure).
    const currentCols = (
      this._db
        .prepare(`PRAGMA table_info("${tableName}")`)
        .all() as PragmaTableInfoRow[]
    ).map((c) => c.name);

    const snapshotColNames = new Set(
      snapshotTable.columns.map((c) => c.name)
    );

    // Columns to copy: exist in both current (to SELECT from) and snapshot (to INSERT into).
    const colsToCopy = currentCols
      .filter((name) => snapshotColNames.has(name))
      .map((name) => `"${name}"`)
      .join(", ");

    // 1. Rename current table → tmp.
    this._db
      .prepare(`ALTER TABLE "${tableName}" RENAME TO "${tmpName}"`)
      .run();

    // 2. Recreate original table from snapshot DDL.
    this._db.prepare(snapshotTable.sql).run();

    // 3. Copy common-column rows (only when there are rows to copy).
    if (colsToCopy.length > 0) {
      this._db
        .prepare(
          `INSERT INTO "${tableName}" (${colsToCopy}) SELECT ${colsToCopy} FROM "${tmpName}"`
        )
        .run();
    }

    // 4. Drop the temporary table.
    this._db.prepare(`DROP TABLE "${tmpName}"`).run();
  }
}
