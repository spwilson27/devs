# Task: Workflow Input Validation Logic (Sub-Epic: 012_Foundational Technical Requirements (Part 3))

## Covered Requirements
- [2_PRD-BR-009]

## Dependencies
- depends_on: [none]
- shared_components: [devs-core]

## 1. Initial Test Written
- [ ] Create a unit test in `devs-core` to verify that `WorkflowDefinition` correctly validates input parameters against their declared types (e.g., strings, paths, integers).
- [ ] Create a test case where a submission with a missing required parameter is rejected with a structured error.
- [ ] Create a test case where a submission with an invalid parameter value (e.g., an alphabetic string passed where an integer is expected) is rejected.
- [ ] Create a test case that ensures all validation errors are collected and reported in a single structured response (multi-error reporting).

## 2. Task Implementation
- [ ] Implement the `InputDefinition` and `InputKind` enums in `devs-core`.
- [ ] Implement a `validate_inputs(definition, provided_inputs)` function in `devs-core`.
- [ ] Ensure the validation function returns a `Result<(), Vec<ValidationError>>` (or similar) to support multi-error reporting.
- [ ] Add type coercion logic to convert input string values to the corresponding `InputKind` (e.g., parsing a string as an integer).
- [ ] Ensure that this validation logic is used in the `devs-mcp`'s `submit_run` implementation (or the core method it calls).

## 3. Code Review
- [ ] Verify that the validation logic is exhaustive and handles all `InputKind` variants.
- [ ] Check that the error messages are human-readable and identify the offending parameter field.
- [ ] Ensure that no side effects (like creating a run) occur if validation fails.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-core` and ensure all tests pass.
- [ ] Run `./do test` and ensure the traceability report includes coverage for `[2_PRD-BR-009]`.

## 5. Update Documentation
- [ ] Update the `WorkflowDefinition` schema documentation to describe the supported input types and validation rules.
- [ ] Update agent memory to reflect the availability of the input validation logic.

## 6. Automated Verification
- [ ] Run `./do test` and ensure the traceability report includes coverage for `[2_PRD-BR-009]`.
