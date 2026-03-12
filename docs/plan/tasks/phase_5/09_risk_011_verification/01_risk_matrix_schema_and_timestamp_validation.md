# Task: Risk Matrix Schema and Timestamp Validation (Sub-Epic: 09_Risk 011 Verification)

## Covered Requirements
- [RISK-BR-011]

## Dependencies
- depends_on: [none]
- shared_components: [./do Entrypoint Script]

## 1. Initial Test Written
- [ ] Create a Python test `tests/test_risk_timestamp_enforcement.py` that:
    - Defines a risk matrix where a risk has its `impact` or `probability` changed but its `last_reviewed_at` timestamp remains the same as in the previous version (mocking git history if necessary, or simply testing the validation logic with two versions of the file).
    - Asserts that the validation tool (e.g., `.tools/validate_risk_matrix.py`) fails with a clear message indicating the timestamp was not updated.
    - Asserts that a version with an updated timestamp passes.

## 2. Task Implementation
- [ ] Update `.tools/validate_risk_matrix.py` (created in sub-epic 05) to:
    - Enforce that the `last_reviewed_at` field is present for every risk entry and follows the ISO 8601 format (YYYY-MM-DD).
    - Implement a "change detection" check: if the script is run in a git hook or CI, it should compare the current `docs/plan/specs/8_risks_mitigation.md` against `HEAD`.
    - If any risk's `impact` or `probability` value has changed, but the `last_reviewed_at` date in the same row has not been updated to the current date, exit non-zero.
- [ ] Ensure `./do lint` correctly invokes this updated validation logic.

## 3. Code Review
- [ ] Verify that the ISO 8601 parsing is robust.
- [ ] Ensure the git diff logic only triggers when a change to the risk matrix table is actually detected.

## 4. Run Automated Tests to Verify
- [ ] Run `pytest tests/test_risk_timestamp_enforcement.py`.
- [ ] Run `./do lint` and ensure it correctly flags a mock "stale timestamp" edit.

## 5. Update Documentation
- [ ] Update the Risk Mitigation spec or internal dev docs to reflect that `last_reviewed_at` is now a gated requirement for any score change.

## 6. Automated Verification
- [ ] Run `.tools/verify_requirements.py` to ensure [RISK-BR-011] is now covered by this new validation logic.
