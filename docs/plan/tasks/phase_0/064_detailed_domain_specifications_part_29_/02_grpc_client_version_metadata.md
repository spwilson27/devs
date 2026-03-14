# Task: gRPC x-devs-client-version Metadata on Every Request (Sub-Epic: 064_Detailed Domain Specifications (Part 29))

## Covered Requirements
- [2_TAS-REQ-286]

## Dependencies
- depends_on: []
- shared_components: ["devs-proto", "devs-cli"]

## 1. Initial Test Written
- [ ] Write a unit test `test_grpc_request_carries_client_version_metadata` that:
  1. Creates a gRPC request using the client interceptor/middleware.
  2. Asserts the request metadata contains key `x-devs-client-version`.
  3. Asserts the value matches the pattern `MAJOR.MINOR.PATCH` (e.g., `0.1.0`).
- [ ] Write a unit test `test_client_version_matches_cargo_version` that:
  1. Reads the version from the interceptor and compares it to `env!("CARGO_PKG_VERSION")`.
  2. Asserts they are identical.
- [ ] Write a unit test `test_server_rejects_missing_client_version` (or logs a warning) that:
  1. Sends a gRPC request without `x-devs-client-version` metadata.
  2. Asserts the server either rejects with an appropriate status or logs a warning (per the version compatibility design).

## 2. Task Implementation
- [ ] Create a tonic `Interceptor` (or `tower::Layer`) in a shared client utilities module (e.g., `crates/devs-grpc/src/client_interceptor.rs`) that injects `x-devs-client-version` with value `env!("CARGO_PKG_VERSION")` into every outgoing request's metadata.
- [ ] Apply this interceptor to all gRPC client channel constructors in `devs-cli`, `devs-tui`, and `devs-mcp-bridge`.
- [ ] On the server side, add an optional server interceptor that reads `x-devs-client-version` from incoming requests and logs it at `debug` level. If missing, log a warning.

## 3. Code Review
- [ ] Verify every client binary applies the interceptor — no client should be able to send requests without the version header.
- [ ] Confirm the version string is derived from `CARGO_PKG_VERSION`, not hardcoded.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-grpc -- client_version` and confirm all tests pass.

## 5. Update Documentation
- [ ] Add doc comments on the interceptor explaining the metadata key name and format.

## 6. Automated Verification
- [ ] Run `cargo test --workspace` and verify no regressions.
