# Task: Workflow Validation Check Order and Error Collection (Sub-Epic: 031_Foundational Technical Requirements (Part 22))

## Covered Requirements
- [2_TAS-REQ-030A]

## Dependencies
- depends_on: ["none"]
- shared_components: ["devs-core (consumer — uses BoundedString, domain error types)"]

## 1. Initial Test Written
- [ ] Create a test module `tests/workflow_validation.rs` (or in the appropriate crate's unit test module) with the following test cases:
  1. **`test_validation_collects_all_errors`**: Construct a workflow definition with 5 simultaneous errors (duplicate stage name, a cycle, an unknown pool, two unknown dependencies). Call `validate()` and assert the returned `Vec<ValidationError>` contains exactly 5 errors — none are suppressed or short-circuited.
  2. **`test_validation_schema_check_missing_required_fields`**: Workflow with a stage missing both `prompt` and `prompt_file`. Assert `ValidationError` includes a schema error about the missing prompt.
  3. **`test_validation_stage_name_uniqueness`**: Two stages with name `"build"`. Assert error message contains `"duplicate stage name: build"`.
  4. **`test_validation_dependency_existence`**: Stage `"deploy"` has `depends_on: ["nonexistent"]`. Assert error: `"unknown dependency: nonexistent in stage deploy"`.
  5. **`test_validation_cycle_detection_kahns`**: Stages A→B→C→A. Assert error includes the full cycle path `["A", "B", "C", "A"]`.
  6. **`test_validation_unknown_pool`**: Stage references pool `"ghost"` which is not defined. Assert error about unknown pool.
  7. **`test_validation_unknown_handler`**: Stage branch references handler `"missing_fn"`. Assert error about unknown handler.
  8. **`test_validation_input_type_coercion`**: Workflow input declared as integer but default value is `"not_a_number"`. Assert validation error.
  9. **`test_validation_prompt_mutual_exclusivity`**: Stage has both `prompt` and `prompt_file` set. Assert error about mutual exclusivity.
  10. **`test_validation_fanout_branch_exclusivity`**: Stage has both `fan_out` and `branch` set. Assert error about mutual exclusivity.
  11. **`test_validation_fanout_completion_compatibility`**: Fan-out stage with `completion = McpToolCall`. Assert error per [2_TAS-REQ-276].
  12. **`test_validation_stage_timeout_exceeds_workflow`**: Stage timeout 600s, workflow timeout 300s. Assert error: `"stage.timeout_secs (600) exceeds workflow.timeout_secs (300)"`.
  13. **`test_validation_empty_workflow`**: Workflow with zero stages. Assert rejection.
  14. **`test_validation_valid_workflow_passes`**: A well-formed workflow with 3 stages, valid dependencies, valid pool. Assert `validate()` returns `Ok(())` / empty error vec.
  15. **`test_validation_check_order`**: Construct a workflow that triggers errors at checks 2, 4, and 8. Verify all three errors are present in the result (confirming all checks run regardless of earlier failures).

## 2. Task Implementation
- [ ] Implement a `validate_workflow(def: &WorkflowDefinition, pools: &[PoolConfig], handlers: &[String]) -> Result<(), Vec<ValidationError>>` function that runs exactly these checks in order, collecting all errors into a `Vec<ValidationError>`:
  1. Schema validation (required fields, field length bounds).
  2. Stage name uniqueness — O(n) pass with a `HashSet`.
  3. Dependency existence — for each `depends_on` entry, verify the referenced stage exists.
  4. Cycle detection via Kahn's algorithm — on detection, include full cycle path in error.
  5. Pool existence — each stage's pool must exist in the provided pool configs.
  6. Handler existence — each branch handler must be in the provided handler list.
  7. Input type coercion — declared input types must be compatible with defaults.
  8. Prompt mutual exclusivity — exactly one of `prompt` / `prompt_file` per stage.
  9. Fan-out / branch mutual exclusivity.
  10. Fan-out completion compatibility — fan-out stages cannot use `McpToolCall`.
  11. Stage timeout ≤ workflow timeout.
  12. Empty workflow check (zero stages).
- [ ] Return `Ok(())` if the error vec is empty, `Err(errors)` otherwise.
- [ ] Add `// Covers: 2_TAS-REQ-030A` to the test functions.

## 3. Code Review
- [ ] Verify validation never short-circuits: all 12 checks always run regardless of earlier failures.
- [ ] Verify Kahn's algorithm implementation returns the full cycle path (not just a boolean).
- [ ] Verify `ValidationError` enum has descriptive variants with structured fields (not just strings).
- [ ] Verify O(n) complexity for stage uniqueness check (HashSet, not nested loops).

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test workflow_validation` and confirm all 15 tests pass.
- [ ] Run `cargo clippy --all-targets` and confirm no warnings.

## 5. Update Documentation
- [ ] Add doc comments to `validate_workflow` listing all 12 checks in order with references to [2_TAS-REQ-030A].

## 6. Automated Verification
- [ ] Run `./do test` and confirm all new tests pass.
- [ ] Grep test source for `// Covers: 2_TAS-REQ-030A` and confirm annotation exists.
