# Task: Implement PhaseGate Data Model & State Machine (Sub-Epic: 13_HITL Gate & Phase Transition)

## Covered Requirements
- [1_PRD-REQ-UI-001], [1_PRD-REQ-HITL-001], [9_ROADMAP-REQ-001], [9_ROADMAP-DOD-P3]

## 1. Initial Test Written
- [ ] In `packages/core/src/phase-gate/__tests__/phase-gate.model.test.ts`, write unit tests that assert:
  - `PhaseGateState` enum has values: `PENDING`, `AWAITING_USER_APPROVAL`, `APPROVED`, `REJECTED`, `DEEP_SEARCH_TRIGGERED`.
  - `PhaseGateRecord` interface contains fields: `id` (UUID), `phaseId` (string), `state` (PhaseGateState), `reportIds` (string[]), `confidenceScores` (Record<string, number>), `createdAt` (Date), `updatedAt` (Date), `approvedBy` (string | null), `approvedAt` (Date | null), `rejectionReason` (string | null).
  - `PhaseGateTransition` type is a discriminated union covering all valid state transitions (PENDING→AWAITING_USER_APPROVAL, AWAITING_USER_APPROVAL→APPROVED, AWAITING_USER_APPROVAL→REJECTED, AWAITING_USER_APPROVAL→DEEP_SEARCH_TRIGGERED, DEEP_SEARCH_TRIGGERED→AWAITING_USER_APPROVAL).
  - Invalid transitions (e.g., APPROVED→PENDING) throw a `InvalidPhaseGateTransitionError`.
- [ ] In `packages/core/src/phase-gate/__tests__/phase-gate.state-machine.test.ts`, write unit tests that assert:
  - `PhaseGateStateMachine.transition(gate, event)` correctly advances state for all valid transitions.
  - `PhaseGateStateMachine.transition(gate, event)` throws `InvalidPhaseGateTransitionError` for illegal transitions.
  - `PhaseGateStateMachine.canApprove(gate)` returns `true` only when state is `AWAITING_USER_APPROVAL`.
  - `PhaseGateStateMachine.canReject(gate)` returns `true` only when state is `AWAITING_USER_APPROVAL`.
- [ ] In `packages/core/src/phase-gate/__tests__/phase-gate.repository.test.ts`, write integration tests (using an in-memory store) that assert:
  - `PhaseGateRepository.create(record)` persists a new gate record.
  - `PhaseGateRepository.findByPhaseId(phaseId)` retrieves the correct record.
  - `PhaseGateRepository.update(id, partial)` applies a partial update and updates `updatedAt`.
  - `PhaseGateRepository.findAll()` returns all records ordered by `createdAt` desc.

## 2. Task Implementation
- [ ] Create `packages/core/src/phase-gate/phase-gate.model.ts`:
  - Define and export `PhaseGateState` enum with all five values.
  - Define and export `PhaseGateRecord` interface with all required fields.
  - Define and export `PhaseGateTransition` discriminated union type.
  - Define and export `InvalidPhaseGateTransitionError` extending `Error`.
- [ ] Create `packages/core/src/phase-gate/phase-gate.state-machine.ts`:
  - Implement `PhaseGateStateMachine` class with a static `ALLOWED_TRANSITIONS` map (from state → set of reachable states).
  - Implement `transition(gate: PhaseGateRecord, event: PhaseGateTransition): PhaseGateRecord` which validates the transition, mutates a copy of the gate, and returns it.
  - Implement `canApprove(gate: PhaseGateRecord): boolean` and `canReject(gate: PhaseGateRecord): boolean` helper methods.
- [ ] Create `packages/core/src/phase-gate/phase-gate.repository.ts`:
  - Define `IPhaseGateRepository` interface with `create`, `findByPhaseId`, `findById`, `update`, and `findAll` methods.
  - Implement `InMemoryPhaseGateRepository` satisfying `IPhaseGateRepository` (used in tests and dev mode).
  - Export both the interface and the in-memory implementation.
- [ ] Create `packages/core/src/phase-gate/index.ts` that re-exports all public symbols.

## 3. Code Review
- [ ] Verify `PhaseGateState` is a `const enum` or string enum (not numeric) to avoid serialization issues in JSON persistence.
- [ ] Verify `PhaseGateRecord` is an immutable interface (readonly fields) and `transition()` returns a new object rather than mutating in place.
- [ ] Verify `InvalidPhaseGateTransitionError` carries `fromState` and `toState` properties for structured logging.
- [ ] Verify no domain logic leaks into the repository layer (repository is purely CRUD).
- [ ] Verify all exports are correctly typed and no `any` types are used.

## 4. Run Automated Tests to Verify
- [ ] Run `pnpm --filter @devs/core test -- --testPathPattern="phase-gate"` and confirm all tests pass with 100% statement and branch coverage on the three new files.

## 5. Update Documentation
- [ ] Create `packages/core/src/phase-gate/phase-gate.agent.md` documenting:
  - **Intent**: Defines the canonical data shape and state machine for HITL phase gates.
  - **Architecture**: State enum, record interface, state machine class, repository interface/impl.
  - **Agentic Hooks**: Which events trigger state transitions, how agents query gate state.
  - **Valid state transition diagram** (Mermaid stateDiagram-v2).

## 6. Automated Verification
- [ ] Run `pnpm --filter @devs/core test:coverage -- --testPathPattern="phase-gate"` and assert exit code 0.
- [ ] Run `pnpm --filter @devs/core build` and assert exit code 0 (TypeScript compilation must succeed with no errors).
