# Task: Fan-Out Parameter Limits Validation (Sub-Epic: 079_Detailed Domain Specifications (Part 44))

## Covered Requirements
- [2_TAS-REQ-471]

## Dependencies
- depends_on: ["none"]
- shared_components: ["devs-core (Consumer — add validation to domain types)"]

## 1. Initial Test Written
- [ ] In `crates/devs-core/src/fan_out.rs` (or the module containing `FanOutConfig`), write a test module `tests::fan_out_parameter_limits` with the following tests:
  - `test_fan_out_both_count_and_input_list_rejected`: Set both `count = Some(2)` and `input_list = Some(vec![...])`. Assert validation returns an error indicating exactly one must be set.
  - `test_fan_out_neither_count_nor_input_list_rejected`: Set both to `None`. Assert validation returns an error.
  - `test_fan_out_count_zero_rejected`: Set `count = Some(0)`. Assert validation error for out-of-range.
  - `test_fan_out_count_65_rejected`: Set `count = Some(65)`. Assert validation error for out-of-range.
  - `test_fan_out_count_1_accepted`: Set `count = Some(1)`, `input_list = None`. Assert validation succeeds.
  - `test_fan_out_count_64_accepted`: Set `count = Some(64)`, `input_list = None`. Assert validation succeeds.
  - `test_fan_out_input_list_empty_rejected`: Set `input_list = Some(vec![])`. Assert validation error for zero-length.
  - `test_fan_out_input_list_65_elements_rejected`: Set `input_list = Some(vec![...; 65])`. Assert validation error.
  - `test_fan_out_input_list_1_element_accepted`: Set `input_list = Some(vec![one_item])`, `count = None`. Assert validation succeeds.
  - `test_fan_out_input_list_64_elements_accepted`: Set `input_list = Some(vec![...; 64])`, `count = None`. Assert validation succeeds.
- [ ] Add `// Covers: 2_TAS-REQ-471` annotation to each test.

## 2. Task Implementation
- [ ] Define `FanOutConfig` with `count: Option<u32>` and `input_list: Option<Vec<FanOutInput>>` fields.
- [ ] Implement `FanOutConfig::validate()`:
  - If both `count` and `input_list` are `Some`, return error `ExactlyOneRequired { field_a: "count", field_b: "input_list" }`.
  - If both are `None`, return the same error.
  - If `count` is `Some(n)` and `n < 1 || n > 64`, return error `OutOfRange { field: "count", min: 1, max: 64, actual: n }`.
  - If `input_list` is `Some(list)` and `list.is_empty()`, return error `EmptyCollection { field: "input_list" }`.
  - If `input_list` is `Some(list)` and `list.len() > 64`, return error `OutOfRange { field: "input_list.len()", min: 1, max: 64, actual: list.len() }`.

## 3. Code Review
- [ ] Verify all boundary values (0, 1, 64, 65) are tested.
- [ ] Verify error variants are descriptive and include the actual value.
- [ ] Verify the 64-element limit is defined as a named constant (e.g., `const MAX_FAN_OUT: usize = 64`).

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-core -- fan_out_parameter_limits` and confirm all tests pass.

## 5. Update Documentation
- [ ] Add doc comments to `FanOutConfig` and its `validate()` method documenting the exactly-one-of constraint and the 1–64 range, referencing `2_TAS-REQ-471`.

## 6. Automated Verification
- [ ] Run `cargo test -p devs-core` and confirm zero failures.
- [ ] Run `grep -r "Covers: 2_TAS-REQ-471" crates/devs-core/` and confirm at least one match.
