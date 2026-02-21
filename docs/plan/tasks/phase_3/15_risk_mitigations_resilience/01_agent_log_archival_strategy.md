# Task: Implement Agent Log Archival Strategy for `agent_logs` Table (Sub-Epic: 15_Risk Mitigations & Resilience)

## Covered Requirements
- [3_MCP-RISK-101]

## 1. Initial Test Written
- [ ] In `packages/core/src/persistence/__tests__/log-archiver.test.ts`, write unit tests for the `LogArchiver` class:
  - Test `archiveLogsOlderThan(taskIndex: number)`: assert that log rows with `task_index < taskIndex` are moved from `agent_logs` to `agent_logs_archive` and that the original rows are deleted (verify row counts before/after).
  - Test that the `traceability_index` view (or materialized table) still returns accurate metadata (task_id, turn_index, saop_envelope_hash, archived_at) for archived rows — i.e., the index must NOT be deleted, only the raw blob.
  - Test `restoreArchivedLog(logId: string)`: assert that a previously archived blob can be retrieved on-demand from the archive store.
  - Test archival threshold configuration: assert that when `config.log.archiveAfterTasks` is set to `200`, archival is only triggered once the completed-task count exceeds that value.
  - Write an integration test using an in-memory SQLite database (via `better-sqlite3`) that seeds 250 synthetic `agent_logs` rows, runs archival, and validates the index is intact.
  - Test that the `agent_logs` table retains the most recent N rows (configurable `config.log.hotWindowSize`, default 50) regardless of archival threshold.

## 2. Task Implementation
- [ ] In `.devs/state.sqlite`, add a new `agent_logs_archive` table via a migration (see task `02` for migration infrastructure). Schema:
  ```sql
  CREATE TABLE IF NOT EXISTS agent_logs_archive (
    id TEXT PRIMARY KEY,
    task_id TEXT NOT NULL,
    turn_index INTEGER NOT NULL,
    saop_envelope_blob TEXT NOT NULL,   -- gzip-compressed, base64-encoded JSON
    archived_at INTEGER NOT NULL        -- Unix epoch ms
  );
  CREATE INDEX IF NOT EXISTS idx_archive_task ON agent_logs_archive(task_id);
  ```
- [ ] Add a `traceability_index` view in `packages/core/src/persistence/migrations/` that unions metadata from both `agent_logs` and `agent_logs_archive` without selecting the blob column:
  ```sql
  CREATE VIEW IF NOT EXISTS traceability_index AS
    SELECT id, task_id, turn_index, saop_envelope_hash, created_at, NULL AS archived_at FROM agent_logs
    UNION ALL
    SELECT id, task_id, turn_index, saop_envelope_hash, created_at, archived_at FROM agent_logs_archive;
  ```
- [ ] Implement `packages/core/src/persistence/log-archiver.ts`:
  - `class LogArchiver` with constructor `(db: BetterSqlite3.Database, config: LogArchiverConfig)`.
  - `archiveLogsOlderThan(completedTaskCount: number): ArchivalResult` — selects rows outside the hot window, gzip-compresses `saop_envelope_blob`, inserts into `agent_logs_archive`, then deletes from `agent_logs`. Run inside a single SQLite transaction for atomicity.
  - `restoreArchivedLog(id: string): SAOPEnvelope | null` — reads from `agent_logs_archive`, decompresses, and returns parsed `SAOPEnvelope`.
  - `getTraceabilityIndex(taskId: string): TraceRecord[]` — queries the `traceability_index` view.
- [ ] Add `LogArchiverConfig` to `packages/core/src/config/schema.ts`:
  ```ts
  logArchiver: {
    archiveAfterTasks: number;  // default: 200
    hotWindowSize: number;       // default: 50
  }
  ```
- [ ] Wire `LogArchiver.archiveLogsOlderThan()` into the task-completion hook inside `OrchestratorServer` (triggered after each task closes, conditional on completed-task count exceeding threshold).
- [ ] Export `LogArchiver` from `packages/core/src/index.ts`.

## 3. Code Review
- [ ] Verify that archival runs inside a single SQLite transaction — partial archival must not leave orphaned rows in either table.
- [ ] Confirm that `agent_logs_archive` blob column stores gzip-compressed data (not plaintext) to reduce storage footprint.
- [ ] Confirm the `traceability_index` view does not expose the `saop_envelope_blob` column — only metadata.
- [ ] Verify `LogArchiver` has no direct dependency on `OrchestratorServer` internals; it must depend only on the `db` handle and `config` — respect dependency inversion.
- [ ] Ensure `archiveLogsOlderThan` is idempotent: re-running on an already-archived set must be a no-op.
- [ ] Check that `hotWindowSize` rows are always retained in `agent_logs` and never archived prematurely.

## 4. Run Automated Tests to Verify
- [ ] Run `pnpm --filter @devs/core test -- --testPathPattern="log-archiver"` and confirm all tests pass with zero failures.
- [ ] Run the full core test suite `pnpm --filter @devs/core test` to confirm no regressions.

## 5. Update Documentation
- [ ] Create `packages/core/src/persistence/log-archiver.agent.md` documenting: purpose, config keys, archival lifecycle, how to restore an archived log, and the `traceability_index` view contract.
- [ ] Update `packages/core/src/persistence/index.agent.md` to reference `LogArchiver` as a sibling module.
- [ ] Add an entry to `.devs/memory/phase_3_decisions.md`: "Archival strategy: blobs compressed and moved to `agent_logs_archive` after `archiveAfterTasks` completed tasks; index retained in `traceability_index` view."

## 6. Automated Verification
- [ ] Run `pnpm --filter @devs/core test -- --testPathPattern="log-archiver" --coverage` and assert line coverage ≥ 90% for `log-archiver.ts`.
- [ ] Execute `node -e "const {LogArchiver} = require('./packages/core/dist'); console.assert(typeof LogArchiver === 'function', 'LogArchiver must be exported')"` to confirm the export is present in the build artifact.
- [ ] Run `pnpm --filter @devs/core build` and assert exit code 0 (no TypeScript compilation errors).
