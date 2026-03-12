# Task: Implement x-devs-client-version metadata enforcement (Sub-Epic: 064_Detailed Domain Specifications (Part 29))

## Covered Requirements
- [2_TAS-REQ-286]

## Dependencies
- depends_on: [none]
- shared_components: [devs-proto, devs-grpc]

## 1. Initial Test Written
- [ ] Create a unit test in `devs-grpc` (or equivalent client crate) that attempts to make a gRPC call without the `x-devs-client-version` header and asserts that the server rejects it or the client fails to send.
- [ ] Create a test that verifies the version string matches the current crate version (MAJOR.MINOR.PATCH).

## 2. Task Implementation
- [ ] Implement a gRPC interceptor or middleware in `devs-grpc` that automatically injects the `x-devs-client-version` metadata into all outgoing requests.
- [ ] The version value should be derived from the `CARGO_PKG_VERSION` environment variable at compile time or via a generated constant.
- [ ] Implement a corresponding server-side interceptor that validates the presence and format of this metadata, rejecting requests that lack it or have a malformed version string.

## 3. Code Review
- [ ] Ensure the metadata key `x-devs-client-version` is defined as a constant to avoid typos.
- [ ] Verify that the interceptor is correctly applied to both unary and streaming calls.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-grpc` and ensure the enforcement and injection tests pass.

## 5. Update Documentation
- [ ] Update internal developer docs to mention the mandatory client version header for any new client implementations.

## 6. Automated Verification
- [ ] Run `./do test` to ensure no regressions in existing proto communication.
