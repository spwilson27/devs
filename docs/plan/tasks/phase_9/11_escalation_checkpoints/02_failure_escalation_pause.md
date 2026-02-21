# Task: Task Failure Escalation Pause (Sub-Epic: 11_Escalation & Checkpoints)

## Covered Requirements
- [TAS-020]

## 1. Initial Test Written
- [ ] Write integration and state transition tests in `tests/orchestrator/escalation.test.ts` focusing on the LangGraph orchestration loop.
- [ ] Add a test verifying that when a task's implementation fails verification (TDD cycle) 5 consecutive times, the state machine successfully transitions to a `PAUSED_FOR_INTERVENTION` state.
- [ ] Add tests to verify that the failure counter increments correctly after each failed task attempt and properly resets to zero upon a successful verification.

## 2. Task Implementation
- [ ] In the orchestration state definition (e.g., `src/orchestrator/state.ts`), add a `consecutiveFailures` counter to the Task Execution state schema.
- [ ] Modify the `DeveloperAgent` loop or the `TaskExecutorNode` logic to increment `consecutiveFailures` whenever an implementation attempt fails the automated tests or Reviewer Agent verification.
- [ ] Introduce a threshold check: if `consecutiveFailures >= 5`, trigger an escalation event and explicitly transition the LangGraph state to `PAUSED_FOR_INTERVENTION`.
- [ ] Expose an API/command handler via MCP or the event bus that allows a human user to explicitly resume, abort, or reset the task from this paused state.

## 3. Code Review
- [ ] Verify that the state transition relies purely on the LangGraph state machine structure (ACID compliant) and does not rely on hidden, volatile, in-memory variables.
- [ ] Ensure the pause state and the failure count are properly serialized and persisted in the `.devs/state.sqlite` database, allowing the system to be safely restarted without losing the pause condition.

## 4. Run Automated Tests to Verify
- [ ] Execute `npm run test -- tests/orchestrator/escalation.test.ts` and ensure all escalation pause logic tests pass.

## 5. Update Documentation
- [ ] Update `docs/orchestrator_state_machine.md` with Mermaid diagrams reflecting the new `PAUSED_FOR_INTERVENTION` escalation node.
- [ ] Document the 5-failure threshold rule in the Agent-Oriented Documentation (`.agent.md`) so future agents are aware of the strict escalation bounds.

## 6. Automated Verification
- [ ] Create an automated verification script (`scripts/verify_escalation.sh`) that mocks an implementation node to deliberately fail its test suite 5 consecutive times, automatically verifying that the orchestrator loop halts and emits the `PAUSED_FOR_INTERVENTION` event.
