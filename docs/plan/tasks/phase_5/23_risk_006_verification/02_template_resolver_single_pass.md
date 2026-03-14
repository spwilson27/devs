# Task: Template Resolver Security: Single-Pass Enforcement (Sub-Epic: 23_Risk 006 Verification)

## Covered Requirements
- [RISK-007], [RISK-007-BR-001]

## Dependencies
- depends_on: ["phase_1/03_template_resolution_context/02_strict_resolution_engine.md"]
- shared_components: [devs-core]

## 1. Initial Test Written
- [ ] In `crates/devs-core`, create or update a unit test suite `tests/template_injection_test.rs` that:
    - Defines a template string: `Hello {{user_input}}`.
    - Sets the value of `user_input` to a string containing another template expression: `{{system_secret}}`.
    - Asserts that `TemplateResolver::resolve()` returns `Hello {{system_secret}}` literally, NOT the value of `system_secret`.
    - Verifies that the scanning position correctly advances past the substituted value and never re-scans it (per [RISK-007-BR-001]).

## 2. Task Implementation
- [ ] Update `devs-core/src/template/resolver.rs`:
    - Refactor the `resolve()` method to implement a single-pass expansion algorithm.
    - Instead of recursive expansion, use a loop that:
        1. Finds the next `{{` from the current cursor position.
        2. Resolves the variable.
        3. Appends the resolved value to the result buffer.
        4. Advances the cursor position to exactly `end + 2` of the original `{{...}}` expression.
    - If using a template library (like `Handlebars`), ensure it is configured with recursive expansion DISABLED (no nested evaluations).
    - If `Handlebars` does not support this natively, implement a pre-processing or post-processing step to escape substituted values or use a manual resolver.

## 3. Code Review
- [ ] Verify that the single-pass logic is robust against variations in whitespace within `{{ ... }}`.
- [ ] Ensure that the resolution performance remains acceptable for large prompts.
- [ ] Confirm that no partial substitution occurs if a variable resolution fails (the stage should fail before applying any changes).

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-core --test template_injection_test`.
- [ ] Run `cargo test -p devs-core` to ensure no regressions in standard template resolution.

## 5. Update Documentation
- [ ] Add a section to the `8_risks_mitigation.md` verification report (or equivalent developer documentation) confirming that Risk 007 (Template Injection) is mitigated by the single-pass resolution pass.

## 6. Automated Verification
- [ ] Run `./do test` and verify that all `devs-core` tests pass, specifically those tagged with `Covers: RISK-007-BR-001`.
