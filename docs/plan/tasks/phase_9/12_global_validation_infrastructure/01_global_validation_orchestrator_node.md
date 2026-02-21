# Task: Implement Global Validation LangGraph Node (Sub-Epic: 12_Global Validation Infrastructure)

## Covered Requirements
- [9_ROADMAP-TAS-801], [9_ROADMAP-REQ-042]

## 1. Initial Test Written
- [ ] Create a new unit test suite `tests/core/orchestrator/GlobalValidationNode.test.ts`.
- [ ] Write tests ensuring `GlobalValidationNode` correctly transitions from `Phase 8` to `Global Validation`.
- [ ] Write tests mocking a successful sandbox audit that asserts the node transitions to `END_SUCCESS`.
- [ ] Write tests mocking a failing sandbox audit that asserts the node transitions to the `RCA_Node` (Root Cause Analysis).
- [ ] Ensure the tests initially fail, confirming the red-phase gate.

## 2. Task Implementation
- [ ] Create `src/core/orchestrator/nodes/GlobalValidationNode.ts`.
- [ ] Implement the `execute` method to read the final project configuration and tasks from `state.sqlite`.
- [ ] Connect the node into the main LangGraph state machine in `src/core/orchestrator/graph.ts`.
- [ ] Configure the `GlobalValidationNode` to orchestrate a full project delivery payload including triggering a clean sandbox build.
- [ ] Ensure it logs specific status updates via the Real-time Trace & Event Streaming (RTES) bus.

## 3. Code Review
- [ ] Verify that LangGraph state is strictly mutated following the ACID-compliant checkpointer rules.
- [ ] Ensure `GlobalValidationNode.ts` delegates actual sandbox execution to a `GlobalAuditRunner` interface rather than directly instantiating Docker containers.
- [ ] Confirm there are no hardcoded context window boundaries or unresolved dependencies in the logic.

## 4. Run Automated Tests to Verify
- [ ] Execute `npx vitest run tests/core/orchestrator/GlobalValidationNode.test.ts`.
- [ ] Ensure 100% pass rate.
- [ ] Check code coverage for the newly added `GlobalValidationNode` via `npx vitest run --coverage`.

## 5. Update Documentation
- [ ] Update `.agent.md` documentation in `.agent/core/orchestrator.agent.md` to reflect the addition of the `GlobalValidationNode`.
- [ ] Detail the graph transition states (to `END_SUCCESS` or `RCA_Node`) in the orchestrator documentation.

## 6. Automated Verification
- [ ] Run `npm run lint` and `npm run typecheck` to verify codebase structural integrity.
- [ ] Run the test suite using `devs test --file tests/core/orchestrator/GlobalValidationNode.test.ts` to confirm no hallucinated success.