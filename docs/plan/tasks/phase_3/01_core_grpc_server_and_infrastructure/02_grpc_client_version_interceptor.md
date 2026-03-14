# Task: gRPC Client Version Interceptor (Sub-Epic: 01_Core gRPC Server and Infrastructure)

## Covered Requirements
- [2_TAS-REQ-053]

## Dependencies
- depends_on: ["01_devs_grpc_crate_scaffold_and_server_service.md"]
- shared_components: ["devs-proto (consumer)"]

## 1. Initial Test Written
- [ ] In `crates/devs-grpc/tests/version_interceptor_test.rs`:
  - `test_matching_major_version_passes`: Send a request with `client_version` metadata matching server major version; assert success response.
  - `test_mismatched_major_version_returns_failed_precondition`: Send a request with a different major version; assert gRPC status `FAILED_PRECONDITION` with message containing `"client version mismatch"`.
  - `test_missing_client_version_returns_failed_precondition`: Send a request with no `client_version` metadata; assert `FAILED_PRECONDITION`.
  - `test_valid_minor_version_difference_passes`: Same major, different minor; assert success.

## 2. Task Implementation
- [ ] Implement a tonic `Interceptor` (or `tower::Layer`) named `VersionCheckInterceptor` that:
  1. Reads the `x-devs-client-version` metadata key from the incoming request.
  2. Parses the value as a semver string.
  3. Compares the major version against the server's major version (`env!("CARGO_PKG_VERSION")`).
  4. Returns `Status::failed_precondition("client version mismatch")` if major versions differ or metadata is missing.
- [ ] Register the interceptor on all six tonic services in the `GrpcServer` builder.

## 3. Code Review
- [ ] Verify the interceptor is applied globally, not per-service (single registration point).
- [ ] Confirm the metadata key name is a constant, not a magic string.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-grpc -- version` and confirm all tests pass.

## 5. Update Documentation
- [ ] Add doc comment to `VersionCheckInterceptor` explaining the protocol.
- [ ] Add `// Covers: 2_TAS-REQ-053` annotations to test functions.

## 6. Automated Verification
- [ ] Run `./do test` and confirm zero failures.
