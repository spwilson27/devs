# Task: Implement gRPC Error Handling Mapping (Sub-Epic: 033_Foundational Technical Requirements (Part 24))

## Covered Requirements
- [2_TAS-REQ-086B], [2_TAS-REQ-086C]

## Dependencies
- depends_on: [01_define_normative_proto_files.md]
- shared_components: [devs-core]

## 1. Initial Test Written
- [ ] Create unit tests in `devs-core` for an `Error` enum that handles internal error types.
- [ ] The test should verify that for each error variant, there is a mapping to a standard gRPC `Code` (using the `tonic` or `prost` equivalents).
- [ ] The test should verify that the error's `Display` implementation follows the `"<error-kind>: <detail>"` format, where `<error-kind>` is machine-stable (e.g., `NOT_FOUND`, `INVALID_ARGUMENT`).

## 2. Task Implementation
- [ ] Define a central `Error` enum in `devs-core` for all domain errors.
- [ ] Implement `From<Error> for tonic::Status` to enable automatic conversion during gRPC service implementation.
- [ ] Map internal errors like `WorkflowNotFound` to `Code::NotFound`, `RateLimitExceeded` to `Code::ResourceExhausted`, and `InternalError` to `Code::Internal`.
- [ ] Ensure that `tonic::Status` messages follow the `"<error-kind>: <detail>"` format.
- [ ] The machine-stable error kind should be based on the gRPC code name in uppercase.

## 3. Code Review
- [ ] Check that `INTERNAL` status is reserved ONLY for unexpected failures and not misused for recoverable domain errors.
- [ ] Verify that all non-OK responses include the human-readable detail message in the correct format.
- [ ] Ensure `Error` enum is well-documented and handles common error cases across all gRPC services.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-core` and verify that error conversion tests pass.

## 5. Update Documentation
- [ ] Update `GEMINI.md` to note the standard error mapping pattern and the required message format for new services.

## 6. Automated Verification
- [ ] Run `./do test` and ensure `devs-core` tests pass.
- [ ] Verify traceability using `./tools/verify_requirements.py`.
