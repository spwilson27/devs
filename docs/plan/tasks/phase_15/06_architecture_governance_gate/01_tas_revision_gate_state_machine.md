# Task: TAS Revision Gate State Machine Integration (Sub-Epic: 06_Architecture Governance Gate)

## Covered Requirements
- [3_MCP-UNKNOWN-301]

## 1. Initial Test Written

- [ ] In `src/orchestrator/__tests__/stateMachine.tasRevisionGate.test.ts`, write unit tests for the `TAS_REVISION_GATE` state node:
  - Test that the state machine transitions from `IMPLEMENTATION_LOOP` → `TAS_REVISION_GATE` when a `REQUEST_TAS_REVISION` event is dispatched.
  - Test that the state machine "freezes" (stays in `TAS_REVISION_GATE`) while awaiting user action — dispatching any non-resolution event MUST NOT cause a transition.
  - Test that dispatching `TAS_REVISION_APPROVED` transitions the machine back to `IMPLEMENTATION_LOOP` with the `tas_revision_id` in the context.
  - Test that dispatching `TAS_REVISION_REJECTED` transitions the machine back to `IMPLEMENTATION_LOOP` with no TAS change and a `rejection_reason` in the context.
  - Test that the `context.currentGate` is set to `"TAS_REVISION"` while in the gate state and cleared on exit.
  - Test that every state transition is persisted to SQLite as an ACID transaction (assert the `orchestrator_events` table row was written synchronously with the state change using an in-memory SQLite stub).

## 2. Task Implementation

- [ ] In `src/orchestrator/stateMachine.ts`, add a new state node `TAS_REVISION_GATE` to the XState (or equivalent) state machine definition:
  - The node type MUST be `"waiting"` (parallel-safe: other non-implementation agents may continue).
  - Define entry action `freezeImplementationAgents`: sets `context.implementationFrozen = true`, logs a `GATE_ENTERED` event to `state.sqlite` `orchestrator_events` table.
  - Define exit action `unfreezeImplementationAgents`: sets `context.implementationFrozen = false`, logs a `GATE_EXITED` event.
  - Define guard `isImplementationFrozen`: any agent attempting to write to `tasks` table while `implementationFrozen === true` MUST receive a `GATE_BLOCKED` error instead of proceeding.
  - Add event handlers:
    - `REQUEST_TAS_REVISION` (from `IMPLEMENTATION_LOOP`): payload includes `{ agent_id, task_id, blocker_description, proposed_tas_diff_id }`.
    - `TAS_REVISION_APPROVED` (from `TAS_REVISION_GATE`): payload includes `{ gate_id, reviewer_id, approved_diff_id }`.
    - `TAS_REVISION_REJECTED` (from `TAS_REVISION_GATE`): payload includes `{ gate_id, reviewer_id, rejection_reason }`.
- [ ] Update `src/orchestrator/context.ts` to add `implementationFrozen: boolean` and `currentGate: "TAS_REVISION" | null` to the `OrchestratorContext` type.
- [ ] Update `src/orchestrator/persistence.ts` to ensure all state transition events are written to `orchestrator_events` (columns: `id TEXT PK`, `event_type TEXT`, `payload JSON`, `created_at TEXT`, `git_head TEXT`) within a SQLite transaction before the state machine processes the transition.

## 3. Code Review

- [ ] Verify the `TAS_REVISION_GATE` node is a pure "waiting" state with no side effects beyond the entry/exit actions — no timers, no auto-transitions.
- [ ] Verify the `isImplementationFrozen` guard is applied at every agent write path (not just the state machine level) — check `src/agents/developer.ts`, `src/agents/reviewer.ts` for the guard call.
- [ ] Confirm all new state transitions are covered by the tests written in step 1, with no untested branches.
- [ ] Confirm ACID transaction wrapping in `persistence.ts` — every `orchestrator_events` insert must use `db.transaction(fn)`.
- [ ] Confirm TypeScript strict mode compliance — no `any` types introduced.

## 4. Run Automated Tests to Verify

- [ ] Run `npm test -- --testPathPattern="stateMachine.tasRevisionGate"` and confirm all tests pass with zero failures.
- [ ] Run `npm run type-check` and confirm no new TypeScript errors.
- [ ] Run `npm run lint` and confirm no linting violations.

## 5. Update Documentation

- [ ] Update `src/orchestrator/orchestrator.agent.md` to document the `TAS_REVISION_GATE` state: describe the entry/exit conditions, the two resolution events, and the `implementationFrozen` guard.
- [ ] Update the state machine diagram in `docs/architecture/state-machine.md` (Mermaid) to include the `TAS_REVISION_GATE` node and its transitions from/to `IMPLEMENTATION_LOOP`.
- [ ] Add an entry to `docs/architecture/hitl-gates.md` listing `TAS_REVISION_GATE` as a registered HITL gate with its trigger condition and resolution actions.

## 6. Automated Verification

- [ ] Run `node scripts/verify_state_machine_coverage.js` — this script reads the state machine definition and asserts that every defined state has at least one test file asserting its transitions. The script MUST exit 0.
- [ ] Run `node scripts/verify_sqlite_schema.js` — asserts that `orchestrator_events` table exists in the dev SQLite fixture with the required columns. MUST exit 0.
