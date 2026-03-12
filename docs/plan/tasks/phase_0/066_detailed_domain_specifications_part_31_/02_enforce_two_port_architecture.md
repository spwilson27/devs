# Task: Enforce Two-Port Server Architecture (Sub-Epic: 066_Detailed Domain Specifications (Part 31))

## Covered Requirements
- [2_TAS-REQ-406], [2_TAS-REQ-407]

## Dependencies
- depends_on: [none]
- shared_components: [devs-server]

## 1. Initial Test Written
- [ ] Write an integration test in `devs-server` that starts the server and performs a TCP port scan on `127.0.0.1`.
- [ ] Assert that ONLY the configured gRPC and MCP ports are open and responding.
- [ ] Attempt to connect via UDS (Unix Domain Sockets) and assert it fails if not explicitly enabled (as it shouldn't be).

## 2. Task Implementation
- [ ] Configure `tonic::transport::Server` to listen only on the single configured gRPC port.
- [ ] Configure the MCP HTTP server (axum or similar) to listen only on the single configured MCP port.
- [ ] Ensure no default `tonic` reflection features or `axum` routes expose additional ports or endpoints not explicitly defined in the `devs` specification.
- [ ] Add code in the server bootstrap to verify no other listeners are enabled by default dependencies (e.g. some crates might start metrics ports).

## 3. Code Review
- [ ] Confirm that `127.0.0.1` is the default bind address.
- [ ] Verify that all client-server communication paths in the project (TUI, CLI, MCP Bridge) only attempt to connect to these two ports.
- [ ] Ensure that no shared memory or other IPC mechanisms are being introduced.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-server`.
- [ ] Verify the port scan test passes.

## 5. Update Documentation
- [ ] Document the two-port constraint in `devs-server` internal documentation.

## 6. Automated Verification
- [ ] Run `./do test` and check `target/traceability.json` for `2_TAS-REQ-406` and `2_TAS-REQ-407`.
