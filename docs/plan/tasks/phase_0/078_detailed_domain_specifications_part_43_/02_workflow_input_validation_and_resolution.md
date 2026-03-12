# Task: Workflow Input Validation and Optional Resolution (Sub-Epic: 078_Detailed Domain Specifications (Part 43))

## Covered Requirements
- [2_TAS-REQ-467], [2_TAS-REQ-468]

## Dependencies
- depends_on: [01_workflow_level_validation.md]
- shared_components: [devs-core]

## 1. Initial Test Written
- [ ] Create unit tests in `devs-core` for `WorkflowInput` and `TemplateResolver` that verify:
    - A workflow with exactly 64 inputs passes.
    - A workflow with 65 inputs is rejected with `ValidationError::TooManyInputs`.
    - A `WorkflowInput` with `required: false` and no `default` resolves to `null` (or `None` in Rust) if not provided.
    - An optional input with a `default` value resolves to that default value if not provided.
- [ ] Add tests for `TemplateResolver` ensuring it handles `null` values for optional inputs correctly in templates (e.g., throwing a `TemplateError::UnresolvedVariable` if it's missing but required, or providing `null` if optional and missing).
    - Wait, [2_TAS-REQ-075] says "A missing variable (no match in any resolution order) causes immediate StageStatus::Failed... It MUST NOT silently resolve to an empty string."
    - [2_TAS-REQ-468] specifies: "The resolved value at runtime is null for optional inputs not provided at submission time." This implies `null` is a valid *resolved* value.

## 2. Task Implementation
- [ ] In `devs-core/src/error.rs`, add the following variant to `ValidationError`:
    - `TooManyInputs`
- [ ] In `devs-core/src/models/workflow.rs`, implement validation for the number of inputs in a `WorkflowDefinition`.
- [ ] In `devs-core/src/models/input.rs` (or where `WorkflowInput` is defined), ensure the struct handles the `required: false` and `default` fields correctly.
- [ ] In `devs-core/src/templates/resolver.rs` (or where `TemplateResolver` is defined):
    - Ensure it distinguishes between a missing variable (error) and an optional input that was not provided (resolves to `null`).
- [ ] Ensure that `null` values are correctly handled by the template engine (e.g., using `Handlebars`' behavior).

## 3. Code Review
- [ ] Verify that `WorkflowInput` deserialization correctly handles missing `required` (defaulting to `true` or specified behavior) and `default`.
- [ ] Verify that the 64-input limit is applied correctly during `WorkflowDefinition::validate()`.
- [ ] Ensure that `TemplateResolver` correctly implements the 7-priority level resolution as specified in [2_TAS-REQ-073].

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-core` and focus on input validation and template resolution tests.
- [ ] Run `./do test` to verify overall correctness and traceability.

## 5. Update Documentation
- [ ] Update doc comments for `WorkflowInput` explaining optional resolution and the 64-input limit.

## 6. Automated Verification
- [ ] Run `./tools/verify_requirements.py` to confirm [2_TAS-REQ-467] and [2_TAS-REQ-468] are mapped to tests.
