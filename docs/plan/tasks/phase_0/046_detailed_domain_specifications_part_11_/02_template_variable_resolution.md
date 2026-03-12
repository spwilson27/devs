# Task: Template Variable Resolution Priority (Sub-Epic: 046_Detailed Domain Specifications (Part 11))

## Covered Requirements
- [2_TAS-REQ-103]

## Dependencies
- depends_on: [01_workflow_stage_state_machines.md]
- shared_components: [devs-core]

## 1. Initial Test Written
- [ ] Create unit tests in `devs-core/src/template.rs` (or equivalent) for `TemplateResolver` that:
    - Verify resolution of all 8 priority levels (workflow inputs, run fields, stage outputs, etc.).
    - Verify that expressions like `{{workflow.input.foo}}` are correctly interpolated.
    - Test resolution of multiple variables in a single string.
    - Verify `Err(TemplateError::UnknownVariable)` is returned for unknown variables.
    - Test edge cases like referencing a stage that is not a completed dependency.
    - Ensure `stdout` and `stderr` are truncated to 64 KiB as specified in [2_TAS-REQ-103].
    - Test fan-out variables (`{{fan_out.index}}`, `{{fan_out.item}}`) only in valid contexts.

## 2. Task Implementation
- [ ] Implement `TemplateResolver` struct and its `resolve` method in `devs-core`.
- [ ] Define `TemplateContext` to hold all relevant data for resolution.
- [ ] Implement the priority order exactly as specified in [2_TAS-REQ-103].
- [ ] Ensure the resolver returns `Err(TemplateError::UnknownVariable)` rather than an empty string on missing variables.
- [ ] Add logic for truncating `stdout` and `stderr` outputs used in templates to 64 KiB.
- [ ] Implement `TemplateError` with `UnknownVariable`, `InvalidReference`, and `UnauthorizedReference` variants as specified.

## 3. Code Review
- [ ] Ensure priority order strictly follows [2_TAS-REQ-103].
- [ ] Verify that no silent substitutions of empty strings occur.
- [ ] Check truncation logic for correct byte limits.
- [ ] Confirm `{{fan_out.*}}` variables are only resolvable within fan-out contexts.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-core` specifically for template resolution logic.

## 5. Update Documentation
- [ ] Document the available template variables and their resolution order in the project's technical architecture spec or `devs-core` documentation.

## 6. Automated Verification
- [ ] Run `./do verify` to ensure requirement traceability for [2_TAS-REQ-103] is maintained.
