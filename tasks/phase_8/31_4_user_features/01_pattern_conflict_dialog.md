# Task: Implement Pattern Conflict Dialog (Sub-Epic: 31_4_USER_FEATURES)

## Covered Requirements
- [4_USER_FEATURES-REQ-032]

## 1. Initial Test Written
- [ ] Write a unit test `test_pattern_conflict_dialog.ts` that mocks a user directive contradicting a project-wide constraint (e.g., "Use Python" when the project constraint is "TypeScript").
- [ ] Ensure the test asserts that a `ConstraintViolationEvent` is emitted to the UI/CLI stream instead of immediately executing the directive.
- [ ] Write a test that simulates a user providing override confirmation (`human_approval_signature`), asserting that the system then proceeds with the directive.

## 2. Task Implementation
- [ ] Implement a `PatternConflictInterceptor` in the `DeveloperAgent` directive processing pipeline.
- [ ] Hook the interceptor to the `RAG` or `ConstraintEngine` to evaluate the directive against known architectural constraints.
- [ ] If a contradiction is detected, pause the LangGraph orchestrator and dispatch a `ConstraintViolationEvent`.
- [ ] Implement the `Pattern Conflict Dialog` UI component for the VSCode extension and CLI prompt, which displays the contradiction and requires an explicit `Y/n` override confirmation.

## 3. Code Review
- [ ] Verify that the `PatternConflictInterceptor` uses the established `Structured Agent-Orchestrator Protocol (SAOP)`.
- [ ] Ensure the orchestrator's pause state correctly checkpoints to the SQLite database before awaiting human input.
- [ ] Confirm the UI components adhere to the existing presentation standards (e.g., error red styling for conflicts).

## 4. Run Automated Tests to Verify
- [ ] Execute `npm test -- pattern_conflict_dialog` to ensure the interceptor correctly pauses execution and emits the event.
- [ ] Verify the UI tests for the prompt rendering and input handling pass.

## 5. Update Documentation
- [ ] Document the new `ConstraintViolationEvent` in the system event registry (`docs/events.md`).
- [ ] Add the `PatternConflictInterceptor` to the Agent Architecture section of the `TAS`.

## 6. Automated Verification
- [ ] Run a synthetic end-to-end script that pipes a contradictory directive to the CLI in headless mode, asserting that it exits with a `WAITING_FOR_USER_INPUT` code and logs the violation constraint.
