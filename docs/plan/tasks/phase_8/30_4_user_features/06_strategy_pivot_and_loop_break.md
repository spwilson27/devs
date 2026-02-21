# Task: Strategy Pivot & Loop Break (Sub-Epic: 30_4_USER_FEATURES)

## Covered Requirements
- [4_USER_FEATURES-REQ-022]

## 1. Initial Test Written
- [ ] Create `src/core/orchestrator/__tests__/strategy_pivot.test.ts`.
- [ ] Write a test `should pause the main implementation loop when ENTROPY_LOOP_DETECTED is received`.
- [ ] Write a test `should invoke the StrategyPivotAgent to generate a new approach`.
- [ ] Write a test `should inject the new strategy into the active task context and resume execution`.

## 2. Task Implementation
- [ ] Implement `src/core/agents/StrategyPivotAgent.ts` with a specialized system prompt instructing it to analyze a repeating failure trace and reason from first principles to propose an entirely different technical approach.
- [ ] In the LangGraph orchestration loop (`src/core/orchestrator/Engine.ts`), add an event listener for `ENTROPY_LOOP_DETECTED`.
- [ ] When detected, the orchestrator MUST transition to a special `StrategyPivotNode` within 1 turn.
- [ ] The `StrategyPivotNode` extracts the task history and the repeating error logs, passes them to the `StrategyPivotAgent`, and awaits a response.
- [ ] Once the new strategy is generated, it is appended to the `MemoryLayer` as a high-priority system directive: `[STRATEGY PIVOT DIRECTIVE]`.
- [ ] The node then transitions back to the `PlanNode` or `CodeNode`, forcing the `DeveloperAgent` to read the new directive and abandon its previous approach.
- [ ] If a loop is detected 3 times within the same task (9 total identical errors), transition the system to a `PAUSED_FOR_INTERVENTION` state and alert the UI.

## 3. Code Review
- [ ] Verify the LangGraph state definitions to ensure the `StrategyPivotNode` is a valid transition from any implementation node.
- [ ] Ensure that the pivot directive is strongly emphasized in the context window so the LLM doesn't ignore it.
- [ ] Confirm the hard stop logic (3 pivots max) is robust and correctly notifies the CLI/VSCode extension via the event bus.

## 4. Run Automated Tests to Verify
- [ ] Run `npm run test:unit -- src/core/orchestrator/__tests__/strategy_pivot.test.ts` to ensure the orchestrator halts and pivots correctly.
- [ ] Run `npm run test:integration -- src/core/orchestrator/__tests__/engine_entropy.integration.test.ts` to verify the end-to-end loop breaking behavior.

## 5. Update Documentation
- [ ] Update `docs/architecture/entropy_management.md` with the orchestrator graph transition details for the pivot node.
- [ ] Add the `StrategyPivotAgent` prompt to `docs/agents/prompts.md`.

## 6. Automated Verification
- [ ] Use a mock tool script `scripts/simulate_infinite_loop.ts` that always returns the same error string to the orchestrator. Assert that the orchestrator successfully intercepts the loop, pivots, and eventually pauses for human intervention after the threshold is reached.
