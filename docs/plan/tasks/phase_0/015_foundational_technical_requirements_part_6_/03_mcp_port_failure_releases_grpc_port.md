# Task: MCP Port Failure Releases gRPC Port (Sub-Epic: 015_Foundational Technical Requirements (Part 6))

## Covered Requirements
- [2_TAS-REQ-001I]

## Dependencies
- depends_on: []
- shared_components: [devs-core (consumer)]

## 1. Initial Test Written
- [ ] Create `crates/devs-server/tests/port_cleanup_on_mcp_failure.rs` with a test that: (a) binds a dummy TCP listener on an arbitrary port to simulate the MCP port being unavailable, (b) starts the devs server configured to use that occupied MCP port, (c) asserts the server exits with a non-zero status, (d) asserts the gRPC port is free after the server exits (by successfully binding a new TCP listener on the gRPC port).
- [ ] Write a test that starts the server with both ports available, then verifies both ports are bound and the server is healthy. This is the positive control test.
- [ ] Write a test that verifies no lingering port bindings remain after any startup failure path by checking that both configured ports are free after the process exits.

## 2. Task Implementation
- [ ] In the server startup sequence, structure port binding so that gRPC is bound first (step 3 per TAS), then MCP is bound (step 4). If MCP binding fails, explicitly drop the gRPC listener (or call `shutdown()` on it) before returning the error.
- [ ] Use a RAII guard pattern or explicit cleanup in the error path: wrap the gRPC listener in a guard that releases it on drop if MCP binding has not succeeded.
- [ ] Ensure the error message logged on MCP port failure includes both the MCP port number and a note that the gRPC port has been released.
- [ ] Verify all other startup failure paths after gRPC binding (steps 5-9) also release the gRPC port before exiting.

## 3. Code Review
- [ ] Verify the gRPC listener is explicitly dropped/closed in every error path after its binding.
- [ ] Verify no `std::mem::forget` or equivalent suppresses the drop of the gRPC listener.
- [ ] Verify the RAII guard or explicit cleanup handles panics (use `Drop` trait, not manual cleanup only).

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-server --test port_cleanup_on_mcp_failure` and confirm all tests pass.

## 5. Update Documentation
- [ ] Add doc comments on the server startup function describing the port cleanup guarantee, referencing `[2_TAS-REQ-001I]`.

## 6. Automated Verification
- [ ] Run `./do test` and confirm all new tests pass.
- [ ] Verify `// Covers: 2_TAS-REQ-001I` annotation exists in the test file.
