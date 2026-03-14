# Task: Prompt Mutually Exclusive Validation (Sub-Epic: 078_Detailed Domain Specifications (Part 43))

## Covered Requirements
- [2_TAS-REQ-469]

## Dependencies
- depends_on: ["01_workflow_name_validation.md"]
- shared_components: ["devs-config (consumer — StageDefinition validation)"]

## 1. Initial Test Written
- [ ] In the stage validation test module, add tests:
  - `test_stage_with_prompt_only_valid` — a `StageDefinition` with `prompt: Some("..."), prompt_file: None` passes.
  - `test_stage_with_prompt_file_only_valid` — `prompt: None, prompt_file: Some("path/to/file")` passes.
  - `test_stage_with_both_prompt_and_file_rejected` — both set returns `Err(ValidationError::PromptConflict)` (or similar variant name).
  - `test_stage_with_neither_prompt_nor_file_rejected` — neither set returns `Err(ValidationError::PromptConflict)`.
  - `test_prompt_validation_per_stage` — a workflow with 3 stages where only the second has both set; validation returns error referencing the offending stage name.
- [ ] Each test must include `// Covers: 2_TAS-REQ-469`.

## 2. Task Implementation
- [ ] Define `ValidationError::PromptConflict { stage_name: String }` variant (or equivalent).
- [ ] In `StageDefinition::validate()` (or the workflow-level stage validation loop), check:
  - `prompt.is_some() && prompt_file.is_some()` → error.
  - `prompt.is_none() && prompt_file.is_none()` → error.
- [ ] Ensure this check runs during `WorkflowDefinition::validate()` for every stage in the stages list.

## 3. Code Review
- [ ] Verify the check covers both illegal states: both-set AND neither-set.
- [ ] Verify the error includes the stage name for debuggability.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-config -- prompt_mutually_exclusive` and confirm all tests pass.

## 5. Update Documentation
- [ ] Add doc comment on the `PromptConflict` variant explaining the mutual exclusivity rule.

## 6. Automated Verification
- [ ] Run `cargo test -p devs-config -- prompt_mutually_exclusive --no-fail-fast 2>&1 | tail -20` and verify zero failures.
- [ ] Run `grep -r 'Covers: 2_TAS-REQ-469' crates/` and confirm annotations exist.
