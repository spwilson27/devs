# Task: Transactional SQLite Persistence Layer (Sub-Epic: 03_Relational State Rollback)

## Covered Requirements
- [8_RISKS-REQ-115], [9_ROADMAP-REQ-014]

## 1. Initial Test Written
- [ ] In `src/state/__tests__/persistence-layer.test.ts`, write unit tests that verify:
  - `StateRepository.writeTaskState(taskId, state)` wraps the write in a transaction; if any write within the batch throws, no partial rows are committed (assert table remains empty).
  - Concurrent writes to `agent_logs` from two simulated async callers (using `Promise.all`) do not corrupt data — each write either fully commits or fully rolls back.
  - `StateRepository.readTaskState(taskId)` returns `null` for a non-existent task and the correct typed object for an existing one.
  - Writing a state with `status = 'IN_PROGRESS'` followed by a simulated crash (throw before commit) leaves the row in its previous state, not in `IN_PROGRESS`.
  - All reads use `db.prepare(...).get()` or `.all()` — no raw SQL string concatenation (assert via a spy that `db.prepare` is always called with a parameterized query).
- [ ] Write an integration test that creates a real `state.sqlite` file in a `tmp` directory, performs 50 sequential `writeTaskState` calls inside a single outer transaction, then asserts that `readAllTasks()` returns exactly 50 rows.

## 2. Task Implementation
- [ ] Create `src/state/repositories/StateRepository.ts`:
  - Constructor accepts `db: Database` (better-sqlite3).
  - `writeTaskState(taskId: string, payload: TaskStatePayload): void` — uses `db.transaction()` to atomically upsert into `tasks` table and append to `agent_logs`.
  - `readTaskState(taskId: string): TaskStatePayload | null` — single parameterized `SELECT`.
  - `readAllTasks(): TaskStatePayload[]` — ordered by `created_at ASC`.
  - `appendAgentLog(entry: AgentLogEntry): void` — inserts one row into `agent_logs` inside a transaction.
  - `batchWrite(writes: Array<() => void>): void` — executes all provided write thunks inside a single `db.transaction()`, enabling atomic batch commits from the LangGraph checkpoint path.
- [ ] Define TypeScript interfaces `TaskStatePayload` and `AgentLogEntry` in `src/state/types.ts` with all fields typed (no `any`).
- [ ] Ensure all SQL in `StateRepository` uses `better-sqlite3`'s prepared statement API exclusively — never template literal SQL.
- [ ] Add `PRAGMA synchronous=FULL` to the DB init path (alongside WAL from Task 01) to guarantee durability on OS crash.

## 3. Code Review
- [ ] Verify `batchWrite` uses a single `db.transaction()(...)` call, not nested transactions.
- [ ] Confirm `StateRepository` is stateless beyond the injected `db` — no module-level mutable state.
- [ ] Ensure `TaskStatePayload` and `AgentLogEntry` have no optional fields that could silently produce `NULL` in the DB when the caller forgets to supply them — use required fields or explicit defaults.
- [ ] Check that the `tasks` table schema enforces `task_id TEXT NOT NULL UNIQUE` to prevent duplicate row creation.

## 4. Run Automated Tests to Verify
- [ ] Run `npx jest src/state/__tests__/persistence-layer.test.ts --coverage` and confirm all tests pass with line coverage ≥ 95%.
- [ ] Run the integration test in isolation: `npx jest --testNamePattern="integration"` and confirm 50 rows are found.

## 5. Update Documentation
- [ ] Add `StateRepository` API reference to `docs/architecture/state-management.md` under a `## Repository Layer` heading, documenting each public method's signature and transactional guarantees.
- [ ] Update `docs/agent-memory/phase_13_decisions.md`: "All SQLite writes go through `StateRepository.batchWrite` or individual transactional methods. Direct `db.run` calls outside the repository are forbidden."

## 6. Automated Verification
- [ ] Run `npx tsc --noEmit` and confirm zero TypeScript errors in `src/state/`.
- [ ] Run `npx jest --ci --forceExit --testPathPattern=persistence-layer` and assert exit code `0`.
