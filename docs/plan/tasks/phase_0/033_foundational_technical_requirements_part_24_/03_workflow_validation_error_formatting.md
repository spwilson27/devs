# Task: Workflow Validation Error Formatting (Sub-Epic: 033_Foundational Technical Requirements (Part 24))

## Covered Requirements
- [2_TAS-REQ-086D]

## Dependencies
- depends_on: [02_grpc_error_handling_mapping.md]
- shared_components: [devs-core, devs-config]

## 1. Initial Test Written
- [ ] Create unit tests in `devs-core` or `devs-config` that exercise workflow validation.
- [ ] The test should provide an invalid workflow (e.g., circular dependencies, missing fields).
- [ ] The test should verify that the resulting error is mapped to `INVALID_ARGUMENT`.
- [ ] The test should verify that the error message contains a JSON array string representing all validation errors found.
- [ ] The test should verify that each element in the JSON array is a string describing a specific validation failure.

## 2. Task Implementation
- [ ] Implement a validation engine for `WorkflowDefinition` in `devs-config` or `devs-core`.
- [ ] The engine should collect all errors found instead of failing fast at the first one.
- [ ] Define a `ValidationError` variant for the central `Error` enum that takes a `Vec<String>`.
- [ ] Update the `tonic::Status` conversion for `ValidationError` to serialize the `Vec<String>` into a JSON array for the status message detail.
- [ ] Ensure that the resulting status message follows the format `"INVALID_ARGUMENT: <json-array-of-errors>"`.

## 3. Code Review
- [ ] Verify that the validation engine captures all common errors (DAG cycles, undefined dependencies, invalid input parameters).
- [ ] Check that the JSON serialization of the error list is robust and correctly escaped within the gRPC message string.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-config` and `cargo test -p devs-core` to ensure validation and error formatting work as expected.

## 5. Update Documentation
- [ ] Document the JSON array format for `INVALID_ARGUMENT` errors in the API documentation or `GEMINI.md`.

## 6. Automated Verification
- [ ] Run `./do test` and ensure all related tests pass.
- [ ] Verify traceability using `./tools/verify_requirements.py`.
