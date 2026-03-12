# Task: Version Compatibility Enforcement (Sub-Epic: 034_Foundational Technical Requirements (Part 25))

## Covered Requirements
- [2_TAS-REQ-086H], [2_TAS-REQ-086I]

## Dependencies
- depends_on: [none]
- shared_components: [devs-grpc, devs-proto, devs-cli, devs-tui, devs-mcp-bridge]

## 1. Initial Test Written
- [ ] In `devs-grpc`, create integration tests to verify version compatibility enforcement.
- [ ] Test that a request with a matching major version in the `x-devs-client-version` header is accepted.
- [ ] Test that a request with a mismatching major version in the `x-devs-client-version` header is rejected with `FAILED_PRECONDITION`.
- [ ] Test that a request without the `x-devs-client-version` header is rejected with `FAILED_PRECONDITION`.
- [ ] Test that clients (`devs-cli`, `devs-tui`, `devs-mcp-bridge`) always include the version header in their requests.

## 2. Task Implementation
- [ ] In `devs-grpc`, implement a gRPC interceptor or layer that extracts and validates the `x-devs-client-version` metadata.
- [ ] Implement the major-version parity check between the client's version and the server's current version (from `Cargo.toml`).
- [ ] In all clients (`devs-cli`, `devs-tui`, `devs-mcp-bridge`), ensure that the `x-devs-client-version` header is correctly added to every gRPC request.
- [ ] Ensure the server returns status `FAILED_PRECONDITION` with the required message format on version mismatch or absence as per [2_TAS-REQ-130].

## 3. Code Review
- [ ] Verify that version compatibility follows the Semantic Versioning rules defined in [2_TAS-REQ-086H].
- [ ] Verify that the server's version is centrally defined (likely in `devs-core` or from a common `Cargo.toml` field).
- [ ] Verify that the interceptor correctly handles all RPC methods without excessive overhead.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-grpc -p devs-cli -p devs-tui`.
- [ ] Ensure all version compatibility tests pass.

## 5. Update Documentation
- [ ] Update `GEMINI.md` to reflect the implementation of version compatibility enforcement and the requirement for `x-devs-client-version` headers.

## 6. Automated Verification
- [ ] Run `./do lint` to ensure doc comments and code quality standards are met.
- [ ] Run `./do test` and verify that `target/traceability.json` correctly maps [2_TAS-REQ-086H] and [2_TAS-REQ-086I] to the new tests.
