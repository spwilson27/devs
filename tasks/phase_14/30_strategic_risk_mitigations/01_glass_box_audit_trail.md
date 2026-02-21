# Task: Implement Glass-Box Audit Trail — Commit-to-Reasoning Trace Linkage (Sub-Epic: 30_Strategic Risk Mitigations)

## Covered Requirements
- [8_RISKS-REQ-133]

## 1. Initial Test Written
- [ ] In `src/audit/__tests__/glass_box_audit.test.ts`, write unit tests covering:
  - `linkCommitToTrace(commitHash: string, saopEnvelopeId: string): Promise<void>` — verify that a row is inserted into the `commit_traces` SQLite table with correct `commit_hash`, `saop_envelope_id`, and `linked_at` timestamp.
  - `queryTraceByCommit(commitHash: string): Promise<SaopEnvelope | null>` — verify retrieval of the full SAOP envelope JSON given a commit hash; assert `null` is returned for unknown hashes.
  - `listCommitTraces(taskId: string): Promise<CommitTrace[]>` — verify that all commits linked to a given `task_id` are returned in chronological order.
  - Write an integration test that runs against an in-memory SQLite instance (using `better-sqlite3` with `:memory:`), inserts a fake `SAOP_Envelope` record and a matching commit hash, then asserts `queryTraceByCommit` returns the correct envelope.
  - Write an E2E test that calls `git log --oneline -1` inside a temp git repo, links the resulting hash via `linkCommitToTrace`, and then asserts `queryTraceByCommit` returns the envelope with the correct data.

## 2. Task Implementation
- [ ] Create SQLite migration `migrations/014_commit_traces.sql`:
  ```sql
  CREATE TABLE IF NOT EXISTS commit_traces (
    id          TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    commit_hash TEXT NOT NULL UNIQUE,
    task_id     TEXT NOT NULL REFERENCES tasks(id),
    saop_envelope_id TEXT NOT NULL REFERENCES saop_envelopes(id),
    linked_at   TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
  );
  CREATE INDEX IF NOT EXISTS idx_commit_traces_task ON commit_traces(task_id);
  ```
- [ ] Create `src/audit/glass_box_audit.ts` exporting:
  - `linkCommitToTrace(commitHash, taskId, saopEnvelopeId, db)` — inserts a row into `commit_traces`; throws `AuditLinkError` if `commit_hash` is not a valid 40-char hex SHA.
  - `queryTraceByCommit(commitHash, db)` — JOINs `commit_traces` with `saop_envelopes` and returns the full envelope parsed from JSON; returns `null` if not found.
  - `listCommitTraces(taskId, db)` — returns all `CommitTrace` rows for a given task, ordered by `linked_at` ASC.
- [ ] Hook `linkCommitToTrace` into the existing post-commit callback in `src/orchestrator/task_runner.ts`: after `git commit` succeeds, call `linkCommitToTrace` with the new HEAD SHA, the active task ID, and the most recent SAOP envelope ID for that task.
- [ ] Expose a `devs trace --commit <sha>` CLI subcommand in `src/cli/commands/trace.ts` that calls `queryTraceByCommit` and pretty-prints the SAOP envelope reasoning steps to stdout.
- [ ] Ensure the `saop_envelopes` table (created in an earlier phase) stores the full envelope as a JSON `text` column; add a migration guard if the column is missing.

## 3. Code Review
- [ ] Verify that `glass_box_audit.ts` has zero side-effects beyond SQLite writes — no file I/O, no network calls.
- [ ] Confirm that the SHA validation regex (`/^[0-9a-f]{40}$/i`) is unit-tested and enforced before any DB insert to prevent SQL injection via malformed commit hashes.
- [ ] Ensure the migration script is idempotent (`CREATE TABLE IF NOT EXISTS`, `CREATE INDEX IF NOT EXISTS`).
- [ ] Confirm TypeScript strict mode passes (`tsc --noEmit`): all return types explicitly annotated, no `any` usage in public API surface.
- [ ] Verify the CLI `devs trace --commit` command is wired into the root command registry and documented in `docs/cli.md`.

## 4. Run Automated Tests to Verify
- [ ] Run `npm test -- --testPathPattern="glass_box_audit"` and confirm all unit and integration tests pass with 0 failures.
- [ ] Run `npm test -- --testPathPattern="trace"` to verify CLI subcommand tests pass.
- [ ] Run the full test suite `npm test` and confirm no regressions.

## 5. Update Documentation
- [ ] Add a `## Glass-Box Audit Trail` section to `docs/architecture/audit.md` describing:
  - The `commit_traces` schema and its relationship to `saop_envelopes`.
  - How to use `devs trace --commit <sha>` to inspect reasoning.
- [ ] Update `src/audit/audit.agent.md` with the new `linkCommitToTrace` / `queryTraceByCommit` API contracts.
- [ ] Add an entry to `CHANGELOG.md` under `[Phase 14]` describing the Glass-Box Audit Trail feature.

## 6. Automated Verification
- [ ] Run `npm run validate-all` and confirm the exit code is `0`.
- [ ] Execute `node scripts/verify_requirement_coverage.js --req 8_RISKS-REQ-133` and confirm the requirement is reported as `covered`.
- [ ] Run the migration against a fresh SQLite DB: `sqlite3 /tmp/test.db < migrations/014_commit_traces.sql` — confirm no errors and the table is present via `.schema commit_traces`.
