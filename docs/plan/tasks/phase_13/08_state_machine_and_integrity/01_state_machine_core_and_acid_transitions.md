# Task: Implement Core State Machine with ACID Transition Guards (Sub-Epic: 08_State Machine and Integrity)

## Covered Requirements
- [8_RISKS-REQ-001]

## 1. Initial Test Written
- [ ] In `packages/devs-core/src/state-machine/__tests__/orchestration-state-machine.test.ts`, write unit tests for an `OrchestrationStateMachine` class covering:
  - Valid transitions: `IDLE → RUNNING`, `RUNNING → SUCCESS`, `RUNNING → FAILED`, `FAILED → IDLE`, `RUNNING → PAUSED`, `PAUSED → RUNNING`.
  - Invalid/illegal transitions that must throw a typed `InvalidStateTransitionError` (e.g., `IDLE → SUCCESS`, `SUCCESS → FAILED`).
  - Concurrent transition attempts: simulate two simultaneous `transition()` calls and assert only one succeeds; the other rejects.
  - Test that each transition is wrapped in an SQLite transaction: mock the `DatabaseService` and assert `beginTransaction`, `commitTransaction`, and `rollbackTransaction` are called in the correct order.
  - Test that a Git operation failure during a transition triggers `rollbackTransaction` and the state reverts to its pre-transition value.
  - Test entropy detection: after 5 consecutive `FAILED` transitions, assert `EntropyDetector.record()` is called and an `EntropyThresholdExceededEvent` is emitted.

## 2. Task Implementation
- [ ] Create `packages/devs-core/src/state-machine/orchestration-state-machine.ts`:
  - Define a `TaskState` enum: `IDLE | RUNNING | PAUSED | SUCCESS | FAILED | REWINDING`.
  - Define an `OrchestrationStateMachine` class with:
    - A private `_state: TaskState` field initialized to `IDLE`.
    - A `readonly` adjacency map `VALID_TRANSITIONS: Map<TaskState, TaskState[]>` encoding the allowed transition graph.
    - An async `transition(next: TaskState, context: TransitionContext): Promise<void>` method that:
      1. Validates the proposed transition against `VALID_TRANSITIONS`; throws `InvalidStateTransitionError` if illegal.
      2. Acquires a mutex lock (use `async-mutex` package) to prevent concurrent transitions.
      3. Opens a `DatabaseService.beginTransaction()`.
      4. Executes the optional `context.preCommitHook()` (e.g., git commit operation).
      5. On success: writes the new state to `task_runs` table and calls `DatabaseService.commitTransaction()`.
      6. On any error: calls `DatabaseService.rollbackTransaction()` and re-throws.
      7. Releases the mutex lock in a `finally` block.
    - A `getState(): TaskState` getter.
    - An `EntropyDetector` integration: call `this.entropyDetector.record(TaskState.FAILED)` on every FAILED transition; emit `EntropyThresholdExceededEvent` when threshold (5) is crossed.
- [ ] Create `packages/devs-core/src/state-machine/errors.ts` with `InvalidStateTransitionError extends Error`.
- [ ] Create `packages/devs-core/src/state-machine/entropy-detector.ts` with the `EntropyDetector` class that maintains a rolling count of FAILED transitions.
- [ ] Register `OrchestrationStateMachine` in the DI container as a singleton in `packages/devs-core/src/container.ts`.

## 3. Code Review
- [ ] Verify the mutex is released in ALL code paths (success, validation error, hook error) via `finally`.
- [ ] Confirm `rollbackTransaction` is called before re-throwing any error from within the transaction block.
- [ ] Ensure `VALID_TRANSITIONS` is declared `readonly` and is not mutated at runtime.
- [ ] Confirm `EntropyDetector` counter resets to zero after a successful `SUCCESS` transition, preventing false positives across distinct tasks.
- [ ] Verify the class emits an event (via `EventEmitter2` or equivalent) rather than calling side-effect logic directly, keeping the state machine decoupled.
- [ ] Check that `InvalidStateTransitionError` includes `fromState`, `toState`, and `taskId` in its payload for forensic logging.

## 4. Run Automated Tests to Verify
- [ ] Run `pnpm --filter devs-core test -- --testPathPattern="orchestration-state-machine"` and confirm all tests pass with zero failures.
- [ ] Run `pnpm --filter devs-core test -- --coverage --testPathPattern="state-machine"` and confirm line and branch coverage is ≥ 90% for the `state-machine/` directory.

## 5. Update Documentation
- [ ] Create `packages/devs-core/src/state-machine/orchestration-state-machine.agent.md` documenting:
  - The valid state transition graph (as a Mermaid stateDiagram-v2).
  - The ACID guarantee contract: "No state is persisted unless the Git operation and DB write both succeed."
  - The entropy detection threshold and reset behavior.
  - The mutex locking strategy and why it is needed.
- [ ] Add an entry to `docs/architecture/state-machine.md` summarizing the `OrchestrationStateMachine`'s role in `devs-core`.

## 6. Automated Verification
- [ ] Run `pnpm --filter devs-core test:ci` and assert exit code is `0`.
- [ ] Run `pnpm --filter devs-core lint` and assert exit code is `0` with no errors related to the `state-machine/` directory.
- [ ] Execute `node -e "const {OrchestrationStateMachine} = require('./packages/devs-core/dist'); const sm = new OrchestrationStateMachine(); sm.getState();"` and assert it prints `'IDLE'` without throwing.
