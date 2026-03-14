# Task: Audit Manual Scoring and Inherent Risk Rules (Sub-Epic: 09_Risk 011 Verification)

## Covered Requirements
- [RISK-BR-012], [RISK-BR-013]

## Dependencies
- depends_on: ["01_risk_matrix_schema_and_timestamp_validation.md"]
- shared_components: [none]

## 1. Initial Test Written
- [ ] Create a Python test `tests/test_risk_scoring_audit.py` that:
    - Scans `.tools/validate_risk_matrix.py` and other validation scripts for any logic that attempts to "automatically" set impact or probability based on test results.
    - Asserts that no such logic exists (negative requirement verification).
    - Asserts that the validation tool fails if a risk's `severity_score` is recalculated as anything other than `impact * probability`.

## 2. Task Implementation
- [ ] Conduct a manual audit of the Risk Matrix in `docs/plan/specs/8_risks_mitigation.md`.
- [ ] Verify that every entry's `impact` and `probability` reflects the "Inherent Risk" level (the level *before* any mitigation is applied).
- [ ] Ensure that for risks with implemented mitigations (status = `Mitigated`), the `impact` or `probability` values have NOT been lowered in the document compared to their initial "Open" values.
- [ ] Add a section to the `validate_risk_matrix.py` tool that flags any risk whose score is "automatically" downgraded when its status changes to `Mitigated` (i.e., by checking if its impact/probability has decreased in the same commit that changed the status).
- [ ] Verify that manual scoring by the project lead is the only way these values are updated.

## 3. Code Review
- [ ] Confirm that the validation tool correctly enforces `severity_score = impact * probability` while allowing only manual updates to the inputs.
- [ ] Verify that the audit report is comprehensive.

## 4. Run Automated Tests to Verify
- [ ] Run `pytest tests/test_risk_scoring_audit.py`.
- [ ] Run the `validate_risk_matrix.py` tool and ensure no current violations exist in the spec.

## 5. Update Documentation
- [ ] Create a brief `docs/audit/risk_scoring_inherent_compliance.md` report summarizing the audit results and confirming 100% compliance with [RISK-BR-012] and [RISK-BR-013].

## 6. Automated Verification
- [ ] Use `grep -i "impact" docs/plan/specs/8_risks_mitigation.md` and check for any notes indicating "lowered due to mitigation" (which would be a violation).
