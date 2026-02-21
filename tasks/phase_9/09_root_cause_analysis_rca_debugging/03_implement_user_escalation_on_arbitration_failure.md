# Task: Implement User Escalation on Arbitration Failure (Sub-Epic: 09_Root Cause Analysis (RCA) & Debugging)

## Covered Requirements
- [8_RISKS-REQ-023]

## 1. Initial Test Written
- [ ] Create tests in `tests/core/orchestrator/ArbitrationEscalation.test.ts`.
- [ ] Mock a LangGraph state where two agents (e.g., Developer and Reviewer) have reached an `ARBITRATION_FAILED` state.
- [ ] Mock contradictory PRD and TAS requirements.
- [ ] Write a test asserting that the system transitions to a `PAUSED_FOR_USER_INTERVENTION` state and correctly generates a "Conflict Analysis" Markdown report containing the conflicting requirements.

## 2. Task Implementation
- [ ] Modify the LangGraph state machine in `src/core/orchestrator/graph.ts` to include a `PAUSED_FOR_USER_INTERVENTION` node.
- [ ] Implement `ConflictAnalyzer.generateReport()` in `src/core/analysis/ConflictAnalyzer.ts` to compile the specific PRD/TAS contradictions.
- [ ] Emit an event over the Real-time Trace & Event Streaming (RTES) bus to notify the CLI and VSCode extension of the required escalation.

## 3. Code Review
- [ ] Confirm that the LangGraph state checkpoint is synchronously written to SQLite before emitting the pause event, ensuring the system can be safely restarted by the user later.
- [ ] Check that the generated Markdown report is clearly formatted and explicitly cites the conflicting requirement IDs.

## 4. Run Automated Tests to Verify
- [ ] Run `npm run test -- tests/core/orchestrator/ArbitrationEscalation.test.ts`.
- [ ] Verify that the state transition halts execution and the emitted event payload contains the complete Conflict Analysis report.

## 5. Update Documentation
- [ ] Update `docs/architecture/StateTransitions.md` to document the new `PAUSED_FOR_USER_INTERVENTION` edge case.
- [ ] Update `.agent.md` to reflect that agents should not attempt to resolve explicit PRD/TAS conflicts themselves after a hard failure.

## 6. Automated Verification
- [ ] Use the test harness to simulate an arbitration failure and verify the local SQLite database successfully records the checkpointed paused state using `npm run verify-checkpoint-state`.
