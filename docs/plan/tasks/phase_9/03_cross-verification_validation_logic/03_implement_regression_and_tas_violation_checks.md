# Task: Implement Regression and TAS Violation Checks in ReviewNode (Sub-Epic: 03_Cross-Verification & Validation Logic)

## Covered Requirements
- [3_MCP-TAS-086]

## 1. Initial Test Written
- [ ] Create `tests/agents/nodes/test_reviewer_constraints.py`.
- [ ] Write `test_reviewer_tas_violation_detection`: Provide a diff introducing a forbidden pattern/library (e.g., bypassing a required wrapper). Assert the `ReviewNode` rejects and outputs a structured TAS violation report.
- [ ] Write `test_reviewer_regression_detection`: Provide raw sandbox test output showing failures. Assert the node rejects the diff and formats a Regression violation report.

## 2. Task Implementation
- [ ] Enhance `ReviewNode` in `src/agents/nodes/review_node.py` to ingest two new inputs: 1) The full Technical Architecture Specification (TAS) or a distilled constraints list. 2) The raw output of the test suite execution from the sandbox.
- [ ] Update the Reviewer's evaluation prompt to explicitly check for architectural constraints outlined in the TAS.
- [ ] Update the prompt to verify that the sandbox test output indicates a 100% pass rate, identifying regressions if any tests fail.
- [ ] Extend the structured output model to include `tas_violations` (list) and `regression_failures` (list).

## 3. Code Review
- [ ] Ensure the prompt prioritizes hard TAS constraints and objective test outputs over subjective code style preferences.
- [ ] Verify the token count management: ensure injecting the TAS doesn't trivially blow out the Reviewer's context window (implement summarization or extraction if necessary).

## 4. Run Automated Tests to Verify
- [ ] Execute `pytest tests/agents/nodes/test_reviewer_constraints.py` to confirm TAS and regression checks work as intended.

## 5. Update Documentation
- [ ] Add documentation in `docs/reviewer_guidelines.md` explaining how TAS rules and test outputs are injected into the review process.

## 6. Automated Verification
- [ ] Run a prompt-checking script: `python scripts/check_prompt_includes.py --target=ReviewNode --must-include="TAS constraints"`.
