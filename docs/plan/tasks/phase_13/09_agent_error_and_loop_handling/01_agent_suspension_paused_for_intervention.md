# Task: Implement Agent Suspension and PAUSED_FOR_INTERVENTION State (Sub-Epic: 09_Agent Error and Loop Handling)

## Covered Requirements
- [8_RISKS-REQ-074]

## 1. Initial Test Written
- [ ] In `src/orchestration/__tests__/agentSuspension.test.ts`, write unit tests covering:
  - `suspendAgent(taskId)` transitions the task's `status` field from `IN_PROGRESS` to `PAUSED_FOR_INTERVENTION` in SQLite (`tasks` table).
  - After `suspendAgent(taskId)`, the sandbox working directory and all in-flight artefacts (e.g., partial file writes, tool call history) are persisted to the `agent_suspension_snapshots` table (columns: `task_id`, `snapshot_json`, `suspended_at`).
  - Calling `suspendAgent` on a task already in `PAUSED_FOR_INTERVENTION` is a no-op and does not throw.
  - `suspendAgent` emits a `task:suspended` event on the shared EventEmitter with payload `{ taskId, reason }`.
  - Write an integration test: when a running agent turn is forcibly interrupted (simulated via `process.emit('SIGTERM')`), `suspendAgent` is invoked automatically before the process exits.
- [ ] Write tests for `getSuspendedSnapshot(taskId)`: it returns the full JSON snapshot stored during suspension, or `null` if none exists.
- [ ] Tests must use an in-memory SQLite database (via `better-sqlite3` with `:memory:`) to avoid filesystem side-effects.

## 2. Task Implementation
- [ ] In `src/orchestration/agentSuspension.ts`, implement:
  - `suspendAgent(taskId: string, reason: string): Promise<void>`:
    1. Open a SQLite transaction.
    2. Update `tasks` table: `SET status = 'PAUSED_FOR_INTERVENTION', paused_at = CURRENT_TIMESTAMP, pause_reason = ?` where `id = taskId`.
    3. Capture the current sandbox state: serialize in-flight tool call history, partial file write buffer, and current LangGraph node name into a JSON string.
    4. Upsert into `agent_suspension_snapshots(task_id, snapshot_json, suspended_at)`.
    5. Commit transaction. Emit `task:suspended` event.
  - `getSuspendedSnapshot(taskId: string): SuspensionSnapshot | null` — queries `agent_suspension_snapshots` by `task_id`.
  - Register a `process.on('SIGTERM', ...)` and `process.on('SIGINT', ...)` handler in the orchestrator bootstrap (`src/orchestration/bootstrap.ts`) that calls `suspendAgent` for any currently active task before exiting.
- [ ] Add `status` enum value `PAUSED_FOR_INTERVENTION` to the task status type in `src/types/task.ts`.
- [ ] Add the `agent_suspension_snapshots` table to the DB migration file (`src/db/migrations/XXXX_add_suspension_snapshots.sql`) with columns: `task_id TEXT PRIMARY KEY, snapshot_json TEXT NOT NULL, suspended_at TEXT NOT NULL`.
- [ ] The sandbox working directory must NOT be deleted on suspension — only on explicit cleanup or successful completion.

## 3. Code Review
- [ ] Verify the SQLite transaction is atomic: no partial state updates are written on failure.
- [ ] Confirm signal handlers are registered only once (guard against duplicate registration on hot-reload).
- [ ] Verify `SuspensionSnapshot` type is exported from `src/types/` and used consistently (no `any` casts).
- [ ] Confirm the sandbox preservation logic does not copy large binary files unnecessarily — it should store metadata references, not raw file content.
- [ ] Check that the `task:suspended` event payload matches the `TaskEvent` discriminated union type.

## 4. Run Automated Tests to Verify
- [ ] Run `npm test -- --testPathPattern=agentSuspension` and confirm all tests pass with zero failures.
- [ ] Run `npm test -- --coverage --testPathPattern=agentSuspension` and confirm line coverage ≥ 90% for `src/orchestration/agentSuspension.ts`.

## 5. Update Documentation
- [ ] Update `src/orchestration/agentSuspension.agent.md` (create if absent) to document:
  - Intent: suspend an active agent turn safely, preserving sandbox state.
  - Edge Cases: duplicate suspension calls, missing task IDs, SIGTERM during DB write.
  - Testability: all paths exercised by unit tests with in-memory DB.
- [ ] Add a row to the `docs/state-machine.md` state transition table: `IN_PROGRESS → PAUSED_FOR_INTERVENTION` with trigger `suspendAgent()`.

## 6. Automated Verification
- [ ] Add a CI step in `.github/workflows/ci.yml` (or equivalent) that runs `npm test -- --testPathPattern=agentSuspension --ci` and fails the build if any test fails or coverage drops below 90%.
- [ ] Run `npx ts-node scripts/verify_migration.ts` (or equivalent schema verifier) to confirm the `agent_suspension_snapshots` table exists in the migration output with the correct columns and constraints.
