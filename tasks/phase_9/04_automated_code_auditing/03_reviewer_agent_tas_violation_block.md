# Task: TAS Violation Commit Block Logic (Sub-Epic: 04_Automated Code Auditing)

## Covered Requirements
- [9_ROADMAP-REQ-IMP-002]

## 1. Initial Test Written
- [ ] Write a new graph orchestration test in `tests/orchestrator/TASViolationBlock.test.ts`.
- [ ] Create a mock state where the Reviewer Agent flags a TAS violation (e.g., using a library explicitly forbidden in the TAS).
- [ ] Assert that the LangGraph state machine transitions from the `ReviewNode` back to the `PlanNode` instead of proceeding to `CommitNode`.
- [ ] Assert that the Reviewer Agent's feedback is injected into the context of the `PlanNode` to prevent repeated violations.

## 2. Task Implementation
- [ ] Open the orchestration state machine configuration (`src/orchestrator/graph.ts` or equivalent).
- [ ] Define the conditional edge logic exiting the `ReviewNode`.
- [ ] Check the `tas_violation` flag in the structured output of the Reviewer Agent.
- [ ] If a TAS violation is detected, update the task state status to `FAILED_TAS_REVIEW`.
- [ ] Route the next graph execution step to `PlanNode` and pass the `ReviewNode` explanation as required context.
- [ ] Ensure that the file system is NOT committed and that no git snapshot is taken.

## 3. Code Review
- [ ] Verify that returning to the `PlanNode` doesn't cause an infinite loop (check entropy detection compatibility).
- [ ] Ensure state mutation for `tas_violation` is ACID compliant and recorded in SQLite correctly so the context isn't lost on restart.

## 4. Run Automated Tests to Verify
- [ ] Execute `npm run test -- TASViolationBlock.test.ts`.
- [ ] The test must show the agent cleanly routing backward through the DAG.
- [ ] Also verify that a successful review properly routes to `CommitNode`.

## 5. Update Documentation
- [ ] Document the TAS violation pipeline in `.agent.md`, detailing how a developer agent should consume `tas_violation` feedback during its retry in the `PlanNode`.

## 6. Automated Verification
- [ ] Run `npm run test -- orchestrator` to verify the state graph correctly handles the conditional edges without affecting the successful path logic.