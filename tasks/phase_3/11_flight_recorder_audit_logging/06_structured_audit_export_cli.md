# Task: Implement Structured Audit Export CLI (`--json` / `--markdown`) (Sub-Epic: 11_Flight Recorder & Audit Logging)

## Covered Requirements
- [4_USER_FEATURES-REQ-003], [9_ROADMAP-REQ-SYS-004]

## 1. Initial Test Written
- [ ] In `packages/cli/src/__tests__/auditExport.test.ts`, write unit tests that:
  - Assert that `devs logs --json` outputs valid JSON to stdout where each element conforms to `AgentLogRecord` schema (use `AgentLogRecordSchema.parse()` on each element — no extra fields, no missing required fields).
  - Assert that `devs logs --markdown` outputs a GitHub-Flavored Markdown table with columns: `id`, `timestamp_ns`, `task_id`, `agent_role`, `turn_index`, `saop_phase`, `git_commit_hash` — each row corresponding to one `agent_logs` record.
  - Assert that `devs status --json` outputs valid JSON with at least the fields: `taskId`, `status`, `gitCommitHash`, `traceCount` (number of rows in `agent_logs` for that task).
  - Assert that `devs status --markdown` outputs a Markdown summary block with the same fields.
  - Assert that when both `--json` and `--markdown` are passed simultaneously, the CLI exits with code `1` and prints `Error: --json and --markdown are mutually exclusive` to stderr.
  - Assert that when neither flag is passed, the CLI outputs a human-readable plain-text format (not JSON, not Markdown).
  - Assert that the `--json` output is valid JSON even when `reasoning_chain` blobs contain binary data (blobs must be base64-encoded in the JSON output).
- [ ] In `packages/cli/src/__tests__/auditExport.integration.test.ts`, write an integration test that:
  - Seeds an in-memory SQLite database with 3 `agent_logs` rows via `persistSaopTurn()`.
  - Spawns `devs logs --json` as a child process and pipes the SQLite DB path via env var `DEVS_STATE_DB`.
  - Parses the stdout as JSON and asserts it is an array of length 3 with correct `task_id` values.

## 2. Task Implementation
- [ ] Create `packages/cli/src/commands/logs.ts` implementing the `devs logs` command:
  - Accept `--json` flag: serialize `agent_logs` rows to JSON array; base64-encode `reasoning_chain` blobs.
  - Accept `--markdown` flag: render a GFM table from `agent_logs` rows.
  - Default (no flag): render a human-readable columnar text table using a library already present in the project (e.g., `cli-table3`).
  - Use `queryReasoningTrace()` from `@devs/core/flight-recorder/gitDbCorrelation` for data fetching.
- [ ] Create `packages/cli/src/commands/status.ts` (or update if it exists) to add `--json` and `--markdown` flag support:
  - `--json`: output `{ taskId, status, gitCommitHash, traceCount }` per task as a JSON array.
  - `--markdown`: output a GFM table with the same fields.
- [ ] Implement `packages/cli/src/utils/formatters.ts` exporting:
  - `toJson(records: AgentLogRecord[]): string`: JSON serializer with base64 blob encoding.
  - `toMarkdownTable(records: AgentLogRecord[]): string`: GFM table renderer.
  - `toPlainText(records: AgentLogRecord[]): string`: columnar plain-text renderer.
- [ ] Register `logs` command in the CLI entry point (`packages/cli/src/index.ts`).
- [ ] Add JSDoc on all exports referencing `[4_USER_FEATURES-REQ-003]` and `[9_ROADMAP-REQ-SYS-004]`.

## 3. Code Review
- [ ] Confirm `--json` and `--markdown` are mutually exclusive — enforced by the CLI argument parser (e.g., yargs `.conflicts()` or equivalent), not just by runtime logic.
- [ ] Confirm `reasoning_chain` blobs are base64-encoded in `--json` output (not raw binary or `[object Buffer]`).
- [ ] Confirm the Markdown output uses pipe-delimited GFM tables (not HTML tables or custom formats).
- [ ] Confirm the `logs` command reads from the database path specified by `DEVS_STATE_DB` env var (or `--db` CLI flag), not a hardcoded path.
- [ ] Confirm output goes to `stdout` for data and `stderr` for errors (do not mix).

## 4. Run Automated Tests to Verify
- [ ] Run `pnpm --filter @devs/cli test -- --testPathPattern="auditExport"` and confirm all unit and integration tests pass.
- [ ] Run `pnpm --filter @devs/cli build` and confirm TypeScript compilation succeeds.
- [ ] Run `node packages/cli/dist/index.js logs --json` against a test database and pipe through `jq '.[0].task_id'` — assert a non-empty string is returned.

## 5. Update Documentation
- [ ] Update `docs/cli/commands.md` (create if absent) with entries for `devs logs` and `devs status`, documenting `--json` and `--markdown` flags, output format, and the `DEVS_STATE_DB` env var.
- [ ] Update `docs/architecture/flight-recorder.md` with a section **Audit Export**: "The `devs logs` command exposes the full `agent_logs` table to external CI/CD pipelines via `--json` and `--markdown` flags, enabling automated auditing without direct SQLite access."
- [ ] Update agent memory in `docs/agent-memory/long-term.md` to note that all log/status commands support structured export, per `[4_USER_FEATURES-REQ-003]`.

## 6. Automated Verification
- [ ] Run `pnpm --filter @devs/cli test:ci` and assert exit code is `0`.
- [ ] Run the integration test and assert the spawned child process exits with code `0` and stdout parses as a valid JSON array.
- [ ] Run `node packages/cli/dist/index.js logs --json --markdown 2>&1` and assert exit code is `1` and stderr contains `mutually exclusive`.
