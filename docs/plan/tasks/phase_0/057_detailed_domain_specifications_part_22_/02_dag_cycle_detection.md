# Task: DAG Cycle Detection (Sub-Epic: 057_Detailed Domain Specifications (Part 22))

## Covered Requirements
- [2_TAS-REQ-159]

## Dependencies
- depends_on: [none]
- shared_components: ["devs-core"]

## 1. Initial Test Written
- [ ] In `devs-core`, create a test file `dag_validation_tests.rs`.
- [ ] Define multiple test cases for `WorkflowDefinition` validation:
    - A workflow with a cycle (e.g., A -> B -> C -> A).
    - A workflow with no stages.
    - A workflow with an unknown pool name.
- [ ] Assert that validation fails for these cases.
- [ ] For the cycle detection case, verify the error includes the exact cycle path: `["A", "B", "C", "A"]`.
- [ ] Verify that all validation errors are collected and reported together before rejection.

## 2. Task Implementation
- [ ] Implement `validate_workflow` in the `devs-core` crate (or relevant domain module).
- [ ] Implement Kahn's Algorithm for cycle detection.
- [ ] Track the path of the detected cycle to satisfy [2_TAS-REQ-159].
- [ ] Implement checks for `workflow.stages.len() > 0`.
- [ ] Check each stage's `pool` against a list of known pools (this might require passing the `ServerConfig` or a list of pool names to the validator).
- [ ] Accumulate all errors into a `Vec<ValidationError>` and return them as a single result.

## 3. Code Review
- [ ] Ensure that Kahn's algorithm is implemented correctly for directed acyclic graphs.
- [ ] Confirm that error reporting is comprehensive and helpful for users debugging their workflow definitions.
- [ ] Verify that no early returns prevent the discovery of all validation errors.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-core` and ensure all validation tests pass.

## 5. Update Documentation
- [ ] Update the `devs-core` documentation to reflect the validation rules for workflow definitions.

## 6. Automated Verification
- [ ] Run a small script that passes a deliberate cyclic JSON workflow definition and asserts the output contains the exact cycle path as per [2_TAS-REQ-159].
