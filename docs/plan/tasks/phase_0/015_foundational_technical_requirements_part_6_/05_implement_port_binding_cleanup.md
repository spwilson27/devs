# Task: Implement Port Binding Cleanup (Sub-Epic: 015_Foundational Technical Requirements (Part 6))

## Covered Requirements
- [2_TAS-REQ-001I]

## Dependencies
- depends_on: [none]
- shared_components: [devs-server]

## 1. Initial Test Written
- [ ] Create an integration test in `devs-server/src/startup_tests.rs` (or equivalent) that:
    - Starts a mock gRPC server and a mock MCP server on two specific ports.
    - Closes them.
    - Starts the actual `devs-server`, but first binds a separate process to the MCP port (to simulate its unavailability).
    - Attempts to start the `devs-server`.
    - Asserts that the gRPC port is released after the `devs-server` fails to bind to the MCP port.
    - Verifies this by attempting to bind to the gRPC port from another process immediately after the `devs-server` exit.

## 2. Task Implementation
- [ ] Implement the port binding sequence in `devs-server/src/main.rs`:
    - Step 3: Bind the gRPC port (`tonic::transport::Server`).
    - Step 4: Attempt to bind the MCP port (`axum` or equivalent).
    - If MCP port binding fails:
        - Catch the error.
        - Release the already-bound gRPC port. (This is often implicit when the handle or the future is dropped, but MUST be explicitly verified for the `tonic` listener).
        - Print the exact error to `stderr`: `"MCP port in use"`.
        - Exit with a non-zero exit code.
- [ ] Ensure that the server uses a `tokio::net::TcpListener` that can be dropped to release the port quickly.

## 3. Code Review
- [ ] Verify that no lingering port bindings exist in any failure path between step 3 and 10 of the startup sequence.
- [ ] Confirm that the server does NOT exit with code 0 if a port binding failure occurs.
- [ ] Ensure that the error message is correctly printed to `stderr`.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-server` and ensure the port binding tests pass.
- [ ] Manually simulate port conflicts and verify the behavior.

## 5. Update Documentation
- [ ] Add a doc comment in `devs-server/src/main.rs` referencing `[2_TAS-REQ-001I]` and the importance of releasing bound ports on failure.

## 6. Automated Verification
- [ ] Run a shell script `tests/verify_port_cleanup.sh` that:
    - Binds a process to the gRPC port.
    - Binds a process to the MCP port.
    - Starts the `devs-server` (expect failure).
    - Kills the MCP process.
    - Starts the `devs-server` again (it should fail on gRPC port if not cleaned up).
    - Asserts the server reports the correct error for each step.
    - Verifies no ports are held by zombie processes.
