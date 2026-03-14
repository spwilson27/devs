# Task: Server Exit on Port Conflict (EADDRINUSE) (Sub-Epic: 068_Detailed Domain Specifications (Part 33))

## Covered Requirements
- [2_TAS-REQ-419]

## Dependencies
- depends_on: ["04_server_config_failure_exit.md"]
- shared_components: [devs-server (consumer)]

## 1. Initial Test Written
- [ ] Create `tests/e2e/server_port_conflict.rs` with test `test_grpc_port_conflict()`: bind a `std::net::TcpListener` to `127.0.0.1:0` (OS-assigned port), note the assigned port, write a valid `devs.toml` with `listen_addr = "127.0.0.1:<that_port>"`, start the `devs` server binary with `--config <path>`, assert the process exits with a non-zero code, assert stderr contains either "EADDRINUSE", "address already in use", or "port already in use" (case-insensitive).
- [ ] Write test `test_mcp_port_conflict()`: start a first server instance successfully (with OS-assigned ports), then start a second server instance configured to use the same MCP port but a different gRPC port. Assert the second exits non-zero with an address-in-use error mentioning the MCP port.
- [ ] Write test `test_two_full_servers_same_ports()`: start a first server instance, then start a second with identical config. Assert the second exits non-zero. Assert the first server remains healthy (connect to it and verify it responds).
- [ ] Each test must use `DEVS_DISCOVERY_FILE` set to a unique temp path for isolation, and must clean up (kill) any spawned server processes in a drop guard.

## 2. Task Implementation
- [ ] In `devs-server` startup, after config validation passes, bind the gRPC port using `tokio::net::TcpListener::bind(listen_addr).await`. If binding fails with `std::io::ErrorKind::AddrInUse`, print `"Error: gRPC port {port} already in use (EADDRINUSE)"` to stderr and exit with code 1.
- [ ] Next, bind the MCP port. If MCP binding fails with `AddrInUse`, explicitly drop the gRPC listener first (releasing the port), then print `"Error: MCP port {port} already in use (EADDRINUSE)"` to stderr and exit with code 1.
- [ ] Match specifically on `ErrorKind::AddrInUse` to produce the "EADDRINUSE" message. For other bind errors, produce a generic "failed to bind port {port}: {error}" message.
- [ ] Ensure the error message includes the specific port number that conflicted.

## 3. Code Review
- [ ] Verify that when MCP port binding fails, the gRPC port is explicitly released before process exit.
- [ ] Verify the error message contains "EADDRINUSE" or "already in use" as required by the requirement.
- [ ] Verify no other startup steps (state recovery, scheduler init) proceed if port binding fails.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test --test server_port_conflict` and confirm all 3 tests pass.
- [ ] Run `./do test` and confirm full suite passes.

## 5. Update Documentation
- [ ] Add `// Covers: 2_TAS-REQ-419` comments to each E2E test function.

## 6. Automated Verification
- [ ] Run the two-server test manually: start a server, then start a second with the same ports, capture stderr and exit code, verify the error message and non-zero exit.
