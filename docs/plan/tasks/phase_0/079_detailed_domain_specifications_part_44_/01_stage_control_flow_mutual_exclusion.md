# Task: Stage Control Flow Mutual Exclusion Validation (Sub-Epic: 079_Detailed Domain Specifications (Part 44))

## Covered Requirements
- [2_TAS-REQ-470]

## Dependencies
- depends_on: ["none"]
- shared_components: ["devs-core (Consumer — add validation to domain types)"]

## 1. Initial Test Written
- [ ] In `crates/devs-core/src/stage.rs` (or the module containing `StageDefinition`), write a test module `tests::control_flow_mutual_exclusion` with the following tests:
  - `test_stage_with_both_fan_out_and_branch_rejected`: Construct a `StageDefinition` where both `fan_out` and `branch` fields are `Some(...)`. Call the validation method (e.g., `validate()`) and assert it returns an error containing a message indicating mutual exclusivity of `fan_out` and `branch`.
  - `test_stage_with_fan_out_only_accepted`: Set `fan_out = Some(valid_config)` and `branch = None`. Assert validation succeeds.
  - `test_stage_with_branch_only_accepted`: Set `fan_out = None` and `branch = Some(valid_branch)`. Assert validation succeeds.
  - `test_stage_with_neither_fan_out_nor_branch_accepted`: Both `None`. Assert validation succeeds.
- [ ] Add `// Covers: 2_TAS-REQ-470` annotation to each test.

## 2. Task Implementation
- [ ] In the `StageDefinition` struct (or equivalent), ensure `fan_out` and `branch` are both `Option<...>` fields.
- [ ] In the `StageDefinition::validate()` method, add a check: if both `fan_out.is_some()` and `branch.is_some()`, return an error variant (e.g., `CoreError::MutuallyExclusiveFields { field_a: "fan_out", field_b: "branch" }`).
- [ ] Ensure the error type implements `Display` with a clear message like `"StageDefinition must not have both 'fan_out' and 'branch' set"`.

## 3. Code Review
- [ ] Verify the validation is in the domain layer (`devs-core`), not in config parsing or gRPC layers.
- [ ] Verify error type is a structured enum variant, not a string.
- [ ] Verify no `unwrap()` or `panic!()` in validation path.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-core -- control_flow_mutual_exclusion` and confirm all tests pass.

## 5. Update Documentation
- [ ] Add doc comment to the validation method explaining the mutual exclusion invariant and referencing `2_TAS-REQ-470`.

## 6. Automated Verification
- [ ] Run `cargo test -p devs-core` and confirm zero failures.
- [ ] Run `grep -r "Covers: 2_TAS-REQ-470" crates/devs-core/` and confirm at least one match.
