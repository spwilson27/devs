# Task: devs-grpc Crate Scaffold and ServerService Implementation (Sub-Epic: 01_Core gRPC Server and Infrastructure)

## Covered Requirements
- [1_PRD-REQ-001], [2_TAS-REQ-052], [2_TAS-REQ-069], [2_TAS-REQ-070]

## Dependencies
- depends_on: []
- shared_components: ["devs-proto (consumer)", "devs-core (consumer)"]

## 1. Initial Test Written
- [ ] Create `crates/devs-grpc/tests/server_service_test.rs` with tests:
  - `test_get_info_returns_server_version_and_uptime`: Call `ServerService::get_info` on a test instance; assert response contains `version` string matching `env!("CARGO_PKG_VERSION")` and `uptime_seconds >= 0`.
  - `test_health_check_returns_serving`: Call `ServerService::health_check`; assert response status is `SERVING`.
  - `test_default_grpc_listen_address_is_loopback_7890`: Assert the default `GrpcConfig` has `listen_addr = "127.0.0.1:7890"`.
  - `test_default_mcp_port_is_7891`: Assert the default config has `mcp_port = 7891`.
  - `test_max_frame_size_is_16mib`: Create a tonic `Server` via the crate's builder and verify `max_frame_size` is set to `16 * 1024 * 1024`.
  - `test_grpc_request_size_limits`: Verify `SubmitRun` request limit is 1 MiB by sending an oversized request and asserting `RESOURCE_EXHAUSTED` status.
- [ ] Create `crates/devs-grpc/tests/integration_test.rs` with a test that starts the gRPC server on an ephemeral port and connects a tonic client, calling `health_check` end-to-end.

## 2. Task Implementation
- [ ] Add `devs-grpc` crate to the Cargo workspace with dependencies: `tonic`, `tonic-reflection`, `prost`, `tokio`, `devs-proto`, `devs-core`.
- [ ] Define `GrpcConfig` struct with fields: `listen_addr: SocketAddr` (default `127.0.0.1:7890`), `max_frame_size: usize` (default 16 MiB). Implement `Default`.
- [ ] Implement `ServerServiceImpl` struct holding `start_time: Instant` and server metadata.
- [ ] Implement the `ServerService` tonic trait from devs-proto:
  - `get_info` returns server version, uptime, and build metadata.
  - `health_check` returns `SERVING` status.
- [ ] Create `GrpcServer` builder that configures tonic `Server` with `max_frame_size(16 * 1024 * 1024)`, registers `ServerService`, enables `tonic-reflection`, and returns a future that binds to the configured address.
- [ ] Configure per-RPC message size limits on the tonic service layer (1 MiB for SubmitRun requests, etc.).
- [ ] Export a public `start_grpc_server(config: GrpcConfig, ...) -> Result<(SocketAddr, impl Future)>` that binds the port and returns the actual bound address and server future.

## 3. Code Review
- [ ] Verify no wire types (proto-generated structs) leak into the public API of `devs-grpc` beyond the tonic service trait implementations.
- [ ] Confirm `tonic-reflection` is registered so gRPC reflection is functional.
- [ ] Ensure `listen_addr` defaults to loopback `127.0.0.1`, not `0.0.0.0`.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-grpc` and confirm all tests pass.

## 5. Update Documentation
- [ ] Add doc comments to all public types and functions in `devs-grpc`.
- [ ] Add `// Covers: 1_PRD-REQ-001` and other requirement annotations to relevant test functions.

## 6. Automated Verification
- [ ] Run `./do test` and confirm `devs-grpc` tests appear in output with zero failures.
- [ ] Run `./do lint` and confirm no clippy warnings in `devs-grpc`.
