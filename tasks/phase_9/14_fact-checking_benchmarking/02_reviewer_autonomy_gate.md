# Task: Implement Reviewer Autonomy Anti-Pattern Detection (Sub-Epic: 14_Fact-Checking & Benchmarking)

## Covered Requirements
- [9_ROADMAP-REQ-034]

## 1. Initial Test Written
- [ ] Write an integration test in `tests/orchestrator/reviewerAutonomy.test.ts`.
- [ ] Create a mock implementation payload containing a "Deliberate Anti-Pattern" (e.g., a hardcoded AWS secret key or a SQL injection vulnerability).
- [ ] Assert that when the `ReviewerAgent` processes this payload, it successfully identifies the anti-pattern, sets the validation state to `REJECTED`, and emits a `REVERT` action with a clear explanation of the security flaw.

## 2. Task Implementation
- [ ] Update the `ReviewerAgent` prompt in `src/agents/ReviewerAgent.ts` to explicitly include "Hostile Auditor" instructions. Instruct the agent to specifically look for deliberate anti-patterns, hardcoded secrets, and deviations from the TAS.
- [ ] Implement logic in the ReviewNode of the LangGraph state machine (`src/orchestrator/nodes/ReviewNode.ts`) to handle the `REVERT` action emitted by the ReviewerAgent.
- [ ] If a `REVERT` is triggered, the node must discard the current implementation diff, increment the retry counter, and route the state back to the `DeveloperAgent` with the Reviewer's feedback.

## 3. Code Review
- [ ] Verify that the `ReviewNode` securely clears any temporary files associated with the rejected implementation.
- [ ] Ensure that the ReviewerAgent uses the Gemini 3 Flash model (or designated review model) for faster turnaround, while still catching obvious anti-patterns.
- [ ] Check that a specific exception or flag is logged to `agent_logs` when a `REVERT` occurs.

## 4. Run Automated Tests to Verify
- [ ] Execute `npm run test -- tests/orchestrator/reviewerAutonomy.test.ts` to verify the deliberate anti-pattern is caught.
- [ ] Run the full test suite `npm run test` to guarantee the LangGraph state transitions don't break existing flows.

## 5. Update Documentation
- [ ] Update `.agent/orchestrator.md` to document the "Hostile Auditor" role and the exact workflow of a `REVERT` action within the `ReviewNode`.
- [ ] Log this architectural decision in the vector memory or `.devs/` documentation regarding the handling of anti-patterns.

## 6. Automated Verification
- [ ] Run `npm run typecheck` and `npm run lint` to ensure code quality standards.
- [ ] Inspect the LangGraph visualizer (if available) to ensure the cyclical path from ReviewNode back to DeveloperNode is valid.
