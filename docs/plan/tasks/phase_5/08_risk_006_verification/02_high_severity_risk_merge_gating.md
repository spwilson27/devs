# Task: 02_High Severity Risk Merge Gating (Sub-Epic: 08_Risk 006 Verification)

## Covered Requirements
- [RISK-BR-006]

## Dependencies
- depends_on: [docs/plan/tasks/phase_5/08_risk_006_verification/01_automated_risk_state_transitions.md]
- shared_components: [Traceability & Verification Infrastructure]

## 1. Initial Test Written
- [ ] Create a test in `.tools/tests/test_risk_gate.py` that parses a risk entry with `severity_score >= 6`.
- [ ] The test should verify that if the risk does not have a linked mitigation (`[MIT-NNN]`) OR does not have any `covering_tests` listed (even if they fail), the validation fails with a specific error message.
- [ ] Verify that a risk with `severity_score < 6` does not trigger this requirement.

## 2. Task Implementation
- [ ] Update `.tools/verify_requirements.py` to parse the `severity_score` field from the risk matrix in `docs/plan/requirements/8_risks_mitigation.md`.
- [ ] Add a validation step to the `presubmit` check that identifies all risks with `severity_score >= 6`.
- [ ] For each such risk, ensure that:
    1. A mitigation design (linked via `mitigation_id` or `[MIT-NNN]` tag) is present in the document.
    2. At least one `covering_tests` entry is listed in the requirement block or the risk matrix.
- [ ] The check MUST fail (exit non-zero) if either is missing, effectively blocking the merge via `./do presubmit`.

## 3. Code Review
- [ ] Verify that the tool accurately extracts severity scores and links them to requirements.
- [ ] Ensure that the "Red phase is sufficient" clause is respected: the check only verifies that the test *exists* in the document, not that it *passes* (that's handled by Task 01).
- [ ] Verify that the error message clearly indicates which risk is blocking the merge.

## 4. Run Automated Tests to Verify
- [ ] Run `pytest .tools/tests/test_risk_gate.py` and ensure it passes.
- [ ] Manually create a high-severity risk without a test and verify that `./do presubmit` fails.

## 5. Update Documentation
- [ ] Update `docs/plan/summaries/8_risks_mitigation.md` to clarify the merge gating mechanism for high-severity risks.

## 6. Automated Verification
- [ ] Run the updated `.tools/verify_requirements.py` on the current state of `docs/plan/requirements/8_risks_mitigation.md` and verify that no existing high-severity risks are in violation.
