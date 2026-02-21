# Task: Develop Agent Deadlock and Conflict Resolution Protocol (Sub-Epic: 29_8_RISKS)

## Covered Requirements
- [8_RISKS-REQ-125], [8_RISKS-REQ-138]

## 1. Initial Test Written
- [ ] Write a unit test for `ConflictDetector` that asserts an event is triggered when the Developer and Reviewer agents exchange > 3 consecutive rejections.
- [ ] Write an integration test where a mocked Reviewer repeatedly fails the Developer's code, asserting that the orchestrator eventually transitions to a `USER_CLARIFICATION_REQUIRED` state.
- [ ] Create tests verifying that the `StrategyPivotAgent` is invoked when a deep disagreement is detected.

## 2. Task Implementation
- [ ] Implement the `ConflictDetector` within the LangGraph orchestrator state machine to monitor the handoffs between the `CodeNode` and `ReviewNode`.
- [ ] Implement logic counting consecutive rejection cycles for the exact same `Task ID`. If it exceeds 3 cycles, halt the agent loop.
- [ ] Implement the `ConflictResolution` fallback action, which bundles the conflicting arguments (Developer's reasoning vs Reviewer's rejection reason) and escalates to the user via a VSCode pop-up or CLI prompt.
- [ ] Add the ability to invoke the `StrategyPivotAgent` (first principles reasoning) as an alternative resolution path prior to escalating to the human user.

## 3. Code Review
- [ ] Verify that `ConflictDetector` does not accidentally trigger on standard, single-turn TDD failures (a single Red -> Green failure is normal; repetitive stalling is not).
- [ ] Ensure the bundled context provided to the user clearly isolates the root cause of the disagreement.

## 4. Run Automated Tests to Verify
- [ ] Execute tests simulating multi-agent interactions via `pnpm test:integration --filter orchestrator`.
- [ ] Validate the correct state transitions (e.g., `ReviewNode` -> `ConflictResolutionNode` -> `UserIntervention`) when conflict thresholds are breached.

## 5. Update Documentation
- [ ] Document the deadlock threshold logic and the resulting state machine transitions in the `docs/tas_architecture.md`.
- [ ] Add an entry in the agent memory (`.agent/conflict-resolution.md`) outlining how agents are programmed to yield to user directives during deadlocks.

## 6. Automated Verification
- [ ] Inspect the output of the automated state machine verifier script to ensure `USER_CLARIFICATION_REQUIRED` is a reachable node from the `ReviewNode`.
