# Task: Workflow Name and Stage Count Validation (Sub-Epic: 078_Detailed Domain Specifications (Part 43))

## Covered Requirements
- [2_TAS-REQ-465], [2_TAS-REQ-466]

## Dependencies
- depends_on: [none]
- shared_components: [devs-core, devs-config]

## 1. Initial Test Written
- [ ] Create unit tests in `devs-core/src/validation.rs` (or similar validation module) that verify:
    - A `WorkflowDefinition` name must match the regex `[a-z0-9_-]+`.
    - A `WorkflowDefinition` name must not exceed 128 bytes.
    - An empty `WorkflowDefinition` name is rejected.
    - A `WorkflowDefinition` with zero stages is rejected with `ValidationError::EmptyWorkflow`.
    - A `WorkflowDefinition` with more than 256 stages is rejected with `ValidationError::TooManyStages`.
    - A `WorkflowDefinition` with exactly 1 stage and a valid name (e.g., "my-workflow") passes.
    - A `WorkflowDefinition` with exactly 256 stages passes.
- [ ] Ensure tests use the collected error pattern (all errors reported together).

## 2. Task Implementation
- [ ] In `devs-core/src/error.rs`, add the following variants to `ValidationError`:
    - `InvalidName(String)`
    - `EmptyWorkflow`
    - `TooManyStages`
- [ ] In `devs-core/src/models/workflow.rs` (or where `WorkflowDefinition` is defined), implement a `validate` method that:
    - Checks `self.name` against the regex and length limit.
    - Checks `self.stages.len()` against the 1-256 range.
- [ ] If `devs-config` performs this validation during parsing, update its logic to call the `devs-core` validation and collect errors.

## 3. Code Review
- [ ] Verify that regex compilation is performed efficiently (e.g., using `once_cell` or `LazyLock`).
- [ ] Verify that `ValidationError` correctly implements the multi-error reporting protocol.
- [ ] Ensure byte-count (not char count) is checked for the name length.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-core` to verify the new validation logic.
- [ ] Run `./do test` to ensure no regressions and verify traceability.

## 5. Update Documentation
- [ ] Document the workflow name constraints and stage limits in the `WorkflowDefinition` doc comments.

## 6. Automated Verification
- [ ] Run `./tools/verify_requirements.py` to confirm [2_TAS-REQ-465] and [2_TAS-REQ-466] are mapped to the new tests.
