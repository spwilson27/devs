# Task: Implement Entropy Pause and Failure Analysis (Sub-Epic: 35_1_PRD)

## Covered Requirements
- [1_PRD-REQ-UI-012]

## 1. Initial Test Written
- [ ] Create a test file `src/core/orchestrator/__tests__/EntropyPauseAnalyzer.test.ts`.
- [ ] Write a test `should detect 3 consecutive TDD loop failures for the same task`.
- [ ] Write a test `should trigger failure analysis payload generation upon reaching max-retry threshold`.
- [ ] Write a test `should transition task state to PAUSED_FOR_INTERVENTION and emit a UI event`.
- [ ] Write a test `should clear failure count if a task successfully completes before the threshold`.

## 2. Task Implementation
- [ ] Create or update the `EntropyDetector` or `FailureAnalyzer` class in `src/core/orchestrator/`.
- [ ] Implement a counter in the `tasks` or `agent_logs` SQLite tables to track consecutive failures per Task ID.
- [ ] Implement the `analyzeFailure(taskId, errorLogs)` method to aggregate the last 3 error outputs.
- [ ] Integrate with the LangGraph state machine to intercept the TDD loop when the threshold is hit and force a state transition to `PAUSED_FOR_INTERVENTION`.
- [ ] Dispatch an `ENTROPY_PAUSE` event to the VSCode UI/CLI with the aggregated failure analysis payload.

## 3. Code Review
- [ ] Verify that the failure counter is robust against process restarts (must be persisted in SQLite).
- [ ] Ensure the LangGraph node transition correctly halts execution and does not enter an infinite loop of pausing.
- [ ] Ensure the emitted event payload contains enough context (error hashes, task ID) for the UI to render the Failure Analysis view.

## 4. Run Automated Tests to Verify
- [ ] Execute `npm run test -- src/core/orchestrator/__tests__/EntropyPauseAnalyzer.test.ts`.
- [ ] Ensure proper behavior under mocked consecutive failures.

## 5. Update Documentation
- [ ] Document the new `PAUSED_FOR_INTERVENTION` state in `docs/architecture/state_machine.md`.
- [ ] Update the `developer_agent.md` guidelines on how the threshold is enforced.

## 6. Automated Verification
- [ ] Provide a mock failing shell command to the TDD loop and verify it automatically pauses on the 3rd iteration and emits the correct event payload.
