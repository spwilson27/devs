# Task: Template Resolver Security: Scalar Type Enforcement (Sub-Epic: 23_Risk 006 Verification)

## Covered Requirements
- [RISK-007], [RISK-007-BR-002]

## Dependencies
- depends_on: ["phase_5/23_risk_006_verification/02_template_resolver_single_pass.md"]
- shared_components: [devs-core]

## 1. Initial Test Written
- [ ] In `crates/devs-core`, update `tests/template_resolver_test.rs` to include scalar validation cases:
    - Mock a `ResolutionContext` where `stage.plan.output.data` is a JSON object: `{"key": "value"}`.
    - Asserts that resolving `{{stage.plan.output.data}}` returns `Err(TemplateError::NonScalarField)`.
    - Mock a `ResolutionContext` where `stage.plan.output.list` is a JSON array: `[1, 2, 3]`.
    - Asserts that resolving `{{stage.plan.output.list}}` returns `Err(TemplateError::NonScalarField)`.
    - Verifies that strings, numbers, booleans, and null values resolve correctly without error.

## 2. Task Implementation
- [ ] Update `devs-core/src/template/resolver.rs`:
    - In the variable resolution logic, inspect the `serde_json::Value` returned from the context lookup for `stage.<name>.output.<field>` references.
    - Add a check: if `value.is_object()` or `value.is_array()`, return `TemplateError::NonScalarField` immediately (per [RISK-007-BR-002]).
    - Ensure this check is performed BEFORE the value is converted to a string for substitution.
    - Allow objects and arrays only if they are being accessed by a deeper path (e.g., `{{stage.plan.output.data.key}}`), in which case the leaf value will be a scalar.

## 3. Code Review
- [ ] Verify that the `NonScalarField` error provides helpful context (e.g., which field was non-scalar).
- [ ] Ensure that the check applies only to stage outputs, or evaluate if it should apply to workflow inputs as well for consistency.
- [ ] Confirm that `null` values are handled correctly (either as an empty string or the literal word "null", per project convention).

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-core`.
- [ ] Verify that the new scalar validation tests pass.

## 5. Update Documentation
- [ ] Update the `Workflow Authoring Guide` to explicitly state that only scalar fields from stage outputs can be used in templates, and objects/arrays must be accessed by specific field paths.

## 6. Automated Verification
- [ ] Run `./do test` and verify that `devs-core` traceability confirms coverage for `RISK-007-BR-002`.
