# Task: MCP Bridge - Connection Refused Error Handling (Sub-Epic: 071_Detailed Domain Specifications (Part 36))

## Covered Requirements
- [2_TAS-REQ-431]

## Dependencies
- depends_on: [01_toolchain_and_edition_enforcement.md]
- shared_components: [devs-mcp-bridge]

## 1. Initial Test Written
- [ ] Create an integration test in `crates/devs-mcp-bridge/tests/integration.rs` that executes the binary when the MCP server is not running on the specified (or default) port.
- [ ] Assert that the process exits with code 3.
- [ ] Assert that stdout contains exactly `{"error": "connection refused", "code": 3}`.

## 2. Task Implementation
- [ ] In `devs-mcp-bridge/src/main.rs`, update the error handling for the initial HTTP/gRPC connection to the server.
- [ ] Use `std::io::Error` and `e.kind() == std::io::ErrorKind::ConnectionRefused` check.
- [ ] Implement the logic to print the specific JSON error object to stdout and exit with code 3.

## 3. Code Review
- [ ] Verify that no other error message is printed to stdout alongside the JSON error object.
- [ ] Ensure that the bridge does not attempt to retry the connection more than the allowed limit (if any) before exiting.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test --package devs-mcp-bridge` and ensure it passes.

## 5. Update Documentation
- [ ] Record the `devs-mcp-bridge` exit code behavior in the project "memory" or `MEMORY.md`.

## 6. Automated Verification
- [ ] Run `.tools/verify_requirements.py` to ensure all requirements are mapped and covered.
