# Task: Protocol Hardening and Discovery (Sub-Epic: 01_Core gRPC Server and Infrastructure)

## Covered Requirements
- [2_TAS-REQ-053], [2_TAS-REQ-070], [1_PRD-REQ-003], [2_TAS-REQ-077], [2_TAS-REQ-078], [5_SECURITY_DESIGN-REQ-030]

## Dependencies
- depends_on: [01_core_grpc_server_and_lifecycle.md]
- shared_components: [devs-grpc, devs-config]

## 1. Initial Test Written
- [ ] Write a test in `crates/devs-grpc/tests/discovery.rs` that starts the server and verifies that `~/.config/devs/server.addr` is created with mode `0600` and contains the correct `<host>:<port>`.
- [ ] Create a gRPC client test that sends a request without the `x-devs-client-version` header and expects an `INVALID_ARGUMENT` or `FAILED_PRECONDITION` error.
- [ ] Test the gRPC message size limit by sending a payload larger than the configured limit (e.g., 4MiB) and verifying it is rejected.

## 2. Task Implementation
- [ ] Implement the `x-devs-client-version` header check in a gRPC interceptor.
- [ ] Set gRPC frame and message limits (e.g., 4MiB) at the `tonic` server builder level.
- [ ] Implement the auto-discovery mechanism: on startup, write the gRPC listen address to `~/.config/devs/server.addr` (atomically via tmp-file + rename).
- [ ] Ensure the discovery file is created with `0600` permissions on Unix.
- [ ] Add logic to delete the discovery file on clean shutdown.
- [ ] Implement discovery precedence: explicit address (`--server` or config) > discovery file.

## 3. Code Review
- [ ] Confirm that the version check is strictly enforced for all clients.
- [ ] Verify that the discovery file path is configurable (e.g., for testing).
- [ ] Ensure that message size limits are consistent with [2_TAS-REQ-070].

## 4. Run Automated Tests to Verify
- [ ] `cargo test -p devs-grpc -p devs-server`

## 5. Update Documentation
- [ ] Document the auto-discovery mechanism and version check in the server README.

## 6. Automated Verification
- [ ] Verify that the `server.addr` file is correctly managed during multiple server starts/stops.
