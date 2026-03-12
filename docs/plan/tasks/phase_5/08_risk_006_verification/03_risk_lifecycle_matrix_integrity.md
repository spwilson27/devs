# Task: 03_Risk Lifecycle & Matrix Integrity (Sub-Epic: 08_Risk 006 Verification)

## Covered Requirements
- [RISK-BR-007], [RISK-BR-010]

## Dependencies
- depends_on: [docs/plan/tasks/phase_5/08_risk_006_verification/02_high_severity_risk_merge_gating.md]
- shared_components: [Traceability & Verification Infrastructure]

## 1. Initial Test Written
- [ ] Create a Python test in `.tools/tests/test_risk_integrity.py` that verifies the risk matrix consistency rule.
- [ ] The test should verify that a `[MIT-NNN]` tag in the document MUST have a corresponding `[RISK-NNN]` row in the risk matrix.
- [ ] The test should verify that manual deletion of a risk (mocked by comparing two document versions) triggers a failure.
- [ ] The test should verify that any `Retired` risk MUST have an `ADR` link (e.g. `docs/adr/NNNN-risk-elimination.md`).

## 2. Task Implementation
- [ ] Implement a consistency checker in `.tools/verify_requirements.py` that parses both the risk matrix (§1) and the mitigation sections (§2-§4) of `docs/plan/requirements/8_risks_mitigation.md`.
- [ ] Flag any `[MIT-NNN]` that exists without a corresponding `[RISK-NNN]`.
- [ ] Implement a "deletion detector" that tracks a baseline list of risk IDs (e.g. in a `.gen_state.json` or by comparing against the last committed version).
- [ ] Validate that all `Retired` status risks have an associated `ADR` link in their requirement description or matrix row.
- [ ] Implement the "sprint review" check: verify that all `severity_score >= 6` risks have non-zero `covering_tests` in the `target/traceability.json` output.

## 3. Code Review
- [ ] Verify that the tool accurately identifies orphans (mitigations without risks or risks without mitigations).
- [ ] Ensure that the deletion detector correctly handles risk retirement (transitioning status) while preventing removal of the ID.
- [ ] Verify that ADR links are correctly formatted and point to existing files.

## 4. Run Automated Tests to Verify
- [ ] Run `pytest .tools/tests/test_risk_integrity.py` and ensure it passes.
- [ ] Manually simulate a matrix inconsistency and verify that `./do lint` (or `.tools/verify_requirements.py`) catches it.

## 5. Update Documentation
- [ ] Update `docs/plan/summaries/8_risks_mitigation.md` to document the new automated integrity checks.

## 6. Automated Verification
- [ ] Run the updated tool on `docs/plan/requirements/8_risks_mitigation.md` and verify that all current risks and mitigations are consistent.
