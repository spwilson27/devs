# Task: Implement HumanInTheLoopManager with Wait-for-Approval Gates (Sub-Epic: 13_Human-in-the-Loop Recovery)

## Covered Requirements
- [2_TAS-REQ-019]

## 1. Initial Test Written
- [ ] Create `src/orchestration/__tests__/HumanInTheLoopManager.test.ts` with the following test coverage:
  - **Unit: `pause()` serializes graph state** — Call `HumanInTheLoopManager.pause(graphState, taskId)` and assert the returned `SuspendedSession` record is written to SQLite (`hitl_sessions` table) with fields: `task_id`, `graph_state_json`, `suspended_at`, `status = 'awaiting_approval'`.
  - **Unit: `resume()` restores graph state** — Insert a stub `hitl_sessions` row, call `HumanInTheLoopManager.resume(sessionId)`, and assert the deserialized `graphState` matches the original snapshot and that `status` is updated to `'resumed'`.
  - **Unit: `resume()` throws on missing session** — Assert `resume('nonexistent-id')` rejects with `HitlSessionNotFoundError`.
  - **Unit: `listPendingSessions()` filters by status** — Insert one `awaiting_approval` and one `resumed` row; assert `listPendingSessions()` returns only the `awaiting_approval` row.
  - **Integration: end-to-end gate flow** — Simulate a LangGraph node calling `pause()`, assert the graph execution halts (checkpoint saved), then call `resume()`, and assert the graph re-enters at the correct node with full state restored.
  - **Integration: concurrent pause idempotency** — Call `pause()` twice with the same `taskId`; assert only one row is inserted (UNIQUE constraint on `task_id` where `status = 'awaiting_approval'`) and the second call returns the existing session ID.

## 2. Task Implementation
- [ ] Create `src/orchestration/HumanInTheLoopManager.ts`:
  - Export class `HumanInTheLoopManager` accepting a `db: Database` (better-sqlite3 instance) and a `checkpointer: LangGraphCheckpointer` in its constructor.
  - Implement `async pause(graphState: GraphState, taskId: string): Promise<SuspendedSession>`:
    - Serialize `graphState` to JSON via `JSON.stringify`.
    - Call `this.checkpointer.save(taskId, graphState)` to persist LangGraph checkpoint.
    - Insert a row into `hitl_sessions` (`id UUID`, `task_id TEXT UNIQUE`, `graph_state_json TEXT`, `suspended_at INTEGER` Unix epoch ms, `status TEXT DEFAULT 'awaiting_approval'`).
    - Return the inserted `SuspendedSession` object.
  - Implement `async resume(sessionId: string): Promise<GraphState>`:
    - SELECT the `hitl_sessions` row by `id`; throw `HitlSessionNotFoundError` if not found.
    - Call `this.checkpointer.load(session.task_id)` to restore the LangGraph checkpoint.
    - UPDATE `status = 'resumed'`, `resumed_at = NOW()` in `hitl_sessions`.
    - Return the deserialized `GraphState`.
  - Implement `listPendingSessions(): SuspendedSession[]`: SELECT all rows WHERE `status = 'awaiting_approval'` ORDER BY `suspended_at ASC`.
  - Export `HitlSessionNotFoundError extends Error`.
- [ ] Create the `hitl_sessions` migration in `src/db/migrations/013_create_hitl_sessions.sql`:
  ```sql
  CREATE TABLE IF NOT EXISTS hitl_sessions (
    id TEXT PRIMARY KEY,
    task_id TEXT NOT NULL,
    graph_state_json TEXT NOT NULL,
    suspended_at INTEGER NOT NULL,
    resumed_at INTEGER,
    status TEXT NOT NULL DEFAULT 'awaiting_approval',
    UNIQUE(task_id, status)
  );
  CREATE INDEX IF NOT EXISTS idx_hitl_sessions_status ON hitl_sessions(status);
  ```
- [ ] Wire `HumanInTheLoopManager` into the LangGraph orchestration loop in `src/orchestration/graph.ts`: after any node returns `{ __interrupt__: true }`, call `manager.pause()` and throw a `GraphSuspendedSignal` to halt further node execution.
- [ ] Export `HumanInTheLoopManager` from `src/orchestration/index.ts`.

## 3. Code Review
- [ ] Verify `pause()` and `resume()` are wrapped in SQLite transactions to ensure atomicity (no partial writes).
- [ ] Confirm `graph_state_json` is never logged at INFO level or above (contains potentially sensitive agent state).
- [ ] Verify `HitlSessionNotFoundError` includes the `sessionId` in its message for debuggability.
- [ ] Confirm the UNIQUE constraint on `(task_id, status)` correctly prevents duplicate pending sessions without blocking re-pausing after a resumed session.
- [ ] Check that the LangGraph checkpointer `save`/`load` calls are awaited and errors propagate correctly.

## 4. Run Automated Tests to Verify
- [ ] Run `npm test -- --testPathPattern=HumanInTheLoopManager` and confirm all tests pass with zero failures.
- [ ] Run `npm test -- --coverage --testPathPattern=HumanInTheLoopManager` and confirm line coverage ≥ 90% for `HumanInTheLoopManager.ts`.

## 5. Update Documentation
- [ ] Create `src/orchestration/HumanInTheLoopManager.agent.md` documenting: purpose, `pause()`/`resume()`/`listPendingSessions()` API contracts, the `hitl_sessions` schema, error types, and the invariant that `graph_state_json` must never appear in logs.
- [ ] Update `src/db/migrations/README.md` to list migration `013_create_hitl_sessions.sql` with a one-line description.

## 6. Automated Verification
- [ ] Run `npm test -- --testPathPattern=HumanInTheLoopManager --reporter=json > /tmp/hitl_manager_results.json` and assert `numFailedTests === 0` by running `node -e "const r=require('/tmp/hitl_manager_results.json'); process.exit(r.numFailedTests)"`.
- [ ] Run `node -e "const db=require('better-sqlite3')(':memory:'); require('./dist/db/migrate').runMigrations(db); const cols=db.prepare(\"PRAGMA table_info(hitl_sessions)\").all(); console.assert(cols.length>=6,'Schema mismatch')"` to verify the migration applies cleanly.
