# Task: Server Exit on Port Conflict (EADDRINUSE) (Sub-Epic: 068_Detailed Domain Specifications (Part 33))

## Covered Requirements
- [2_TAS-REQ-419], [2_TAS-REQ-001]

## Dependencies
- depends_on: [none]
- shared_components: [devs-server, devs-grpc]

## 1. Initial Test Written
- [ ] Create an E2E test in `tests/e2e/test_server_port_conflict.rs`.
- [ ] Use `std::net::TcpListener` to bind the default gRPC port (7890).
- [ ] Attempt to start the `devs` server with default settings.
- [ ] Assert that the process exits with a non-zero code.
- [ ] Assert that `stderr` contains a message mentioning `EADDRINUSE` or "port already in use".

## 2. Task Implementation
- [ ] Implement the port binding logic in `devs-server` (step 3 and 4 in startup sequence).
- [ ] Use `tokio::net::TcpListener::bind` for gRPC and MCP ports.
- [ ] Explicitly match on `std::io::ErrorKind::AddrInUse`.
- [ ] Report the specific port conflict (gRPC or MCP) and exit non-zero.
- [ ] Ensure that if MCP binding fails, the gRPC port is explicitly released before exit (per `2_TAS-REQ-001I`).

## 3. Code Review
- [ ] Verify that no other startup steps (like state recovery) proceed if the gRPC port cannot be bound.
- [ ] Confirm the gRPC port release logic in the MCP failure branch.

## 4. Run Automated Tests to Verify
- [ ] Run `./do test` and ensure the port conflict E2E test passes.

## 5. Update Documentation
- [ ] Update documentation to include the port requirements and common startup failure scenarios.

## 6. Automated Verification
- [ ] Start two server instances in parallel using `run_shell_command` with the same configuration and verify the second one fails and exits non-zero with the correct error message.
