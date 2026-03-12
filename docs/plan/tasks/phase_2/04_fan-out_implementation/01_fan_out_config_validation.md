# Task: Fan-Out Configuration and Validation (Sub-Epic: 04_Fan-Out Implementation)

## Covered Requirements
- [1_PRD-REQ-024], [1_PRD-REQ-025]

## Dependencies
- depends_on: [none]
- shared_components: [devs-config, devs-core]

## 1. Initial Test Written
- [ ] Create a unit test in `devs-config` that attempts to parse a workflow with a `fan_out` stage.
- [ ] Test that `fan_out.count` and `fan_out.input_list` are mutually exclusive [3_PRD-BR-030].
- [ ] Test that `fan_out` with `count = 0` or an empty `input_list` is rejected with a structured validation error [3_PRD-BR-031].
- [ ] Test that a stage with a valid `fan_out` configuration parses correctly into the internal `WorkflowDefinition` model.

## 2. Task Implementation
- [ ] Update `devs-core` domain types to include `FanOutConfig` and `FanOutMode` (Count vs. InputList) enums.
- [ ] Update `StageDefinition` in `devs-config` to include an optional `fan_out` field.
- [ ] Implement the `Validate` trait for `FanOutConfig` to enforce mutual exclusivity and non-zero items.
- [ ] Update the TOML/YAML deserialization logic in `devs-config` to handle the new `fan_out` block.

## 3. Code Review
- [ ] Verify that validation errors use the standard `devs` structured error format.
- [ ] Ensure that the `fan_out` config is properly namespaced within the stage definition.
- [ ] Check that no breaking changes were introduced to stages without fan-out.

## 4. Run Automated Tests to Verify
- [ ] Execute `cargo test -p devs-config` and ensure all validation tests pass.

## 5. Update Documentation
- [ ] Update `devs-config` README or doc comments to describe the new `fan_out` configuration schema.

## 6. Automated Verification
- [ ] Run `./do test` to ensure no regressions in the configuration parsing suite.
