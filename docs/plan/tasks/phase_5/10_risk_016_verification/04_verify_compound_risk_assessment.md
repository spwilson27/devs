# Task: Verify Compound Risk Assessment (Sub-Epic: 10_Risk 016 Verification)

## Covered Requirements
- [RISK-BR-017], [8_RISKS-REQ-077]

## Dependencies
- depends_on: ["03_enforce_monitoring_and_interdependencies.md"]
- shared_components: [Traceability & Verification Infrastructure]

## 1. Initial Test Written
- [ ] Create a new Python test case in `.tools/tests/test_risk_matrix_validation.py` for compound assessment verification.
- [ ] Mock a Fallback Activation Record (FAR) in `docs/adr/` referencing a primary risk.
- [ ] Assert that the validator returns an error if the FAR does NOT contain a section for compound activation assessment (searching for keyword "Compound Activation" or cross-referencing against the interdependency matrix).
- [ ] Write a test with a valid FAR containing the assessment and assert it passes.

## 2. Task Implementation
- [ ] Implement `validate_compound_assessments(risks, interdependencies)`:
    - Search `docs/adr/*.md` for any file matching the FAR template (`[8_RISKS-REQ-024]`).
    - Extract the `risk_id` from the FAR JSON header.
    - Look up this `risk_id` in the interdependency matrix (§1.6) for any risks it "Depends On / Amplified By".
    - If found, verify that the FAR document contains a section titled "Compound Activation Assessment" or similar, listing the assessment for those risks.
- [ ] Integrate this into the risk validation pipeline.

## 3. Code Review
- [ ] Confirm that `RISK-BR-017` is fully implemented: all dependent risks MUST be assessed when a primary risk triggers.
- [ ] Verify that the ADR scanning logic is efficient (e.g. only parsing files matching the FAR pattern).
- [ ] Ensure clear error messages if the assessment is missing.

## 4. Run Automated Tests to Verify
- [ ] Run `pytest .tools/tests/test_risk_matrix_validation.py`.
- [ ] Create a dummy FAR in a test directory and ensure it passes or fails correctly based on its content.

## 5. Update Documentation
- [ ] No documentation update required.

## 6. Automated Verification
- [ ] Run the validator on a dummy branch with an intentionally incomplete FAR and verify it exits non-zero.
- [ ] Fix the FAR and verify it exits zero.
