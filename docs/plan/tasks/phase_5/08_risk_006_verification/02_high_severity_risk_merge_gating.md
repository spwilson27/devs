# Task: 02_High Severity Risk Merge Gating (Sub-Epic: 08_Risk 006 Verification)

## Covered Requirements
- [RISK-BR-006], [RISK-BR-010]

## Dependencies
- depends_on: ["01_automated_risk_state_transitions.md"]
- shared_components: [Traceability & Coverage Infrastructure]

## 1. Initial Test Written
- [ ] Create a Python unit test file at `.tools/tests/test_risk_merge_gate.py` with a test class `TestHighSeverityRiskMergeGate`.
- [ ] Write a test `test_severity_score_6_or_higher_requires_mitigation_and_test` that:
  - Creates a mock risk entry with `severity_score: 7` and no `mitigation_id` or `covering_tests`.
  - Invokes the merge gate validation and asserts it returns `GateResult.FAIL` with error message "RISK-XXX: severity_score=7 requires mitigation design and covering test".
- [ ] Write a test `test_severity_score_6_with_mitigation_but_no_test_fails_gate` that verifies mitigation alone is insufficient — a covering test reference must exist.
- [ ] Write a test `test_severity_score_5_does_not_require_mitigation` that verifies risks with `severity_score < 6` pass the gate without mitigation.
- [ ] Write a test `test_severity_score_6_with_mitigation_and_failing_test_passes_gate` that confirms the "Red phase is sufficient" rule: test existence (not passing) satisfies the gate.
- [ ] Ensure all tests use pytest fixtures and assert exact error messages for CI parsing.

## 2. Task Implementation
- [ ] Create `.tools/risk_merge_gate.py` with a class `RiskMergeGateChecker` that:
  - Parses `docs/plan/requirements/8_risks_mitigation.md` to extract all risk entries with their `severity_score`, `mitigation_id` (or `[MIT-NNN]` tag), and `covering_tests`.
  - Implements `check_all_high_severity_risks()` method that:
    - Filters risks with `severity_score >= 6`.
    - For each, verifies: (a) `mitigation_id` or `[MIT-NNN]` tag exists, (b) at least one `covering_tests` entry is referenced.
    - Returns `GateResult` with detailed error list for any violations.
- [ ] Integrate the checker into `./do presubmit` by adding a step in the script that runs `python -m tools.risk_merge_gate` before the test phase.
- [ ] Add logging: `print(f"[RISK-GATE] Checking {len(high_severity_risks)} high-severity risks...")` and `print(f"[RISK-GATE] PASS/FAIL: {details}")`.
- [ ] Ensure the tool exits with code 1 on failure, blocking the presubmit pipeline.

## 3. Code Review
- [ ] Verify the severity score extraction regex `r'severity_score:\s*(\d+)'` correctly handles inline and multi-line formats.
- [ ] Confirm the "Red phase is sufficient" rule is implemented: the gate checks for test *existence* in the requirement block, not test *passing* status (that's Task 01's responsibility).
- [ ] Verify error messages include the exact risk ID and severity score for quick triage: "RISK-015 (severity_score=8): missing covering_tests".
- [ ] Ensure the gate runs early in presubmit (before expensive test execution) to fail fast.

## 4. Run Automated Tests to Verify
- [ ] Run `pytest .tools/tests/test_risk_merge_gate.py -v` and confirm all tests pass.
- [ ] Manually create a test risk with `severity_score: 8` and no mitigation in a temporary markdown file, run the gate checker, and verify it fails with the expected error.
- [ ] Run `./do presubmit` with a valid high-severity risk (mitigation + test reference) and verify the gate passes.

## 5. Update Documentation
- [ ] Update `docs/plan/summaries/8_risks_mitigation.md` section on [RISK-BR-010] to document: "Merge gating implemented in `.tools/risk_merge_gate.py`, enforced by `./do presubmit`."
- [ ] Add a section to `docs/plan/adversarial_review.md` describing the merge gate as a risk mitigation enforcement mechanism.

## 6. Automated Verification
- [ ] Run `python -m tools.risk_merge_gate` on the current codebase and verify it exits 0 with all existing high-severity risks satisfying the gate.
- [ ] Verify the gate is invoked in `./do presubmit` by checking the script output for `[RISK-GATE]` log lines.
