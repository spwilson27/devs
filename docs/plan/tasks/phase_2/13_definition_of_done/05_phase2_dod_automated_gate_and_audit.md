# Task: Phase 2 DoD Automated Gate and Audit Persistence (Sub-Epic: 13_Definition of Done)

## Covered Requirements
- [9_ROADMAP-DOD-P2], [9_ROADMAP-REQ-020], [9_ROADMAP-REQ-021], [9_ROADMAP-REQ-022], [9_ROADMAP-REQ-023]

## 1. Initial Test Written
- [ ] In `packages/sandbox/src/__tests__/dod/phase2-dod-gate.dod.test.ts`, write a test suite named `"[DoD-P2] Phase Transition Gate"`.
- [ ] Write a test `"should run all four P2 DoD criteria in sequence and return an aggregate PASS"`:
  - Instantiate `Phase2DoDRunner` with mocked (stub) verifiers that all return `{ pass: true }`.
  - Call `runner.run()`.
  - Assert the returned `Phase2DoDReport` has `overallPass: true`, `criteria` array with 4 entries (`SANDBOX_ISOLATION`, `SECRETMASKER_RECALL`, `SURGICAL_PRECISION`, `MCP_HANDSHAKE`), all with `result: "PASS"`.
  - Assert `state.sqlite` contains a `dod_phase_reports` row with `phase: "P2"`, `result: "PASS"`, and all 4 criterion IDs in the `detail` JSON.
- [ ] Write a test `"should return FAIL and block phase transition if any single criterion fails"`:
  - Stub `SandboxIsolationVerifier.run()` to return `{ pass: false }`, others returning `{ pass: true }`.
  - Assert `runner.run()` returns `{ overallPass: false }`.
  - Assert the `dod_phase_reports` row has `result: "FAIL"` and `failedCriteria: ["SANDBOX_ISOLATION"]`.
- [ ] Write a test `"should mark the phase as LOCKED in state.sqlite projects table when all criteria PASS"`:
  - After a full PASS run, query `state.sqlite` `projects` table and assert the `current_phase` field has NOT advanced past `P2` without explicit user approval (gate is advisory, not auto-advance).
  - Assert a `phase_transition_events` log entry is created with `fromPhase: "P2"`, `status: "READY_FOR_APPROVAL"`.
- [ ] Write a test `"should be idempotent – re-running the gate overwrites the previous dod_phase_reports row"`:
  - Run `runner.run()` twice with the same stubs.
  - Assert `dod_phase_reports` still contains exactly one row for `phase='P2'` (upsert semantics).
- [ ] Confirm all tests start **RED**.

## 2. Task Implementation
- [ ] In `packages/sandbox/src/dod/phase2-dod-runner.ts`, implement and export `class Phase2DoDRunner`.
  - Constructor accepts: `SandboxIsolationVerifier`, `SecretMaskerBenchmarkRunner`, `SurgicalEditVerifier`, `McpHandshakeVerifier`, `DatabaseService`.
  - Method `run(): Promise<Phase2DoDReport>` that:
    1. Runs each verifier in **sequence** (not parallel — to avoid resource contention between sandbox-heavy verifiers).
    2. Collects results into `criteria: CriterionResult[]`.
    3. Computes `overallPass = criteria.every(c => c.pass)`.
    4. Upserts a row into `dod_phase_reports` table: `(phase TEXT PRIMARY KEY, result TEXT, detail JSON, verified_at DATETIME)`.
    5. If `overallPass`, inserts a `phase_transition_events` row: `(phase TEXT, status TEXT, detail JSON, created_at DATETIME)` with `status: "READY_FOR_APPROVAL"`.
    6. Returns the `Phase2DoDReport`.
- [ ] Create migration for `dod_phase_reports` table in `packages/core/src/db/migrations/` if not present.
- [ ] Create migration for `phase_transition_events` table if not present.
- [ ] Create the CLI entry point `scripts/run-dod.ts` (or `.sh` wrapper) that instantiates `Phase2DoDRunner` with production dependencies and runs it, printing a human-readable summary table to stdout.
- [ ] Create `scripts/verify-dod.sh`: a shell script accepting `<PHASE> <CRITERION>` arguments. Queries `state.sqlite` with `sqlite3` and exits `0` if `result='PASS'`, else exits `1` and prints the `detail` JSON. If `<CRITERION>` is omitted, checks the aggregate `dod_phase_reports` for the given phase.

## 3. Code Review
- [ ] Verify `Phase2DoDRunner` runs verifiers sequentially (not `Promise.all`) and documents this design decision with a comment explaining resource-contention rationale.
- [ ] Verify the `dod_phase_reports` upsert uses `INSERT OR REPLACE` (SQLite) so repeated runs are idempotent.
- [ ] Verify `phase_transition_events` is insert-only (never updated) to preserve audit history.
- [ ] Verify `scripts/verify-dod.sh` is executable (`chmod +x`) and has a shebang line.
- [ ] Verify the CLI summary output includes: phase ID, each criterion name, pass/fail, and timestamp — formatted as a markdown table for readability in CI logs.

## 4. Run Automated Tests to Verify
- [ ] Run `pnpm --filter @devs/sandbox test -- --testPathPattern=dod/phase2-dod-gate` and confirm all tests pass (GREEN).
- [ ] Run the full integration suite end-to-end: `pnpm --filter @devs/sandbox test:integration -- --testPathPattern=dod/` and confirm all 4 DoD test files pass.
- [ ] Execute `scripts/verify-dod.sh P2` and confirm exit code `0` (after integration tests have populated `state.sqlite`).
- [ ] Execute `sqlite3 .devs/state.sqlite "SELECT * FROM dod_phase_reports WHERE phase='P2';"` and confirm a PASS row is present.

## 5. Update Documentation
- [ ] Create `docs/phase_2_dod.md` (if not already created by prior tasks) with the full DoD table:
  ```
  | Phase | Criterion         | Target                         | Verifier                      | Audit Location           |
  |-------|-------------------|--------------------------------|-------------------------------|--------------------------|
  | P2    | SANDBOX_ISOLATION | 100% blocked egress            | SandboxIsolationVerifier      | state.sqlite:dod_results |
  | P2    | SECRETMASKER_RECALL | >99.9% recall, 500+ secrets  | SecretMaskerBenchmarkRunner   | state.sqlite:dod_results |
  | P2    | SURGICAL_PRECISION | 20+ edits, 0 syntax errors   | SurgicalEditVerifier          | state.sqlite:dod_results |
  | P2    | MCP_HANDSHAKE     | 100% handshake success         | McpHandshakeVerifier          | state.sqlite:dod_results |
  ```
- [ ] In `packages/sandbox/.agent.md`, add a top-level `## Phase 2 DoD Gate` section linking to `Phase2DoDRunner` and describing how to invoke the gate (`pnpm dod:run` or `scripts/run-dod.ts`).
- [ ] Update `README.md` (project root) with a brief note in the "Development" section: "Run `scripts/verify-dod.sh P2` to confirm Phase 2 completion criteria before starting Phase 3."

## 6. Automated Verification
- [ ] `scripts/verify-dod.sh P2` (no criterion argument) must exit `0` only when ALL four P2 criteria have `result='PASS'` in `state.sqlite`, and exit `1` with a human-readable failure summary otherwise.
- [ ] Add a CI job `phase2-dod-gate` in `.github/workflows/` (or the existing CI config) that:
  1. Runs `pnpm --filter @devs/sandbox test:integration -- --testPathPattern=dod/`.
  2. Runs `scripts/verify-dod.sh P2`.
  3. Fails the workflow if either step exits non-zero.
- [ ] Confirm this CI job is a required check on any PR targeting `main` during Phase 2 development.
