# Task: Input Count Limits Validation (Sub-Epic: 078_Detailed Domain Specifications (Part 43))

## Covered Requirements
- [2_TAS-REQ-467]

## Dependencies
- depends_on: ["01_workflow_name_validation.md"]
- shared_components: ["devs-config (consumer — WorkflowDefinition validation)"]

## 1. Initial Test Written
- [ ] In the workflow validation test module, add tests:
  - `test_zero_inputs_valid` — a workflow with no inputs passes validation.
  - `test_64_inputs_valid` — a workflow with exactly 64 inputs passes.
  - `test_65_inputs_rejected` — a workflow with 65 inputs returns `Err(ValidationError::TooManyInputs)`.
  - `test_input_count_checked_after_name` — a workflow with invalid name AND 65 inputs returns `InvalidName`, not `TooManyInputs`.
- [ ] Each test must include `// Covers: 2_TAS-REQ-467`.

## 2. Task Implementation
- [ ] Define `ValidationError::TooManyInputs` variant.
- [ ] In `WorkflowDefinition::validate()`, after name and stage count checks, add:
  - If `self.inputs.len() > 64` → return `Err(ValidationError::TooManyInputs)`.

## 3. Code Review
- [ ] Verify boundary is `> 64` (64 is allowed, 65 is not).
- [ ] Verify ordering: name → stage count → input count.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-config -- input_count` and confirm all tests pass.

## 5. Update Documentation
- [ ] Add doc comment on `TooManyInputs` variant explaining the 64-input limit.

## 6. Automated Verification
- [ ] Run `cargo test -p devs-config -- input_count --no-fail-fast 2>&1 | tail -20` and verify zero failures.
- [ ] Run `grep -r 'Covers: 2_TAS-REQ-467' crates/` and confirm annotations exist.
