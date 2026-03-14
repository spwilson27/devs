# Task: Workflow Name Validation Rule (Sub-Epic: 078_Detailed Domain Specifications (Part 43))

## Covered Requirements
- [2_TAS-REQ-465]

## Dependencies
- depends_on: ["none"]
- shared_components: ["devs-core (consumer — uses BoundedString and error types)", "devs-config (consumer — WorkflowDefinition parsing)"]

## 1. Initial Test Written
- [ ] In `crates/devs-config/src/workflow_validation.rs` (or the module that handles `WorkflowDefinition` validation), write a test module `tests::workflow_name_validation` containing:
  - `test_valid_workflow_name_lowercase` — name `"my-workflow_1"` passes validation.
  - `test_valid_workflow_name_single_char` — name `"a"` passes validation.
  - `test_valid_workflow_name_max_128_bytes` — a 128-byte name of valid chars passes.
  - `test_invalid_name_uppercase` — name `"MyWorkflow"` returns `Err(ValidationError::InvalidName)`.
  - `test_invalid_name_spaces` — name `"my workflow"` returns `Err(ValidationError::InvalidName)`.
  - `test_invalid_name_special_chars` — name `"my.workflow!"` returns `Err(ValidationError::InvalidName)`.
  - `test_invalid_name_empty` — empty string `""` returns `Err(ValidationError::InvalidName)`.
  - `test_invalid_name_exceeds_128_bytes` — a 129-byte valid-charset name returns `Err(ValidationError::InvalidName)`.
  - `test_name_validation_runs_before_other_checks` — a workflow with an invalid name AND zero stages returns `InvalidName`, not `EmptyWorkflow`.
- [ ] Each test must include `// Covers: 2_TAS-REQ-465` annotation.

## 2. Task Implementation
- [ ] Define `ValidationError::InvalidName` variant in the validation error enum (if not already present).
- [ ] Implement a `validate_workflow_name(name: &str) -> Result<(), ValidationError>` function that:
  - Checks the name matches regex pattern `^[a-z0-9_-]+$` (use a simple char-by-char check or `once_cell` compiled regex).
  - Checks `name.len() <= 128`.
  - Returns `ValidationError::InvalidName` on failure.
- [ ] Ensure this validation is called **first** in the `WorkflowDefinition::validate()` method, before stage count or input checks.

## 3. Code Review
- [ ] Verify the regex/char check exactly matches `[a-z0-9_-]+` — no accidental inclusion of uppercase or other characters.
- [ ] Verify the byte length check uses `.len()` (byte length), not `.chars().count()` (char count).
- [ ] Verify `InvalidName` is returned before any other validation error variant.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-config -- workflow_name_validation` and confirm all tests pass.

## 5. Update Documentation
- [ ] Add doc comment to `validate_workflow_name` explaining the `[a-z0-9_-]+` pattern and 128-byte limit.

## 6. Automated Verification
- [ ] Run `cargo test -p devs-config -- workflow_name_validation --no-fail-fast 2>&1 | tail -20` and verify zero failures.
- [ ] Run `grep -r 'Covers: 2_TAS-REQ-465' crates/` and confirm at least one annotation exists.
