# Task: Template Resolution Failure Mode Handling (Sub-Epic: 082_Detailed Domain Specifications (Part 47))

## Covered Requirements
- [2_TAS-REQ-488]

## Dependencies
- depends_on: [none]
- shared_components: [devs-core]

## 1. Initial Test Written
- [ ] Create a unit test for `TemplateResolver` in `devs-core`.
- [ ] Define a workflow with two stages. Stage A uses `exit_code` completion (no structured output). Stage B has a prompt containing `{{stage.A.output.some_field}}`.
- [ ] Verify that `TemplateResolver::resolve` for Stage B fails with `TemplateError::NoStructuredOutput`.
- [ ] Test another scenario: `{{stage.A.output.some_field}}` where Stage A *has* structured output but the field `some_field` is missing. Verify it fails with `TemplateError::FieldNotFound`.
- [ ] Test referencing a non-existent stage. Verify it fails with `TemplateError::StageNotFound`.

## 2. Task Implementation
- [ ] In `devs-core`, update the `TemplateError` enum to include `NoStructuredOutput`, `FieldNotFound`, and `StageNotFound` variants.
- [ ] Update the `TemplateResolver` logic to:
    - [ ] Check if the referenced stage exists in the `WorkflowRun`.
    - [ ] Check if the referenced stage was configured with `structured_output` completion.
    - [ ] If not, return `TemplateError::NoStructuredOutput`.
    - [ ] If it was, attempt to parse the structured output as JSON and extract the field.
    - [ ] If the field is missing, return `TemplateError::FieldNotFound`.
- [ ] Integration: ensure the state machine uses these errors to fail a stage *before* spawning the agent if template resolution fails.

## 3. Code Review
- [ ] Verify that the error messages are clear and identify exactly which stage and field caused the failure.
- [ ] Ensure the template resolver handles all 7 priority levels (if applicable) but correctly enforces the "no structured output" rule regardless of priority.
- [ ] Check that the implementation doesn't accidentally succeed if Stage A failed but its output was still structured (i.e. partial results).

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-core` and ensure all template resolution failure tests pass.

## 5. Update Documentation
- [ ] Document the different template resolution error modes in the user-facing workflow authoring guide.

## 6. Automated Verification
- [ ] Run `./do verify_requirements.py` to ensure `[2_TAS-REQ-488]` is correctly mapped to the test.
