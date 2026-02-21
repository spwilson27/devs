# Task: Implement Automated Failure Report Generator (Sub-Epic: 13_Agent Autonomy & Reviewer Intelligence)

## Covered Requirements
- [3_MCP-REQ-UI-002]

## 1. Initial Test Written

- [ ] In `packages/core/src/rca/__tests__/failure-report.test.ts`, write the following tests before any implementation:
  - **Unit: Report structure** — Call `generateFailureReport({ task_id: "task-42", req_id: "3_MCP-REQ-MET-009", reasoning_chain: [...mockSAOPEnvelopes], error_log: "AssertionError: expected true got false", proposed_fix: "Clarify requirement 3_MCP-REQ-MET-009 scope" })`. Assert the returned string is valid Markdown containing all four sections: `## Failed Requirement`, `## Agent Reasoning Summary`, `## Error Log`, `## Proposed Fix`.
  - **Unit: REQ-ID presence** — Assert that the Markdown output contains the literal string `3_MCP-REQ-MET-009` in the `## Failed Requirement` section.
  - **Unit: Reasoning summary truncation** — When `reasoning_chain` contains more than 10 SAOP envelopes, assert the summary section contains the last 10 only, not all entries.
  - **Unit: Error log sanitization** — When `error_log` contains a secret matching the pattern `/ghp_[a-zA-Z0-9]+/`, assert the generated report replaces it with `[REDACTED]`.
  - **Unit: File persistence** — Call `persistFailureReport(report_markdown, { task_id: "task-42", output_dir: "/tmp/test-reports" })`. Assert a file is written to `/tmp/test-reports/task-42_failure_report.md` with the correct content.
  - **Integration: RCA turn trigger** — Mock the `agent_logs` SQLite table with a failed task entry. Call `runRCATurn({ task_id: "task-42" })` and assert it queries `agent_logs`, calls `generateFailureReport`, calls `persistFailureReport`, and inserts a `rca_results` record into SQLite.
  - **Integration: Long-term memory injection** — After `runRCATurn`, assert `LanceDB.upsert` is called with the failure report content vectorized under the key `rca:<task_id>`.

## 2. Task Implementation

- [ ] Create `packages/core/src/rca/failure-report.ts`:
  - Implement `generateFailureReport(input: FailureReportInput): string`:
    - `FailureReportInput`:
      ```typescript
      interface FailureReportInput {
        task_id: string;
        req_id: string;
        reasoning_chain: SAOP_Envelope[];
        error_log: string;
        proposed_fix: string;
      }
      ```
    - Build a Markdown string with sections:
      1. `## Failed Requirement` — outputs `- **REQ-ID**: \`${req_id}\`` and a link to the requirement doc.
      2. `## Agent Reasoning Summary` — renders the last 10 SAOP envelopes as `**Thought**: ...` and `**Action**: ...` pairs.
      3. `## Error Log` — wraps `error_log` in a fenced code block with the `bash` language tag.
      4. `## Proposed Fix` — outputs `proposed_fix` as plain Markdown text.
    - Apply `SecretMasker.mask(error_log)` before embedding the error log (reuse the existing `SecretMasker` from `packages/core/src/security/secret-masker.ts`).
  - Implement `persistFailureReport(markdown: string, opts: { task_id: string; output_dir: string }): Promise<string>`:
    - Write the file to `${output_dir}/${task_id}_failure_report.md`.
    - Return the absolute path of the written file.
- [ ] Create `packages/core/src/rca/rca-runner.ts`:
  - Implement `runRCATurn({ task_id }: { task_id: string }): Promise<RCAResult>`:
    1. Query `agent_logs` for the failed task's SAOP envelopes (last 20 rows where `task_id = ?` and `status = 'FAILED'`).
    2. Extract the top-level error from the last observation's `payload.observation.stdout` or `payload.observation.stderr`.
    3. Use **Gemini 3 Pro** (via the existing `ModelClient`) to generate a `proposed_fix` — prompt: `"Given the following SAOP trace and error log, identify the root cause and propose a one-paragraph fix or requirement clarification."`.
    4. Call `generateFailureReport(...)` and `persistFailureReport(...)`.
    5. Insert a row into `state.sqlite.rca_results`: `{ id, task_id, req_id, report_path, created_at }`.
    6. Vectorize the full report markdown and upsert into LanceDB under key `rca:<task_id>` (per `3_MCP-TAS-097` Learning Injection).
    7. Return `RCAResult: { report_path: string; proposed_fix: string; rca_id: string }`.
- [ ] Add the `rca_results` table migration in `packages/core/src/db/migrations/006_rca_results.sql`:
  ```sql
  CREATE TABLE IF NOT EXISTS rca_results (
    id TEXT PRIMARY KEY,
    task_id TEXT NOT NULL,
    req_id TEXT,
    report_path TEXT NOT NULL,
    created_at TEXT NOT NULL
  );
  ```
- [ ] Wire `runRCATurn` into the LangGraph state machine: when a task transitions to `FAILED` state (after exhausting retries), automatically invoke `runRCATurn`.

## 3. Code Review

- [ ] Verify `SecretMasker.mask` is applied to `error_log` **before** any string is written to disk or returned to the caller — no raw secrets in reports.
- [ ] Verify the Gemini 3 Pro call for `proposed_fix` uses a token budget cap (max 512 output tokens) to prevent runaway cost.
- [ ] Verify `persistFailureReport` uses `path.resolve` to prevent path traversal — the final path MUST be confirmed to be under the configured `output_dir`.
- [ ] Verify `runRCATurn` wraps all SQLite mutations in a single transaction.
- [ ] Confirm that `reasoning_chain` truncation to the last 10 envelopes is a hard limit enforced in `generateFailureReport`, not just a UI concern.

## 4. Run Automated Tests to Verify

- [ ] Run: `cd packages/core && npm test -- --testPathPattern="failure-report"` and confirm all tests pass.
- [ ] Run: `npm run lint && npx tsc --noEmit` in `packages/core` and confirm zero errors.
- [ ] Run the full suite: `npm test` from the monorepo root to confirm no regressions.

## 5. Update Documentation

- [ ] Create `packages/core/src/rca/.agent.md` documenting:
  - The `runRCATurn` function signature and expected inputs.
  - The structure of the generated Markdown failure report (section headings and content).
  - The `rca_results` SQLite schema.
  - The LanceDB key format: `rca:<task_id>`.
- [ ] Append the `rca_results` table to `docs/db-schema.md`.
- [ ] Update `.agent/index.agent.md` to register the RCA runner as a background capability accessible via `get_task_trace` tool.

## 6. Automated Verification

- [ ] Run `node scripts/verify-requirements.js --req 3_MCP-REQ-UI-002` and confirm the script reports `COVERED` by detecting `generateFailureReport` in the source and all four required Markdown sections in the template string.
- [ ] Run the integration test: `npm run test:integration -- --grep "rca-runner"` to confirm a failure report file is written to disk with correct content for a mocked failed task.
