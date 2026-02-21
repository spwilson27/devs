# Task: State Machine Robustness and Error Recovery (Sub-Epic: 04_LangGraph Core Orchestration Engine)

## Covered Requirements
- [8_RISKS-REQ-001], [TAS-078], [9_ROADMAP-PHASE-001]

## 1. Initial Test Written
- [ ] Create a test suite in `packages/core/src/orchestration/__tests__/robustness.test.ts`.
- [ ] Simulate an unhandled exception in an agent node and verify the graph transitions to an `error` state rather than crashing the entire process.
- [ ] Test the "Maximum Implementation Turns" limit: ensure the graph stops and asks for intervention after 10 failed turns (1_PRD-REQ-REL-002).
- [ ] Test the "Entropy Detection" integration (mocked) to ensure the graph pivots when loops are detected.

## 2. Task Implementation
- [ ] Implement a global `error` node in the LangGraph that captures exceptions from any other node.
- [ ] Add logic to the `error` node to:
    - Log the full stack trace to the `agent_logs` table.
    - Update the task status to `FAILED` or `ERROR`.
    - Determine if a retry is possible based on the error type and count.
- [ ] Implement "Turn Budget" enforcement: track the number of implementation turns in the `GraphState` and trigger a `STRATEGY_PIVOT` or `PAUSE` if exceeded.
- [ ] Add "Chaos Recovery" logic: on startup, check for "Stale" or "Dirty" states in SQLite and automatically offer to `rewind` or `resume`.
- [ ] Implement a `PivotAgent` node (stub) that is invoked when the same error occurs 3 times consecutively (9_ROADMAP-REQ-012).

## 3. Code Review
- [ ] Verify that no error can leave the system in an inconsistent state (ACID compliance).
- [ ] Ensure the loop detection logic (EntropyDetector) is correctly hooked into the orchestration flow.
- [ ] Check that sensitive information is NOT logged in the error traces (SecretMasker integration).

## 4. Run Automated Tests to Verify
- [ ] Run `pnpm test packages/core` and ensure robustness and error recovery tests pass.

## 5. Update Documentation
- [ ] Update the Risks and Mitigation document with the implemented state machine recovery strategies.

## 6. Automated Verification
- [ ] Run the "Stress Test" script `scripts/stress-test-orchestrator.ts` to verify stability under high-frequency state transitions and forced errors.
