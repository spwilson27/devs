# Task: Implement Reviewer Agent Requirement vs. Commit Validation (Sub-Epic: 03_Cross-Verification & Validation Logic)

## Covered Requirements
- [2_TAS-REQ-005]

## 1. Initial Test Written
- [ ] Create `tests/agents/nodes/test_review_node_validation.py`.
- [ ] Write `test_reviewer_validates_requirements_success` which mocks a scenario where a code diff meets all provided task requirements. Assert the output model returns `APPROVED`.
- [ ] Write `test_reviewer_validates_requirements_failure` where the diff intentionally omits a requirement. Assert the output model returns `REJECTED` and includes a Root Cause Analysis (RCA) explaining the missing requirement.

## 2. Task Implementation
- [ ] In `src/agents/nodes/review_node.py`, implement the execution logic to ingest the active task's `requirements` list and the `DeveloperAgent`'s proposed commit diff.
- [ ] Construct the evaluation prompt instructing the LLM to verify that *every* requirement ID is demonstrably fulfilled in the code.
- [ ] Implement a structured output parser (using Pydantic or equivalent) to enforce the Reviewer Agent returns a JSON object with `approved` (boolean), `met_requirements` (list), and `missing_requirements` (list).

## 3. Code Review
- [ ] Verify the structured output parsing is robust and handles potential LLM hallucination or malformed JSON gracefully (e.g., using a retry wrapper).
- [ ] Ensure the prompt explicitly demands proof from the diff for each requirement.

## 4. Run Automated Tests to Verify
- [ ] Execute `pytest tests/agents/nodes/test_review_node_validation.py` and ensure it passes.

## 5. Update Documentation
- [ ] Update `docs/reviewer_guidelines.md` or equivalent to document the strict JSON schema expected from the Reviewer Agent.
- [ ] Update agent memory to reflect the new structured output format for validation.

## 6. Automated Verification
- [ ] Validate the Pydantic schema using a type-checker or schema validation script: `python scripts/validate_schemas.py --schema=ReviewerOutput`.
