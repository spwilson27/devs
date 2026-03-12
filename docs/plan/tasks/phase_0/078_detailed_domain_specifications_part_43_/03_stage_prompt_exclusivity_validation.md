# Task: Stage Prompt Exclusivity Validation (Sub-Epic: 078_Detailed Domain Specifications (Part 43))

## Covered Requirements
- [2_TAS-REQ-469]

## Dependencies
- depends_on: [01_workflow_level_validation.md]
- shared_components: [devs-core]

## 1. Initial Test Written
- [ ] Create unit tests in `devs-core/src/validation.rs` (or `models/stage.rs`) that verify:
    - A `StageDefinition` with only `prompt` is valid.
    - A `StageDefinition` with only `prompt_file` is valid.
    - A `StageDefinition` with both `prompt` and `prompt_file` is rejected with `ValidationError::AmbiguousPrompt`.
    - A `StageDefinition` with neither `prompt` nor `prompt_file` is rejected with `ValidationError::MissingPrompt`.
- [ ] Add tests for both Rust builder API and Declarative Config parsing to ensure these rules are enforced in both pathways.

## 2. Task Implementation
- [ ] In `devs-core/src/error.rs`, add the following variants to `ValidationError`:
    - `AmbiguousPrompt(String)` (providing the stage name)
    - `MissingPrompt(String)` (providing the stage name)
- [ ] In `devs-core/src/models/stage.rs`, implement validation for the exclusivity of `prompt` and `prompt_file` in a `StageDefinition`.
- [ ] Ensure `WorkflowDefinition::validate()` correctly iterates through its stages and calls their individual `validate()` methods, collecting all resulting errors.

## 3. Code Review
- [ ] Verify that the error messages clearly identify which stage has the invalid prompt configuration.
- [ ] Ensure that this validation is performed synchronously before any stage execution begins.
- [ ] Confirm that the validation logic handles both `String` and `PathBuf` types for `prompt` and `prompt_file` as specified in [1_PRD-REQ-010].

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-core` focusing on stage-level validation.
- [ ] Run `./do test` and confirm traceability for [2_TAS-REQ-469].

## 5. Update Documentation
- [ ] Document the prompt exclusivity requirement in `StageDefinition` doc comments.

## 6. Automated Verification
- [ ] Run `./tools/verify_requirements.py` to confirm [2_TAS-REQ-469] is correctly mapped to tests.
