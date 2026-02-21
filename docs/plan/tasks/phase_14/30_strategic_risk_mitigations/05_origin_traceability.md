# Task: Implement Origin Traceability — Requirement-to-Code Mapping (Sub-Epic: 30_Strategic Risk Mitigations)

## Covered Requirements
- [8_RISKS-REQ-134]

## 1. Initial Test Written
- [ ] In `src/traceability/__tests__/origin_trace.test.ts`, write unit tests covering:
  - `recordOriginTrace(entry: OriginTraceEntry, db): Promise<void>` — assert a row is inserted into `origin_traces` with fields: `id`, `user_prompt_hash`, `requirement_id`, `epic_id`, `task_id`, `commit_hash`, `created_at`.
  - `getTraceChain(commitHash: string, db): Promise<OriginTraceChain>` — assert the returned object contains the full chain: `userPromptSnippet → requirementId → epicId → taskId → commitHash`.
  - `exportTraceabilityReport(projectRoot: string, db): Promise<string>` — assert the returned Markdown string contains a table with columns `Requirement | Epic | Task | Commit` and at least one row per inserted `origin_traces` record.
  - Write an integration test: insert 3 origin trace records (one full chain), call `exportTraceabilityReport`, and assert the report contains all 3 requirement IDs and their corresponding commit hashes.
  - Write an E2E test: simulate a full mini-pipeline (prompt → requirement → task → commit), call `getTraceChain` with the resulting commit hash, and assert every link in the chain is populated.

## 2. Task Implementation
- [ ] Create SQLite migration `migrations/016_origin_traces.sql`:
  ```sql
  CREATE TABLE IF NOT EXISTS origin_traces (
    id                TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    user_prompt_hash  TEXT NOT NULL,
    requirement_id    TEXT NOT NULL REFERENCES requirements(id),
    epic_id           TEXT NOT NULL REFERENCES epics(id),
    task_id           TEXT NOT NULL REFERENCES tasks(id),
    commit_hash       TEXT,
    created_at        TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
  );
  CREATE INDEX IF NOT EXISTS idx_origin_req ON origin_traces(requirement_id);
  CREATE INDEX IF NOT EXISTS idx_origin_commit ON origin_traces(commit_hash);
  ```
- [ ] Create `src/traceability/origin_trace.ts` exporting:
  - `OriginTraceEntry` interface and `OriginTraceChain` type.
  - `recordOriginTrace(entry, db)` — inserts record; `user_prompt_hash` is SHA-256 of the original user prompt text (stored hash only, not the raw prompt text, for data minimisation per `[5_SECURITY_DESIGN-REQ-SEC-SD-086]`).
  - `getTraceChain(commitHash, db)` — JOINs `origin_traces`, `requirements`, `epics`, `tasks` to build the full chain.
  - `exportTraceabilityReport(projectRoot, db)` — renders a GFM table of all traces; writes to `<projectRoot>/docs/traceability_report.md` and also returns the content as a string.
- [ ] Hook `recordOriginTrace` into the pipeline at three points in `src/orchestrator/task_runner.ts`:
  1. After a requirement is distilled: record `{ user_prompt_hash, requirement_id }`.
  2. After an epic is generated from the requirement: fill in `epic_id`.
  3. After a task commit: fill in `task_id` and `commit_hash` (UPDATE the existing row).
- [ ] Add a `devs trace --report` CLI subcommand in `src/cli/commands/trace.ts` (extending the existing `trace` command) that calls `exportTraceabilityReport` and prints the path to the generated report.

## 3. Code Review
- [ ] Confirm `user_prompt_hash` stores only the SHA-256 digest, never the raw prompt text, to comply with `[5_SECURITY_DESIGN-REQ-SEC-SD-086]` data minimisation.
- [ ] Verify the UPDATE logic for filling in `task_id`/`commit_hash` is atomic (wrapped in a SQLite transaction) to prevent partial trace records.
- [ ] Ensure `exportTraceabilityReport` is idempotent — running it twice does not create duplicate report entries.
- [ ] Confirm that the migration's foreign key constraints are respected (SQLite foreign key PRAGMA must be enabled in the DB initialisation code).

## 4. Run Automated Tests to Verify
- [ ] Run `npm test -- --testPathPattern="origin_trace"` and confirm all tests pass.
- [ ] Run `npm test -- --testPathPattern="trace"` to confirm CLI tests pass.
- [ ] Run full suite `npm test`.

## 5. Update Documentation
- [ ] Add `docs/traceability.md` explaining:
  - The `origin_traces` table schema and its role in IP/copyright audit trails.
  - How to generate a traceability report: `devs trace --report`.
  - What each column in the report means.
- [ ] Update `src/traceability/traceability.agent.md` with the `origin_trace.ts` API.
- [ ] Add to `CHANGELOG.md` under `[Phase 14]`: "Implemented origin traceability (prompt → requirement → code) for IP audit compliance".

## 6. Automated Verification
- [ ] Run `npm run validate-all` and confirm exit code `0`.
- [ ] Execute `node scripts/verify_requirement_coverage.js --req 8_RISKS-REQ-134` and confirm `covered`.
- [ ] Run `devs trace --report` against the `devs` project and confirm `docs/traceability_report.md` is generated with at least one populated row per existing task.
