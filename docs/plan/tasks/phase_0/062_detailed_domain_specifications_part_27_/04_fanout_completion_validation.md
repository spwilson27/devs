# Task: Fan-out Completion Validation (Sub-Epic: 062_Detailed Domain Specifications (Part 27))

## Covered Requirements
- [2_TAS-REQ-276]

## Dependencies
- depends_on: []
- shared_components: [devs-core]

## 1. Initial Test Written
- [ ] Write a unit test for `WorkflowDefinition` validation in `devs-core` that attempts to parse a workflow with a fan-out stage that uses `completion = "mcp_tool_call"`.
- [ ] Assert that the validation fails with a descriptive error message indicating that `mcp_tool_call` is not supported with fan-out.
- [ ] Write positive unit tests for fan-out stages using `completion = "exit_code"` and `completion = "structured_output"`.
- [ ] Assert that these configurations pass validation.

## 2. Task Implementation
- [ ] In `devs-core`, update the `validate()` method for `StageDefinition` or the workflow-level validation logic.
- [ ] Add a check that triggers if both a fan-out (e.g., `fan_out` field or `is_fanout()` returning true) and `completion: mcp_tool_call` are present in the same stage.
- [ ] Return a `ValidationError` or `ConfigError` indicating the incompatibility.
- [ ] Ensure that this validation is performed during workflow submission and server startup for declarative definitions.
- [ ] For the Rust builder API, add a similar check in the `build()` or `stage()` method to enforce the same rule.

## 3. Code Review
- [ ] Verify that the error message clearly points to the problematic stage name and the incompatible fields.
- [ ] Ensure that the logic correctly identifies all forms of fan-out (declarative counts, input lists, etc.).
- [ ] Verify that there are no "silent" failures and the validation is strictly enforced.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-core` to verify the validation logic.

## 5. Update Documentation
- [ ] Update the workflow definition documentation to explicitly mention that `mcp_tool_call` is not supported for fan-out stages.

## 6. Automated Verification
- [ ] Run `./do test` and ensure all tests pass.
- [ ] Verify that `2_TAS-REQ-276` is correctly mapped in the test results.
