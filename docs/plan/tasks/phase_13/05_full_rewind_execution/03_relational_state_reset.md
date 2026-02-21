# Task: Implement Relational State Reset (SQLite Rollback to Task Checkpoint) (Sub-Epic: 05_Full Rewind Execution)

## Covered Requirements
- [3_MCP-TAS-095], [4_USER_FEATURES-REQ-074], [9_ROADMAP-REQ-038]

## 1. Initial Test Written
- [ ] In `src/rewind/__tests__/relational.state.resetter.test.ts`, write unit tests for `RelationalStateResetter`:
  - Use an in-memory SQLite database (`better-sqlite3` or `@databases/sqlite` with `:memory:`) seeded with the schema matching production (tables: `projects`, `documents`, `requirements`, `epics`, `tasks`, `agent_logs`, `entropy_events`).
  - Seed 5 tasks in ascending `completed_at` order. Tasks 4 and 5 are created after task 3.
  - Test that `reset('task_3')` deletes all records from `tasks`, `agent_logs`, and `entropy_events` where `completed_at > task_3.completed_at`, leaving tasks 1–3 intact.
  - Test that `reset('task_3')` does NOT delete records from `projects`, `documents`, `requirements`, or `epics` (these are immutable during a session).
  - Test that `reset('task_1')` — the earliest task — deletes tasks 2–5 and all related `agent_logs`/`entropy_events` after task 1.
  - Test that `reset('task_99')` throws `RewindTaskNotFoundError` if the task does not exist.
  - Test that the entire operation is executed within a single ACID SQLite transaction: if any DELETE fails mid-way, all changes are rolled back (simulate a failure by mocking the second DELETE to throw and asserting the DB state is unchanged).
- [ ] Write a test asserting that after `reset(taskId)`, querying `SELECT COUNT(*) FROM tasks WHERE completed_at > :target` returns 0.

## 2. Task Implementation
- [ ] Create `src/rewind/relational.state.resetter.ts` implementing the `RelationalStateResetter` interface from `src/rewind/interfaces.ts`:
  - Export class `SqliteRelationalStateResetter implements RelationalStateResetter`.
  - Constructor accepts `{ db: Database }` (using the project's existing `Database` type from `better-sqlite3` or equivalent).
  - Implement `async reset(taskId: string): Promise<void>`:
    1. Query the `tasks` table for the record with `id = taskId`. If not found, throw `RewindTaskNotFoundError`.
    2. Extract `completed_at` (ISO 8601 timestamp or Unix epoch integer) from the record.
    3. Begin a SQLite transaction.
    4. Execute `DELETE FROM entropy_events WHERE created_at > :target_timestamp`.
    5. Execute `DELETE FROM agent_logs WHERE created_at > :target_timestamp`.
    6. Execute `DELETE FROM tasks WHERE completed_at > :target_timestamp`.
    7. Commit the transaction.
    8. On any error during the transaction, rollback and re-throw.
- [ ] Ensure that the DELETE ordering respects any foreign key constraints (delete child tables before parent tables). Enable `PRAGMA foreign_keys = ON` in the database connection setup if not already enabled.
- [ ] After the transaction commits, run a verification query: `SELECT COUNT(*) FROM tasks WHERE completed_at > :target_timestamp` and assert it returns 0; if non-zero, throw `RelationalResetVerificationError`.
- [ ] Add `RelationalResetVerificationError extends Error` to `src/rewind/errors.ts`.

## 3. Code Review
- [ ] Verify all DELETEs are wrapped in a single explicit transaction (not autocommit) so partial failures are atomic.
- [ ] Confirm that `PRAGMA foreign_keys = ON` is set on the connection to catch integrity violations.
- [ ] Verify that `target_timestamp` is bound as a parameterized value (not interpolated into SQL string) to prevent SQL injection.
- [ ] Confirm the post-reset verification query is run OUTSIDE the transaction (after commit) so it reads the committed state.
- [ ] Check that the tables `projects`, `documents`, `requirements`, and `epics` are NOT touched by any DELETE statements — verify this by reading the implementation code and cross-referencing with unit tests.
- [ ] Verify the class is registered as the concrete `RelationalStateResetter` in `src/rewind/composition-root.ts`.

## 4. Run Automated Tests to Verify
- [ ] Run `npm test -- --testPathPattern="relational.state.resetter"` and confirm all tests pass.
- [ ] Specifically verify the ACID transaction rollback test passes: the in-memory DB state is unchanged after a simulated mid-transaction failure.
- [ ] Run `npm run lint` and `npm run build` with zero errors.

## 5. Update Documentation
- [ ] Update `src/rewind/REWIND.agent.md` with a section on `SqliteRelationalStateResetter`:
  - List the exact tables affected and the DELETE order.
  - Explain the ACID transaction guarantee and what happens on rollback.
  - Document `RelationalResetVerificationError` and when it is thrown.
- [ ] Update `docs/architecture/rewind.md` with a subsection on "Relational State Reset":
  - Explain what `completed_at` represents and how it is used as the rollback boundary.
  - Note that immutable tables (`projects`, `documents`, `requirements`, `epics`) are never modified during rewind.

## 6. Automated Verification
- [ ] Run the ACID transaction rollback test in CI with `--runInBand` to prevent parallel DB state interference: `npm test -- --testPathPattern="relational.state.resetter" --runInBand`.
- [ ] After the full integration test suite runs, run: `sqlite3 <test_db_path> "SELECT COUNT(*) FROM tasks WHERE completed_at > '<target_timestamp>';"` and assert the output is `0`.
- [ ] Run `npm test -- --coverage --testPathPattern="relational.state.resetter"` and assert line coverage ≥ 95% for `relational.state.resetter.ts`.
