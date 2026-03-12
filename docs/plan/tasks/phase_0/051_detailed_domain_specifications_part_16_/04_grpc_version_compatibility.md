# Task: gRPC Version Compatibility Interceptor (Sub-Epic: 051_Detailed Domain Specifications (Part 16))

## Covered Requirements
- [2_TAS-REQ-130]

## Dependencies
- depends_on: [none]
- shared_components: [devs-grpc, devs-proto]

## 1. Initial Test Written
- [ ] Write a test in `crates/devs-grpc/tests/version_check.rs` that creates a mock gRPC client.
- [ ] Verify that a request without `x-devs-client-version` metadata returns `FAILED_PRECONDITION`.
- [ ] Verify that a request with a major version mismatch (e.g., client 2.0.0, server 1.0.0) returns `FAILED_PRECONDITION` with the specific message format.
- [ ] Verify that a request with matching major version (e.g., client 1.5.0, server 1.0.0) succeeds.

## 2. Task Implementation
- [ ] In `crates/devs-grpc`, implement a `tonic` Interceptor.
- [ ] The interceptor MUST extract `x-devs-client-version` from the request metadata.
- [ ] If missing, return `Status::failed_precondition("client version mismatch: client=unknown server=<server_ver>")`.
- [ ] Parse the major version from the client version string.
- [ ] Compare with the server's major version (from `CARGO_PKG_VERSION`).
- [ ] If major versions differ, return `Status::failed_precondition` with the mandated message.

## 3. Code Review
- [ ] Verify that the interceptor is applied to all services registered in the server.
- [ ] Ensure the version check logic is robust to malformed version strings.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-grpc` and ensure version check tests pass.

## 5. Update Documentation
- [ ] Update the `devs-grpc` README to document the versioning policy.

## 6. Automated Verification
- [ ] Run `./do lint` and verify no undocumented crates were added.
- [ ] Verify requirement traceability for [2_TAS-REQ-130] via `target/traceability.json`.
