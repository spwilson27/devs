# Task: Monitoring Readiness Gate (Sub-Epic: 09_Risk 011 Verification)

## Covered Requirements
- [RISK-BR-014]

## Dependencies
- depends_on: [01_risk_matrix_schema_and_timestamp_validation.md]
- shared_components: [./do Entrypoint Script]

## 1. Initial Test Written
- [ ] Create a Python test `tests/test_monitoring_readiness.py` that:
    - Defines a risk in the risk matrix with a "Monitoring Mechanism" (e.g., `Unit test AC-RISK-001-01`).
    - Verifies that the validation script (e.g., `.tools/validate_monitoring.py`) fails if the test file/identifier cannot be found in the codebase.
    - Verifies that "Manual observation" only passes for `Market` category risks.
    - Verifies that components with unresolved monitoring requirements are correctly flagged.

## 2. Task Implementation
- [ ] Create or update a verification script `.tools/validate_monitoring.py` to:
    - Parse the "Active Monitoring Requirements" table in `docs/plan/specs/8_risks_mitigation.md` (§1.5).
    - For each `Risk ID` with `Score >= 6`:
        - Extract the `Monitoring Mechanism` string.
        - If the mechanism is a test ID (e.g., `AC-RISK-NNN-NN`), search for that ID in the codebase (using `grep` logic).
        - If the mechanism is a CI job, verify it exists in `.gitlab-ci.yml`.
        - If the mechanism is "Manual observation", verify the risk category is `Market`.
        - If any mechanism is missing, exit non-zero.
- [ ] Add a "Component Readiness" check: verify that any component referenced in the risk's `summary` or `impact` (or a known mapping) has its monitoring in place before it is merged (e.g., by checking if it's already in `main`).
- [ ] Update `./do lint` to include this monitoring check.

## 3. Code Review
- [ ] Ensure the regex for extracting monitoring mechanisms is accurate.
- [ ] Verify that the codebase search for test IDs correctly identifies the `// Covers: RISK-NNN` or `[REQ-ID]` annotations.

## 4. Run Automated Tests to Verify
- [ ] Run `pytest tests/test_monitoring_readiness.py`.
- [ ] Run `./do lint` and ensure all current risk-monitoring mechanisms exist.

## 5. Update Documentation
- [ ] Update the Risk Mitigation spec or internal dev docs to reflect that monitoring implementation is a hard gate for component readiness.

## 6. Automated Verification
- [ ] Run the validation script and ensure it outputs a list of "Verified Monitoring Mechanisms" for all high-severity risks.
