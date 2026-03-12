# Task: Risk 007 Mitigation Verification (Sub-Epic: 24_Risk 007 Verification)

## Covered Requirements
- [MIT-007]

## Dependencies
- depends_on: [docs/plan/tasks/phase_5/24_risk_007_verification/01_template_output_truncation_implementation.md, docs/plan/tasks/phase_5/24_risk_007_verification/02_template_resolution_acceptance_tests.md]
- shared_components: [devs-core]

## 1. Initial Test Written
- [ ] In `crates/devs-core`, create a final verification test suite `tests/risk_007_final_audit.rs`:
    - Combine all `RISK-007` mitigations (single-pass, scalar-only, truncation) into a series of integration-level scenarios.
    - **Scenario 1: Truncated Injected Template.**
        - Mock a context where `stage.A.stdout` is exactly 10,242 bytes long, ending with `{{workflow.input.secret}}`.
        - Verify that when resolving `Prompt: {{stage.A.stdout}}`, the resulting string contains the literal `{{workflow.input.secret}}` and is correctly truncated at the 10,240-byte boundary.
    - **Scenario 2: Scalar boolean stringification (AC-RISK-007-04 verification - even though it's in 25, it's part of the audit).**
        - Mock a context where `stage.plan.output.bool` is JSON `true`.
        - Verify resolving `Flag: {{stage.plan.output.bool}}` results in `Flag: true`.

## 2. Task Implementation
- [ ] Conduct a final audit of `devs-core/src/template/resolver.rs` and `devs-core/src/template/context.rs`.
- [ ] Ensure that `MIT-007` is fully satisfied by checking:
    - Single-pass expansion algorithm correctness.
    - Scalar JSON type enforcement.
    - Output truncation to 10,240 bytes.
    - Template variable resolution priority.
- [ ] Confirm that no additional template injection vectors (like recursive evaluations in template libraries) exist.

## 3. Code Review
- [ ] Verify that all unit and integration tests tagged with `RISK-007` or `MIT-007` pass across all platforms.
- [ ] Ensure that the mitigation doesn't introduce performance regressions in the template resolver.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-core` and ensure 100% pass rate.
- [ ] Verify that coverage for the template resolver exceeds the 90% unit gate (QG-001).

## 5. Update Documentation
- [ ] Update `docs/plan/specs/8_risks_mitigation.md` to mark `MIT-007` as fully verified by the Phase 5 quality hardening tasks.

## 6. Automated Verification
- [ ] Run `./do test` and verify that all `devs-core` tests pass, specifically those tagged with `Covers: MIT-007`.
