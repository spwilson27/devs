# Task: ACID-Compliant Relational State Rollback Engine (Sub-Epic: 03_Relational State Rollback)

## Covered Requirements
- [8_RISKS-REQ-070], [8_RISKS-REQ-115], [9_ROADMAP-REQ-014]

## 1. Initial Test Written
- [ ] In `src/state/__tests__/relational-rollback.test.ts`, write unit tests that verify:
  - `RelationalRollbackEngine.rollbackToTask(targetTaskId)` deletes all rows from `agent_logs`, `tasks`, and `requirements` (and `langgraph_checkpoints`) where `created_at > snapshot_created_at` for the target task — the target task's own row is preserved.
  - The deletion of all three tables occurs inside a single SQLite transaction: if the `requirements` deletion throws, the `agent_logs` and `tasks` deletions are also rolled back.
  - After `rollbackToTask`, calling `StateRepository.readAllTasks()` returns only rows with `created_at <= target_snapshot_created_at`.
  - `rollbackToTask` with a `targetTaskId` that does not exist in the DB throws `UnknownTaskError` before any deletions are attempted.
  - `rollbackToTask` is idempotent: calling it twice with the same `targetTaskId` produces the same final state as calling it once.
  - Rows in `agent_logs` with `task_id = targetTaskId` but `created_at > snapshot_created_at` are deleted (sub-task log trimming within the target task boundary).
  - `getRollbackSnapshot(targetTaskId)` returns `{ taskId, snapshotCreatedAt, affectedRowCounts: { agent_logs, tasks, requirements, langgraph_checkpoints } }` as a dry-run preview without modifying data.
- [ ] Write a property-based test (using `fast-check`) that generates arbitrary lists of tasks with random `created_at` values and asserts that after `rollbackToTask(T)`, exactly the rows with `created_at <= T.created_at` remain — for any valid `T` in the list.

## 2. Task Implementation
- [ ] Create `src/state/RelationalRollbackEngine.ts`:
  - Constructor accepts `db: Database` (better-sqlite3).
  - `getSnapshot(targetTaskId: string): RollbackSnapshot` — queries `tasks` for the target row; extracts `created_at`; counts affected rows in each table using `SELECT COUNT(*) FROM <table> WHERE created_at > ?`.
  - `rollbackToTask(targetTaskId: string): RollbackResult` — wraps the following inside a single `db.transaction()`:
    1. Resolve `snapshot_created_at` from `tasks WHERE task_id = targetTaskId` (throws `UnknownTaskError` if not found — throw *before* the transaction wraps the deletions).
    2. `DELETE FROM agent_logs WHERE created_at > ?` with `snapshot_created_at`.
    3. `DELETE FROM langgraph_checkpoints WHERE created_at > ?` with `snapshot_created_at`.
    4. `DELETE FROM requirements WHERE created_at > ?` with `snapshot_created_at`.
    5. `DELETE FROM tasks WHERE created_at > ?` with `snapshot_created_at`.
    6. Return `RollbackResult` containing counts of deleted rows per table.
  - All `DELETE` statements use prepared statements (no string interpolation).
- [ ] Define `RollbackSnapshot`, `RollbackResult`, and `UnknownTaskError` in `src/state/types.ts`.
- [ ] Integrate `RelationalRollbackEngine.rollbackToTask` into `src/commands/rewind.ts` (the `devs rewind` command handler) — call it *after* `git checkout --force` succeeds and *before* `VectorPruner.pruneAfter` is called, so the order of operations is: Git → SQLite → Vector.
- [ ] Emit a structured log entry to `agent_logs` with `event_type = 'ROLLBACK_COMPLETED'` and the `RollbackResult` payload as the last step inside the transaction.

## 3. Code Review
- [ ] Verify the order of `DELETE` statements respects SQLite foreign key constraints: delete child tables (`agent_logs`, `langgraph_checkpoints`) before parent tables (`tasks`).
- [ ] Confirm that `UnknownTaskError` is thrown *outside* the `db.transaction()` wrapper so no empty transaction is opened when the task doesn't exist.
- [ ] Ensure `rollbackToTask` never uses `DELETE FROM <table>` without a `WHERE` clause — verify via a grep of the file for `DELETE FROM` not followed by `WHERE`.
- [ ] Confirm that the `ROLLBACK_COMPLETED` log entry is appended *inside* the same transaction as the deletions, making the audit trail atomic with the rollback.

## 4. Run Automated Tests to Verify
- [ ] Run `npx jest src/state/__tests__/relational-rollback.test.ts --coverage` and confirm all tests pass with branch coverage ≥ 95%.
- [ ] Run property-based tests: `npx jest --testNamePattern="property"` and confirm at least 100 generated cases pass.
- [ ] Run `npx jest --ci --forceExit --testPathPattern=relational-rollback` and assert exit code `0`.

## 5. Update Documentation
- [ ] Add `RelationalRollbackEngine` API to `docs/architecture/state-management.md` under `## Relational Rollback`, documenting the table deletion order and transactional guarantees.
- [ ] Add a `## devs rewind — State Restoration Order` section to `docs/commands/rewind.md` describing the Git → SQLite → Vector sequence.
- [ ] Update `docs/agent-memory/phase_13_decisions.md`: "Relational rollback deletes rows where `created_at > snapshot_created_at` in a single atomic transaction. Foreign key child tables are deleted before parent tables. Deletion order: agent_logs → langgraph_checkpoints → requirements → tasks."

## 6. Automated Verification
- [ ] Run `npx tsc --noEmit` and confirm zero TypeScript errors in `src/state/RelationalRollbackEngine.ts` and `src/commands/rewind.ts`.
- [ ] Run `grep -n "DELETE FROM" src/state/RelationalRollbackEngine.ts | grep -v "WHERE"` and assert zero lines are returned (no unbounded deletes).
- [ ] Run `npx jest --ci --forceExit --testPathPattern=relational-rollback` and confirm exit code `0`.
