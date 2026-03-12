# Task: Verify Phase 3 Infrastructure Connection and Readiness (Sub-Epic: 12_Roadmap Dependency Verification)

## Covered Requirements
- [ROAD-P4-DEP-001]

## Dependencies
- depends_on: [none]
- shared_components: [devs-server, devs-cli, devs-tui, devs-mcp-bridge]

## 1. Initial Test Written
- [ ] Create an integration test file `tests/phase_3_readiness_check.rs` (or equivalent).
- [ ] Implement a setup function that:
    1. Starts a local `devs-server` on non-standard ports (e.g., gRPC `:7892`, MCP `:7893`) to avoid conflicts.
    2. Writes a temporary `server.addr` file in a dedicated test directory.
- [ ] Add the following test cases:
    1. `test_cli_connects`: Executes `devs list-workflows` (via `assert_cmd`) pointing to the test server and expects a success (exit 0).
    2. `test_tui_connects`: Initializes a `devs-tui` instance with a `TestBackend` and confirms it can successfully establish a gRPC channel to the server.
    3. `test_mcp_bridge_connects`: Sends a standard `list_tools` JSON-RPC request to the `devs-mcp-bridge` stdin and verifies it receives a valid response from the server's MCP port.

## 2. Task Implementation
- [ ] Ensure that all three client binaries (`devs-cli`, `devs-tui`, `devs-mcp-bridge`) are properly registered in the workspace root `Cargo.toml`.
- [ ] Verify that the `devs-server` correctly handles the `DEVS_LISTEN` and `DEVS_MCP_PORT` environment variables to allow for the test-specified port overrides.
- [ ] Implement a health-check endpoint or utility in `devs-grpc` that clients can use to verify connectivity before proceeding with higher-level logic.
- [ ] Ensure that `devs-mcp-bridge` correctly points to the `DEVS_MCP_ADDR` if provided.

## 3. Code Review
- [ ] Confirm that `devs-cli` properly uses the discovery file if no `--server` flag is provided.
- [ ] Verify that `devs-tui` does not hang indefinitely if the server is unreachable; ensure it implements the 35s reconnect timeout specified in the requirements.
- [ ] Check that `devs-mcp-bridge` properly forwards headers or context if required for gRPC-level isolation.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test --test phase_3_readiness_check` to confirm all clients can connect to a live server.
- [ ] Manually verify connectivity on a clean environment if possible to ensure no hardcoded paths are being used.

## 5. Update Documentation
- [ ] Update the Phase 4 status tracker to reflect that the Phase 3 foundation is verified and ready for the bootstrap attempt.

## 6. Automated Verification
- [ ] Run `./do build` to ensure all binaries are current and can be built for the local architecture.
- [ ] Verify that `devs-server --help` output lists the expected gRPC and MCP configuration options.
