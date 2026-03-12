# Task: Template Resolution Acceptance Tests (Sub-Epic: 24_Risk 007 Verification)

## Covered Requirements
- [AC-RISK-007-01], [AC-RISK-007-02]

## Dependencies
- depends_on: [docs/plan/tasks/phase_5/23_risk_006_verification/02_template_resolver_single_pass.md, docs/plan/tasks/phase_5/23_risk_006_verification/03_template_resolver_scalar_restriction.md]
- shared_components: [devs-core]

## 1. Initial Test Written
- [ ] In `crates/devs-core/tests/risk_mitigation_ac_tests.rs`, add a unit test suite for template resolution security:
    - **Single-Pass Expansion (AC-RISK-007-01):**
        - Mock a context where `stage.A.stdout` is exactly `{{stage.B.stdout}}`.
        - Create a template `Prompt: {{stage.A.stdout}}`.
        - Verify that the resolved prompt is `Prompt: {{stage.B.stdout}}`.
        - Crucially, even if `stage.B.stdout` is present in the context, it MUST NOT be resolved.
    - **Scalar-Only Fields (AC-RISK-007-02):**
        - Mock a context where `stage.plan.output.obj` is a JSON object `{"foo": "bar"}`.
        - Create a template `Data: {{stage.plan.output.obj}}`.
        - Resolve the template and verify that it returns `Err(TemplateError::NonScalarField)`.
        - Repeat with a JSON array `[1, 2, 3]`.

## 2. Task Implementation
- [ ] Implement the formal AC tests in `crates/devs-core/tests/risk_mitigation_ac_tests.rs`.
- [ ] Ensure the tests use the public `TemplateResolver` and `ResolutionContext` interfaces to simulate an actual resolution pass during a workflow run.
- [ ] Tag the tests with appropriate traceability markers: `// Covers: AC-RISK-007-01`, `// Covers: AC-RISK-007-02`.

## 3. Code Review
- [ ] Verify that the AC tests are decoupled from internal `devs-core` implementation details.
- [ ] Ensure the error messages from `TemplateError::NonScalarField` are consistent with the requirement description.
- [ ] Confirm that the single-pass guarantee is verified for multiple variables in a single template string.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-core --test risk_mitigation_ac_tests`.
- [ ] Ensure all AC tests pass.

## 5. Update Documentation
- [ ] Update `8_risks_mitigation.md` verification records with the results of these AC tests.

## 6. Automated Verification
- [ ] Run `./do test` and verify that `devs-core` traceability confirms coverage for `AC-RISK-007-01` and `AC-RISK-007-02`.
