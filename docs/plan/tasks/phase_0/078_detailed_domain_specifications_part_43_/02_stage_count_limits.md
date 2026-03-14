# Task: Stage Count Limits Validation (Sub-Epic: 078_Detailed Domain Specifications (Part 43))

## Covered Requirements
- [2_TAS-REQ-466]

## Dependencies
- depends_on: ["01_workflow_name_validation.md"]
- shared_components: ["devs-core (consumer)", "devs-config (consumer — WorkflowDefinition validation)"]

## 1. Initial Test Written
- [ ] In the workflow validation test module, add tests:
  - `test_empty_workflow_rejected` — a `WorkflowDefinition` with zero stages returns `Err(ValidationError::EmptyWorkflow)`.
  - `test_single_stage_valid` — a workflow with 1 stage passes stage count validation.
  - `test_256_stages_valid` — a workflow with exactly 256 stages passes.
  - `test_257_stages_rejected` — a workflow with 257 stages returns `Err(ValidationError::TooManyStages)`.
  - `test_empty_workflow_with_valid_name` — confirms `EmptyWorkflow` is returned (not `InvalidName`) when name is valid but stages are empty.
- [ ] Each test must include `// Covers: 2_TAS-REQ-466`.

## 2. Task Implementation
- [ ] Define `ValidationError::EmptyWorkflow` and `ValidationError::TooManyStages` variants.
- [ ] In `WorkflowDefinition::validate()`, after name validation, add:
  - If `self.stages.is_empty()` → return `Err(ValidationError::EmptyWorkflow)`.
  - If `self.stages.len() > 256` → return `Err(ValidationError::TooManyStages)`.

## 3. Code Review
- [ ] Verify the boundary is `> 256` (not `>= 256`), so 256 is the inclusive maximum.
- [ ] Verify stage count check runs after name validation but before other checks.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-config -- stage_count` and confirm all tests pass.

## 5. Update Documentation
- [ ] Add doc comments on the `EmptyWorkflow` and `TooManyStages` variants explaining the limits.

## 6. Automated Verification
- [ ] Run `cargo test -p devs-config -- stage_count --no-fail-fast 2>&1 | tail -20` and verify zero failures.
- [ ] Run `grep -r 'Covers: 2_TAS-REQ-466' crates/` and confirm annotations exist.
