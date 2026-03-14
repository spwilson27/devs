# Task: Risk Lifecycle and Fallback ADR Audit (Sub-Epic: 07_Risk 001 Verification)

## Covered Requirements
- [RISK-BR-004], [RISK-BR-005]

## Dependencies
- depends_on: ["03_high_risk_coverage.md"]
- shared_components: [./do Entrypoint Script]

## 1. Initial Test Written
- [ ] Create a Python script `.tools/audit_risk_lifecycle.py` that:
    - Parses `docs/plan/specs/8_risks_mitigation.md` and `docs/plan/requirements/8_risks_mitigation.md`.
    - Identifies any risk with `status: Retired`.
    - Cross-references with `target/traceability.json` to verify that all covering tests for that `Retired` risk are passing.
    - Identifies any risk that has activated a fallback (has a `fallback_id` in the matrix).
    - Verifies that for each activated fallback, a corresponding ADR exists in `docs/adr/NNNN-fallback-<name>.md`.

## 2. Task Implementation
- [ ] Run the `.tools/audit_risk_lifecycle.py` script and identify all violations of `RISK-BR-004` and `RISK-BR-005`.
- [ ] For any `Retired` risk with failing tests, either fix the tests or revert the status to `Open` (or `Mitigated` if it was previously so).
- [ ] If any fallback was implemented during Phase 1-4 but lacks an ADR, create the ADR now in `docs/adr/` with the mandatory schema defined in §1.1 of `8_risks_mitigation.md`.
- [ ] Ensure that `target/traceability.json` correctly reflects the risk status changes.

## 3. Code Review
- [ ] Verify that every `Retired` risk has a documented justification for its retirement in the document.
- [ ] Verify that every fallback ADR follows the structured JSON format required by `[8_RISKS-REQ-024]`.

## 4. Run Automated Tests to Verify
- [ ] Run `python3 .tools/audit_risk_lifecycle.py` and ensure it passes with zero violations.
- [ ] Run `./do test` and ensure all tests pass.

## 5. Update Documentation
- [ ] Update the risk record for each `Retired` or `Activated` risk in `8_risks_mitigation.md` to ensure the `status` and `fallback_id` fields are correct.

## 6. Automated Verification
- [ ] Verify that `docs/adr/` contains at least one fallback ADR if any fallback was activated (e.g., `FB-001` or `FB-002` if applicable).
- [ ] Confirm that the final `target/traceability.json` `overall_passed` is true.
