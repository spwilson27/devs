# Task: TAS Revision Gate End-to-End Integration Tests and Audit Trail (Sub-Epic: 06_Architecture Governance Gate)

## Covered Requirements
- [3_MCP-UNKNOWN-301]

## 1. Initial Test Written

- [ ] In `src/__tests__/e2e/tasRevisionGate.e2e.test.ts`, write a full end-to-end integration test covering the complete TAS revision gate lifecycle:
  - **Setup**: Start the orchestrator with an in-memory SQLite database and a mock SSE event bus. Seed a project with a known TAS document.
  - **Step 1 — Agent triggers gate**: Simulate the `developer` agent calling `request_tas_revision` with a valid payload. Assert:
    - `tas_revision_requests` has one `PENDING_APPROVAL` row.
    - `tas_revision_diffs` has one row linked to the gate.
    - The state machine is in `TAS_REVISION_GATE` state.
    - `context.implementationFrozen === true`.
    - The SSE bus emitted one `HITL_GATE_REQUIRED` event.
  - **Step 2 — Write tool blocked**: While in the gate, simulate the `developer` agent calling `write_task_result`. Assert it receives `{ code: "GATE_BLOCKED" }` and the `tasks` table is unchanged.
  - **Step 3a — Approve path**: Call `manage_hitl_gate { action: "approve", gate_id }`. Assert:
    - `tas_revision_requests.status === "APPROVED"`.
    - `TAS.md` on disk reflects the approved changes.
    - State machine transitions back to `IMPLEMENTATION_LOOP`.
    - `context.implementationFrozen === false`.
    - `write_task_result` now succeeds for the previously blocked agent.
    - The SSE bus emitted one `GATE_RESOLVED` event.
  - **Step 3b — Reject path** (separate test): Call `manage_hitl_gate { action: "reject", gate_id, feedback: "..." }`. Assert:
    - `tas_revision_requests.status === "REJECTED"`.
    - `TAS.md` is unchanged.
    - State machine transitions back to `IMPLEMENTATION_LOOP`.
    - `context.implementationFrozen === false`.
    - `write_task_result` now succeeds.
    - The SSE bus emitted `GATE_RESOLVED` with `resolution: "REJECTED"` and the feedback string.
  - **Audit trail**: After both paths, assert that `orchestrator_events` table contains: `GATE_ENTERED`, `GATE_EXITED`, and `HITL_GATE_REQUIRED` event rows with correct payloads and non-null `git_head` values.
- [ ] In `src/__tests__/e2e/tasRevisionGate.concurrent.e2e.test.ts`, write a concurrency test:
  - Simulate two different agents calling `request_tas_revision` concurrently. Assert only the first request succeeds and the second receives `{ code: "GATE_ALREADY_ACTIVE" }`.

## 2. Task Implementation

- [ ] Ensure all services used in the E2E tests are wired together in a testable `OrchestratorComposer` class (`src/orchestrator/OrchestratorComposer.ts`) that accepts dependency injection for:
  - `db: Database` (SQLite instance)
  - `eventBus: EventEmitter` (SSE bus)
  - `stateMachine: OrchestratorStateMachineService`
  - `tasFilePath: string` (path to `TAS.md`)
  - This allows E2E tests to substitute in-memory databases and mock file paths without changing production code.
- [ ] Ensure all E2E test helpers are in `src/__tests__/helpers/tasRevisionGate.helpers.ts`:
  - `seedTasDocument(db, tasMarkdown)` — inserts the TAS markdown into the project context.
  - `captureSSEEvents(eventBus, eventType)` — returns an array of captured events for assertion.
  - `buildRevisionPayload(overrides?)` — constructs a valid `request_tas_revision` payload with sensible defaults.
- [ ] Verify the `OrchestratorComposer` is used by the production entry points (`src/cli/index.ts`, `src/mcp/orchestratorServer/index.ts`) to instantiate the orchestrator — confirm no hardcoded `new Database(...)` calls outside of `OrchestratorComposer`.

## 3. Code Review

- [ ] Verify the E2E tests do not use real filesystem I/O outside of a temporary directory (use `os.tmpdir()` + unique subdirectory per test run, cleaned up in `afterEach`).
- [ ] Verify the concurrency test uses `Promise.all` to fire both `request_tas_revision` calls simultaneously (not sequentially) — confirm the test would fail if the `GATE_ALREADY_ACTIVE` guard were removed.
- [ ] Verify the `orchestrator_events` audit trail assertions check the `git_head` column is non-null and matches the expected Git hash from the fixture (not an empty string).
- [ ] Verify the `OrchestratorComposer` pattern does not introduce any circular dependencies — run `node scripts/check_circular_deps.js` and confirm 0 circular dependencies.
- [ ] Confirm E2E test file paths follow the `src/__tests__/e2e/` convention and are excluded from the unit test run but included in the integration test run (check `jest.config.ts` `testMatch` patterns).

## 4. Run Automated Tests to Verify

- [ ] Run `npm run test:e2e -- --testPathPattern="tasRevisionGate"` and confirm all E2E tests (lifecycle + concurrency) pass with zero failures.
- [ ] Run `npm run test:unit` and confirm no regressions in existing unit tests.
- [ ] Run `npm run type-check` and confirm no new TypeScript errors.
- [ ] Run `npm run lint` and confirm no violations.

## 5. Update Documentation

- [ ] Update `docs/testing/e2e-test-guide.md` with a section on the TAS Revision Gate E2E tests: how to run them, what services they require (none — fully self-contained), and what the expected output looks like.
- [ ] Update `src/orchestrator/orchestrator.agent.md` with a "TAS Revision Gate — Full Lifecycle" section summarizing all components involved (state machine, MCP tools, diff generator, applicator, CLI, VSCode panel) and their interaction sequence.
- [ ] Add the `OrchestratorComposer` to `docs/architecture/dependency-injection.md` as the canonical DI entry point for the orchestrator.

## 6. Automated Verification

- [ ] Run `node scripts/verify_e2e_coverage.js` — asserts that the E2E test suite covers all three `tas_revision_requests` status values (`PENDING_APPROVAL`, `APPROVED`, `REJECTED`) by scanning the E2E test files for assertions against these values. MUST exit 0.
- [ ] Run `node scripts/verify_no_hardcoded_db.js` — scans `src/` for `new Database(` calls and asserts they only appear in `OrchestratorComposer.ts` and test setup files. MUST exit 0.
- [ ] Run `node scripts/check_circular_deps.js` — asserts 0 circular dependency chains involving any of the new modules (`tasRevisionGate`, `tasDiff`, `tasApplicator`, `tasParser`, `OrchestratorComposer`). MUST exit 0.
