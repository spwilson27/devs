# Task: Implement Arbitration Node for Agent Disagreements (Sub-Epic: 10_Human-in-the-Loop & Gates)

## Covered Requirements
- [8_RISKS-REQ-022]

## 1. Initial Test Written
- [ ] Write a test in `tests/orchestrator/arbitration_node.test.ts` that simulates a task looping between the `DeveloperAgent` and `ReviewerAgent` failing validation 3 consecutive times.
- [ ] Assert that upon the 3rd rejection, the state machine routes to an `ArbitrationNode` instead of returning to the `DeveloperAgent`.
- [ ] Assert that the `ArbitrationNode` receives both reasoning traces and outputs a binding decision that either forces a commit or fails the task entirely.

## 2. Task Implementation
- [ ] Implement `src/orchestrator/nodes/ArbitrationNode.ts`.
- [ ] Define the `ArbitratorAgent` prompt in `src/agents/prompts/arbitrator.ts`. This prompt must be highly analytical, ingest the full trace of the disagreement, and formulate a decisive ruling.
- [ ] Update `src/orchestrator/graph.ts` to track consecutive disagreement turns (using state memory). Add a conditional edge from the `VerificationNode`: if `disagreement_count >= 3`, transition to `ArbitrationNode`.
- [ ] Implement the logic in `ArbitrationNode` to interpret the Arbitrator's binding decision:
  - If it sides with the Developer: Override the test failure/reviewer rejection and proceed to `CommitNode` with a special `ARBITRATED_SUCCESS` flag.
  - If it sides with the Reviewer: Halt the task loop, tag it as `FAILED_ARBITRATION`, and escalate to user intervention via a hitl gate.

## 3. Code Review
- [ ] Ensure the state machine correctly resets the `disagreement_count` when a task successfully passes verification or moves to a completely new implementation strategy.
- [ ] Verify that the `ArbitrationNode` safely constructs its prompt without exceeding token limits by summarizing or truncating early turns if necessary.

## 4. Run Automated Tests to Verify
- [ ] Execute `npm run test tests/orchestrator/arbitration_node.test.ts` to verify the routing logic.
- [ ] Run `npm run test` globally to ensure no impact on tasks that resolve in fewer than 3 turns.

## 5. Update Documentation
- [ ] Document the Arbitrator Agent's role and logic in `.agent/arbitration.agent.md`.
- [ ] Update the LangGraph flow diagrams in `docs/architecture/state_machine.md` to visually represent the Arbitration loop and exit conditions.

## 6. Automated Verification
- [ ] Write `scripts/verify_arbitration.ts` to feed a mocked task with hardcoded conflicting agent responses. Verify that the orchestrator correctly spawns the ArbitrationNode and that the final task status reflects the Arbitrator's mocked decision.
