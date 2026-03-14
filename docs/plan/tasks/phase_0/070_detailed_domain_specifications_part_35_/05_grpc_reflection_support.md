# Task: Enable gRPC Reflection Exposing All Six Services (Sub-Epic: 070_Detailed Domain Specifications (Part 35))

## Covered Requirements
- [2_TAS-REQ-429]

## Dependencies
- depends_on: ["none"]
- shared_components: ["devs-proto", "devs-grpc"]

## 1. Initial Test Written
- [ ] Write an E2E test that: (1) starts the devs server, (2) uses `grpcurl -plaintext <host>:<port> list` (or an equivalent gRPC reflection client in Rust such as `tonic-reflection` client APIs) to query the server's reflection endpoint, (3) asserts the response contains exactly these six service names: `devs.v1.WorkflowDefinitionService`, `devs.v1.RunService`, `devs.v1.StageService`, `devs.v1.LogService`, `devs.v1.PoolService`, `devs.v1.ProjectService`.
- [ ] Write a unit/integration test that constructs the gRPC server (without binding to a port, using `tonic::transport::Server` with an in-process channel if possible) and queries the reflection service descriptor to verify all six services are registered.
- [ ] If `grpcurl` is not available in CI, write the test using a pure-Rust gRPC reflection client to avoid external tool dependencies. Alternatively, add `grpcurl` installation to `./do setup`.

## 2. Task Implementation
- [ ] Add the `tonic-reflection` crate as a dependency of the gRPC server crate (e.g., `devs-grpc` or `devs-server`).
- [ ] In the gRPC server builder, register the reflection service using `tonic_reflection::server::Builder`. Include the file descriptor sets for all proto files that define the six services.
- [ ] Ensure the file descriptor set is generated at build time (via `tonic-build` with `file_descriptor_set_path` option in `build.rs`) and included in the binary.
- [ ] Register all six service implementations AND the reflection service on the tonic `Server` builder.
- [ ] Verify that the reflection service is available on the same port as the regular gRPC services (no separate port needed).

## 3. Code Review
- [ ] Verify the `file_descriptor_set_path` is configured in the proto build script and the generated file is included via `include_bytes!`.
- [ ] Verify all six services are registered — not just the ones currently implemented. If some services are stubs, they must still be registered for reflection.
- [ ] Confirm the reflection service does not expose internal/debug services that should remain hidden.

## 4. Run Automated Tests to Verify
- [ ] Run the E2E reflection test and confirm all six service names are returned.
- [ ] Run `./do test` and confirm all tests pass.

## 5. Update Documentation
- [ ] Document in the server crate's doc comments that gRPC reflection is enabled and lists the six public services.

## 6. Automated Verification
- [ ] Run `./do test` and confirm exit code 0.
- [ ] If `grpcurl` is available, run `grpcurl -plaintext localhost:<port> list` against a running test server and verify the six service names appear in the output.
