# Task: Implement Strategy Pivot on Loop (Sub-Epic: 34_4_USER_FEATURES)

## Covered Requirements
- [4_USER_FEATURES-REQ-079]

## 1. Initial Test Written
- [ ] Create `tests/agents/DeveloperAgent/StrategyPivot.test.ts`.
- [ ] Write a test `should transition state machine to STRATEGY_PIVOT when EntropyDetector flags a loop`.
- [ ] Write a test `should inject a 'reason from first principles' directive into the context window for the next turn`.
- [ ] Write a test `should clear the recent hashed history window after a pivot is successfully triggered`.

## 2. Task Implementation
- [ ] Modify the LangGraph cyclical state machine in `src/core/orchestration/TaskGraph.ts`.
- [ ] Add a conditional edge from the `CodeNode` (or `TestNode`) to a new or existing `StrategyPivotNode` that triggers if `entropy_detected` is true.
- [ ] Inside `StrategyPivotNode`, synthesize a specific system message: "You are stuck in a loop. Discard your previous approach. Reason from first principles and choose a fundamentally different implementation or library."
- [ ] Prepend this system message to the agent's context and increment a `pivot_count` variable in the active task state.
- [ ] Reset the `EntropyDetector`'s rolling window to prevent an immediate double-pivot on the next turn.

## 3. Code Review
- [ ] Confirm that the state machine cleanly hands off context without losing the original task requirements.
- [ ] Verify that the `pivot_count` prevents an infinite loop of pivots by capping the total number of allowed pivots before a hard failure.

## 4. Run Automated Tests to Verify
- [ ] Execute `npx vitest run tests/agents/DeveloperAgent/StrategyPivot.test.ts`.
- [ ] Confirm 100% pass rate.

## 5. Update Documentation
- [ ] Add a section in `docs/architecture/state_machine.md` outlining the `STRATEGY_PIVOT` node, its triggers, and its payload.
- [ ] Update the `.agent.md` file for the DeveloperAgent describing its expected behavior upon receiving a pivot directive.

## 6. Automated Verification
- [ ] Create a mock task that consistently fails (e.g. by mocking a tool execution to always return the same `npm ERR! code E404`). Verify that after 3 turns, the agent trace logs show the ingestion of the "reason from first principles" system prompt.