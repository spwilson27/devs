# Task: Template Resolution Failure Modes (Sub-Epic: 082_Detailed Domain Specifications (Part 47))

## Covered Requirements
- [2_TAS-REQ-488]

## Dependencies
- depends_on: []
- shared_components: [devs-core (consumer — TemplateResolver, TemplateError types)]

## 1. Initial Test Written
- [ ] In `crates/devs-core/tests/template_failure_modes.rs`, create the following tests:
- [ ] `test_invalid_stage_ref_not_in_depends_on`: Define a template `"{{stage.X.field}}"` where stage `X` is not in the transitive `depends_on` closure. Assert resolution returns `TemplateError::InvalidStageRef { stage: "X" }` and the stage transitions to `Failed`.
- [ ] `test_no_structured_output_from_exit_code_stage`: Define `"{{stage.X.output.field}}"` where stage X used `exit_code` completion. Assert `TemplateError::NoStructuredOutput { stage: "X" }`.
- [ ] `test_unknown_workflow_input`: Define `"{{workflow.input.Y}}"` where `Y` is not declared in the workflow definition. Assert `TemplateError::UnknownInput { name: "Y" }`.
- [ ] `test_missing_required_input_no_default`: Define `"{{workflow.input.Y}}"` where `Y` is declared but not provided at submission and has no default value. Assert `TemplateError::MissingRequiredInput { name: "Y" }`.
- [ ] `test_unknown_output_field`: Define `"{{stage.X.output.field}}"` where stage X produced structured output but `field` does not exist in it. Assert `TemplateError::UnknownOutputField { stage: "X", field: "field" }`.
- [ ] `test_valid_template_resolves_successfully`: Define a well-formed template with valid stage refs, inputs, and output fields. Assert resolution returns `Ok(resolved_string)`.

## 2. Task Implementation
- [ ] Define the `TemplateError` enum in `devs-core` (if not already present) with exactly these variants:
  - `InvalidStageRef { stage: String }`
  - `NoStructuredOutput { stage: String }`
  - `UnknownInput { name: String }`
  - `MissingRequiredInput { name: String }`
  - `UnknownOutputField { stage: String, field: String }`
- [ ] In the `TemplateResolver::resolve()` method, implement checks in this order:
  1. For `{{stage.X.*}}` patterns: verify `X` is in the transitive `depends_on` set → `InvalidStageRef` if not.
  2. For `{{stage.X.output.*}}`: verify stage X has structured output (not `exit_code` completion) → `NoStructuredOutput` if not.
  3. For `{{stage.X.output.field}}`: verify `field` exists in the output JSON → `UnknownOutputField` if not.
  4. For `{{workflow.input.Y}}`: verify `Y` is declared → `UnknownInput` if not.
  5. For `{{workflow.input.Y}}`: verify `Y` is provided or has a default → `MissingRequiredInput` if not.
- [ ] Each error should cause the stage to transition to `Failed` state at the call site.

## 3. Code Review
- [ ] Verify all 5 error variants are distinct and carry the correct context fields.
- [ ] Verify `TemplateError` implements `std::fmt::Display` and `std::error::Error`.
- [ ] Verify the resolver checks dependency closure transitively, not just direct `depends_on`.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-core template_failure_modes` and confirm all tests pass.

## 5. Update Documentation
- [ ] Add `// Covers: 2_TAS-REQ-488` annotation to each test function.

## 6. Automated Verification
- [ ] Run `cargo test -p devs-core template_failure_modes -- --nocapture 2>&1 | grep -E "test result:.*passed"` and verify 0 failures.
