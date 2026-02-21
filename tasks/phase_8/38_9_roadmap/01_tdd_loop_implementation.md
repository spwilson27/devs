# Task: Implement Core TDD Execution Loop Engine (Sub-Epic: 38_9_ROADMAP)

## Covered Requirements
- [9_ROADMAP-REQ-IMP-001], [9_ROADMAP-REQ-IMP-003], [9_ROADMAP-REQ-IMP-005]

## 1. Initial Test Written
- [ ] Create `tests/engine/TddLoopEngine.test.ts`.
- [ ] Write a test `should execute red-green-refactor cycle successfully` that mocks a DeveloperAgent and verifies state transitions from `TestNode` to `CodeNode` to `VerificationNode`.
- [ ] Write a test `should transition to failure state on maximum turn threshold` to verify the execution engine aborts after maximum retries.
- [ ] Ensure tests cover the expected LangGraph or state machine transitions representing the milestones of the TDD loop.

## 2. Task Implementation
- [ ] Create `src/engine/TddLoopEngine.ts`.
- [ ] Implement the `TddLoopEngine` class that manages the sequence of operations: `TestNode` (write failing test), `CodeNode` (implement feature), and `VerificationNode` (run tests to verify).
- [ ] Implement milestones logging within the loop to track task progression (e.g., initialized, test_written, test_failed, code_written, verified).
- [ ] Ensure the implementation leverages the `SandboxProvider` for running the required verification steps securely.

## 3. Code Review
- [ ] Verify the state machine transitions are cleanly separated and do not leak state between turns.
- [ ] Ensure proper error handling and logging of implementation milestones.

## 4. Run Automated Tests to Verify
- [ ] Run `npm run test -- tests/engine/TddLoopEngine.test.ts` and verify all tests pass.

## 5. Update Documentation
- [ ] Update `docs/architecture/execution_engine.md` to document the state transitions and milestone definitions of the TDD loop.
- [ ] Update the `.agent.md` memory to record the availability of the `TddLoopEngine`.

## 6. Automated Verification
- [ ] Run a test script that executes a mock TDD cycle and parses the resulting execution logs to verify that the milestone events ("Test Written", "Code Written", "Verified") were correctly emitted.
