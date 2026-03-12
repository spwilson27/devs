# Task: Enforce Monitoring & Interdependencies (Sub-Epic: 10_Risk 016 Verification)

## Covered Requirements
- [RISK-BR-016], [8_RISKS-REQ-065], [RISK-BR-018], [8_RISKS-REQ-078], [AC-RISK-MATRIX-006], [8_RISKS-REQ-086], [AC-RISK-MATRIX-010], [8_RISKS-REQ-090], [8_RISKS-REQ-063], [8_RISKS-REQ-064], [RISK-BR-014], [RISK-BR-015], [8_RISKS-REQ-063]

## Dependencies
- depends_on: [02_implement_risk_coverage_validation.md]
- shared_components: [Traceability & Verification Infrastructure, ./do Entrypoint Script]

## 1. Initial Test Written
- [ ] Create a new Python test case in `.tools/tests/test_risk_matrix_validation.py` for interdependency and monitoring verification.
- [ ] Mock an interdependency matrix in `8_risks_mitigation.md` referencing non-existent Risk IDs and assert that the validator detects these orphans.
- [ ] Mock a Risk Matrix referencing non-existent Fallback IDs (`FB-NNN`) and assert failure.
- [ ] Mock a `risk_count_by_category` table and assert failure if it doesn't match the actual risk counts.
- [ ] Write a test that simulates a monitoring mechanism failure (e.g. failing a test tagged `// Covers: RISK-001`) and assert that `./do presubmit` returns a non-zero exit code.

## 2. Task Implementation
- [ ] Implement `validate_interdependencies(risks, content)`:
    - Locate and parse the "## 1.6 Risk Interdependency Matrix" table.
    - Verify all referenced `Primary Risk` IDs exist in the Risk Assessment Matrix.
    - Verify all IDs in `Depends On / Amplified By` exist in the Risk Assessment Matrix.
- [ ] Implement `validate_fallbacks(risks, content)`:
    - Verify all referenced `Fallback ID`s in the Risk Matrix exist in the (§5) fallback definitions section (regex search for `[FB-NNN]`).
- [ ] Implement `validate_category_summary(risks, content)`:
    - Recompute risk counts by category and compare against the summary table in "## 1.3 Risk Category Definitions".
- [ ] Update `./do test` to exit non-zero if `risk_matrix_violations` is non-empty in `target/traceability.json`.
- [ ] Verify that `RISK-BR-016` is enforced: any monitoring failure in CI (including the newly added risk matrix checks) MUST result in a non-zero exit code.

## 3. Code Review
- [ ] Confirm that `RISK-BR-018` is followed: any newly discovered interdependencies must be documented in §1.6 before merge. The tool must block merge if there are orphaned IDs.
- [ ] Ensure the category summary check is precise (counts per category and severity buckets).
- [ ] Verify that the `presubmit` script correctly aggregates all failures.

## 4. Run Automated Tests to Verify
- [ ] Run `pytest .tools/tests/test_risk_matrix_validation.py`.
- [ ] Run `./do presubmit` and ensure it passes only when all risk and requirement checks are green.

## 5. Update Documentation
- [ ] No documentation update required beyond existing README.

## 6. Automated Verification
- [ ] Run `grep -r "RISK-" docs/plan/specs/8_risks_mitigation.md` and manually verify that all IDs in the interdependency matrix match the primary risk list.
- [ ] Verify that the `risk_count_by_category` summary in §1.3 of `8_risks_mitigation.md` is accurate and the tool accepts it.
