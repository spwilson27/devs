# Task: Enforce pre-code gate requiring Shadow Architect approval (Sub-Epic: 23_8_RISKS)

## Covered Requirements
- [8_RISKS-REQ-020]

## 1. Initial Test Written
- [ ] Create integration tests at `tests/integration/test_plannode_pre_code_gate.py`.
  - Scenario A (disallow): Mock ShadowArchitect.analyze_plan to return `{approved: False, comments: 'TAS violation'}`. Execute PlanNode.process(plan) and assert that CodeNode is not invoked; assert PlanNode returns a structured response indicating `blocked_by: 'shadow_architect'` and includes the review comments.
  - Scenario B (allow): Mock analyze_plan to return `{approved: True}` and assert CodeNode is executed and `surgical_edit` is called.

## 2. Task Implementation
- [ ] Modify `devs/plannode/plan_node.py` or the execution controller to:
  - After plan generation and before invoking CodeNode, synchronously call `ShadowArchitect.analyze_plan(plan)`.
  - If `approved` is False, stop execution, persist the review into plan metadata, and create a follow-up action (either enqueue the suggested changes back into PlanNode or generate a TAS revision proposal if the review indicates a TAS violation).
  - Implement reasonable timeouts and retry semantics (e.g., 5s timeout, 1 retry) and ensure timeouts produce a deterministic `blocked_by` state for human review.

## 3. Code Review
- [ ] Confirm gating is deterministic and that PlanNode logs the exact decision path including SAOP trace IDs.
- [ ] Ensure that blocking reasons are machine-readable so automation and UIs can render them (fields: blocked_by, reason_code, trace_id).
- [ ] Verify that retries and timeouts do not allow CodeNode to proceed silently; include unit tests covering timeout behavior.

## 4. Run Automated Tests to Verify
- [ ] Run `python -m pytest tests/integration/test_plannode_pre_code_gate.py -q` and ensure both scenarios pass.

## 5. Update Documentation
- [ ] Update `docs/architecture/plan_node.md` and `docs/agents/shadow_architect.md` to describe the pre-code gate behavior, timeout policy, and expected response schema.

## 6. Automated Verification
- [ ] Add this integration test to CI gating for any PR touching PlanNode, ShadowArchitect, or CodeNode so regressions are caught automatically.
