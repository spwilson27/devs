# Task: Implement Mandatory Approval Junction State Machine (Sub-Epic: 06_Secret and Token Management)

## Covered Requirements
- [5_SECURITY_DESIGN-REQ-SEC-SD-022]

## 1. Initial Test Written

- [ ] Create `src/orchestrator/__tests__/ApprovalJunction.test.ts`.
- [ ] Write a unit test asserting that the orchestrator state machine transitions from `PHASE_1_COMPLETE` to `AWAITING_PHASE_2_APPROVAL` and **cannot** proceed to `PHASE_2_IN_PROGRESS` unless `ApprovalJunction.approve({ phase: 2, signature: '<valid_signature>' })` is called with a valid `human_approval_signature`.
- [ ] Write a unit test asserting the same hard-block exists between `PHASE_2_COMPLETE` → `AWAITING_PHASE_3_APPROVAL` → `PHASE_3_IN_PROGRESS`, requiring a separate `human_approval_signature`.
- [ ] Write a unit test asserting that if the orchestrator attempts to call `transitionTo(PHASE_2_IN_PROGRESS)` without a prior approval, it throws an `ApprovalRequiredError` with `{ requiredPhase: 2 }`.
- [ ] Write a unit test that verifies the `human_approval_signature` is persisted to the SQLite state DB with a timestamp and the approving user's session ID.
- [ ] Write a unit test verifying that a **replayed** (duplicate) `human_approval_signature` (same nonce used twice) is rejected with an `ApprovalReplayError`.
- [ ] Write a unit test asserting that a valid approval unlocks the state machine exactly **once**: after the transition to `PHASE_2_IN_PROGRESS` occurs, a second call with the same signature is rejected.
- [ ] Write an integration test that runs the orchestrator state machine through Phase 1 → approval → Phase 2 → approval → Phase 3 end-to-end and asserts all SQLite records are written correctly.

## 2. Task Implementation

- [ ] Create `src/orchestrator/ApprovalJunction.ts` exporting class `ApprovalJunction`.
  - [ ] Define the approval phases enum: `ApprovalPhase.PHASE_2 = 2`, `ApprovalPhase.PHASE_3 = 3`.
  - [ ] Implement `async requireApproval(phase: ApprovalPhase): Promise<void>` — transitions the orchestrator state machine to `AWAITING_PHASE_${phase}_APPROVAL` and emits a `approval:required` event with the phase number.
  - [ ] Implement `async approve(payload: ApprovalPayload): Promise<void>` — validates the `human_approval_signature` (must be a non-empty string, not previously used). Persists to `approvals` table in SQLite with columns `(id, phase, signature, session_id, approved_at)`. Transitions state machine to `PHASE_${phase}_IN_PROGRESS`.
  - [ ] Implement a nonce deduplication check: before inserting, query `approvals` for `signature = ?`; if found, throw `ApprovalReplayError`.
- [ ] Create `src/orchestrator/errors/ApprovalRequiredError.ts` — typed `Error` with `requiredPhase: number`.
- [ ] Create `src/orchestrator/errors/ApprovalReplayError.ts` — typed `Error` with `signature: string` (redacted in message).
- [ ] Add the `approvals` table migration to `src/db/migrations/` (e.g., `004_add_approvals_table.sql`) with schema: `CREATE TABLE IF NOT EXISTS approvals (id TEXT PRIMARY KEY, phase INTEGER NOT NULL, signature TEXT UNIQUE NOT NULL, session_id TEXT NOT NULL, approved_at TEXT NOT NULL)`.
- [ ] Wire `ApprovalJunction.requireApproval` into the orchestrator state machine (`src/orchestrator/StateMachine.ts`) at the `PHASE_1_COMPLETE` → `PHASE_2_*` and `PHASE_2_COMPLETE` → `PHASE_3_*` transitions.
- [ ] Expose the `approve` endpoint through the MCP server tool `inject_directive` as a special directive type `{ type: 'APPROVE_PHASE', phase: 2|3, signature: string }` so the VSCode extension can trigger approvals.
- [ ] Expose `ApprovalJunction` through `src/orchestrator/index.ts`.

## 3. Code Review

- [ ] Verify that the state machine has **no** code path that bypasses `ApprovalJunction.requireApproval` between Phase 1→2 or Phase 2→3 transitions (review all `transitionTo` call sites).
- [ ] Confirm the `approvals` table uses `signature TEXT UNIQUE NOT NULL` to enforce DB-level deduplication in addition to the application-level check.
- [ ] Confirm the `ApprovalReplayError` message does **not** include the raw signature value.
- [ ] Verify the `inject_directive` MCP handler validates the session before passing the payload to `ApprovalJunction.approve` (delegation to `DirectiveAuthorizationGuard` from Task 04 is acceptable here).
- [ ] Confirm that `approval:required` events are surfaced through the VSCode Webview notification system so the user is prompted without polling.

## 4. Run Automated Tests to Verify

- [ ] Run `npm test -- --testPathPattern=ApprovalJunction` and confirm all tests pass with 0 failures.
- [ ] Run `npm run lint` and confirm no lint errors.
- [ ] Run `npm run build` and confirm no TypeScript compilation errors.

## 5. Update Documentation

- [ ] Update `docs/architecture/orchestrator.md` with a state diagram (Mermaid) showing the two approval junctions and the `AWAITING_PHASE_N_APPROVAL` states.
- [ ] Update `docs/user-guide/approval-flow.md` (create if absent) describing how a user approves phases via the VSCode extension and CLI.
- [ ] Add a `CHANGELOG.md` entry: `feat(orchestrator): Mandatory approval junctions at Phase 2 and Phase 3 with replay protection [REQ-SEC-SD-022]`.
- [ ] Update agent memory `memory/orchestrator-decisions.md` (create if absent): record that Phase 2 and Phase 3 transitions require `human_approval_signature` and that the `approvals` table deduplicates signatures.

## 6. Automated Verification

- [ ] Run `npm test -- --testPathPattern=ApprovalJunction --coverage` and assert coverage for `src/orchestrator/ApprovalJunction.ts` is ≥ 90%.
- [ ] Run `grep -r "transitionTo" src/orchestrator/StateMachine.ts` and manually verify every Phase 1→2 and Phase 2→3 transition call is gated by `requireApproval`.
- [ ] Run the integration test suite (`npm run test:integration`) and confirm the end-to-end Phase 1→2→3 approval flow passes.
