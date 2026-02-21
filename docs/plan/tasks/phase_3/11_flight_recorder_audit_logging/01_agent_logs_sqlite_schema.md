# Task: Define & Migrate `agent_logs` SQLite Schema (Sub-Epic: 11_Flight Recorder & Audit Logging)

## Covered Requirements
- [5_SECURITY_DESIGN-REQ-SEC-SD-062], [5_SECURITY_DESIGN-REQ-SEC-SD-066], [3_MCP-TAS-075]

## 1. Initial Test Written
- [ ] In `packages/core/src/db/__tests__/agent_logs_schema.test.ts`, write unit tests that:
  - Assert `agent_logs` table exists after migration with columns: `id` (TEXT PRIMARY KEY, UUID v4), `timestamp_ns` (INTEGER NOT NULL — Unix epoch nanoseconds), `thread_id` (TEXT NOT NULL), `task_id` (TEXT NOT NULL), `agent_role` (TEXT NOT NULL), `turn_index` (INTEGER NOT NULL), `git_commit_hash` (TEXT), `reasoning_chain` (BLOB NOT NULL), `saop_phase` (TEXT NOT NULL — 'THOUGHT' | 'ACTION' | 'OBSERVATION'), `created_at` (TEXT NOT NULL — ISO-8601).
  - Assert a unique index exists on `(task_id, turn_index, saop_phase)`.
  - Assert `timestamp_ns` is stored and retrieved without precision loss (use BigInt assertions).
  - Assert inserting a record with a NULL `reasoning_chain` raises a constraint violation.
  - Assert migration is idempotent (running it twice does not error and does not duplicate schema objects).
- [ ] In `packages/core/src/db/__tests__/agent_logs_timestamp.test.ts`, write a test that:
  - Calls the `nowNanoseconds()` utility and asserts the value is greater than `Date.now() * 1_000_000` (i.e., correct nanosecond scale).
  - Asserts two successive calls return strictly increasing values (monotonic clock).

## 2. Task Implementation
- [ ] Create `packages/core/src/db/migrations/003_agent_logs.sql` containing:
  ```sql
  CREATE TABLE IF NOT EXISTS agent_logs (
    id               TEXT    PRIMARY KEY,
    timestamp_ns     INTEGER NOT NULL,
    thread_id        TEXT    NOT NULL,
    task_id          TEXT    NOT NULL,
    agent_role       TEXT    NOT NULL,
    turn_index       INTEGER NOT NULL,
    git_commit_hash  TEXT,
    reasoning_chain  BLOB    NOT NULL,
    saop_phase       TEXT    NOT NULL CHECK(saop_phase IN ('THOUGHT','ACTION','OBSERVATION')),
    created_at       TEXT    NOT NULL
  );
  CREATE UNIQUE INDEX IF NOT EXISTS idx_agent_logs_turn
    ON agent_logs (task_id, turn_index, saop_phase);
  ```
- [ ] Update `packages/core/src/db/migrationRunner.ts` to include `003_agent_logs.sql` in the ordered migration list.
- [ ] Create `packages/core/src/db/agentLogsSchema.ts` that exports:
  - TypeScript interface `AgentLogRecord` exactly matching the table columns (use `bigint` for `timestamp_ns`).
  - Zod schema `AgentLogRecordSchema` for runtime validation of inserts.
- [ ] Create `packages/core/src/db/clock.ts` exporting:
  - `nowNanoseconds(): bigint` — uses `process.hrtime.bigint()` to return monotonic nanosecond timestamp anchored to wall-clock epoch: `BigInt(Date.now()) * 1_000_000n + (process.hrtime.bigint() % 1_000_000n)`.
- [ ] Add JSDoc on every exported symbol referencing `[5_SECURITY_DESIGN-REQ-SEC-SD-062]` and `[5_SECURITY_DESIGN-REQ-SEC-SD-066]`.

## 3. Code Review
- [ ] Verify `timestamp_ns` is declared `INTEGER` (SQLite maps this to a 64-bit integer, lossless for nanoseconds up to year 2262).
- [ ] Verify the unique index covers `(task_id, turn_index, saop_phase)` — not just `(task_id, turn_index)` — to allow all three SAOP phases per turn to coexist.
- [ ] Confirm `reasoning_chain` is typed as `BLOB` (not TEXT) in both SQL and the TypeScript `AgentLogRecord` interface (`Buffer | Uint8Array`).
- [ ] Confirm migration runner applies migrations in order and skips already-applied ones (check for `schema_migrations` tracking table).
- [ ] Confirm no raw `Date.now()` calls are used anywhere in the clock utility (must use `hrtime.bigint`).

## 4. Run Automated Tests to Verify
- [ ] Run `pnpm --filter @devs/core test -- --testPathPattern="agent_logs_schema|agent_logs_timestamp"` and confirm all tests pass with zero failures.
- [ ] Run `pnpm --filter @devs/core build` to confirm TypeScript compilation succeeds with no type errors.

## 5. Update Documentation
- [ ] Append an entry to `docs/architecture/database-schema.md` under a new `## agent_logs` heading describing each column, the nanosecond timestamp strategy, and the unique constraint rationale.
- [ ] Update `docs/agent-memory/short-term.md` (or equivalent) to note that `agent_logs` is the canonical table for per-turn SAOP persistence and references `[5_SECURITY_DESIGN-REQ-SEC-SD-062]`, `[5_SECURITY_DESIGN-REQ-SEC-SD-066]`, `[3_MCP-TAS-075]`.

## 6. Automated Verification
- [ ] Run `pnpm --filter @devs/core test:ci` and assert exit code is `0`.
- [ ] Run `node -e "const db = require('./packages/core/dist/db'); db.migrate(); console.log('OK');"` and assert output is `OK` with exit code `0`.
- [ ] Run `sqlite3 /tmp/devs-test.sqlite ".schema agent_logs"` (after applying the migration in a test bootstrap) and assert output contains `timestamp_ns INTEGER NOT NULL` and `reasoning_chain BLOB NOT NULL`.
