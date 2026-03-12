# Task: MCP Stdio Bridge Binary (Sub-Epic: 051_Detailed Domain Specifications (Part 16))

## Covered Requirements
- [2_TAS-REQ-129]

## Dependencies
- depends_on: [01_mcp_server_protocol.md]
- shared_components: [devs-mcp-bridge, devs-proto]

## 1. Initial Test Written
- [ ] Write an E2E test in `tests/e2e/test_mcp_bridge.rs` that spawns the `devs-mcp-bridge` binary.
- [ ] Verify that sending a JSON-RPC request to its stdin results in a forwarded response on its stdout.
- [ ] Verify that if the server is killed, the bridge writes the specific connection-lost JSON-RPC error to stdout and exits with code 1.
- [ ] Verify that the bridge does not buffer or batch multiple lines (test with a slow server response).

## 2. Task Implementation
- [ ] Implement the `devs-mcp-bridge` binary in `crates/devs-mcp-bridge`.
- [ ] Implement stdin reading using `tokio::io::BufReader`.
- [ ] Use `reqwest` to forward requests to the MCP HTTP server (resolving the port via `GetInfo` if necessary, or using the default).
- [ ] Write responses to stdout using `tokio::io::stdout()`.
- [ ] Implement the error protocol: catch connection errors and write the mandatory JSON error object to stdout.
- [ ] Ensure the process exits with code 1 on fatal connection errors.

## 3. Code Review
- [ ] Verify that the bridge does not interpret or transform the JSON-RPC payload.
- [ ] Ensure that no sensitive data is logged by the bridge.
- [ ] Verify that `cargo tree -p devs-mcp-bridge` does not include `tonic` or `devs-proto` (as per [6_UI_UX_ARCHITECTURE-REQ-006], though [2_TAS-REQ-129] focuses on behavior).
  - *Correction:* The bridge needs `GetInfo` from gRPC to find the port if not using the default, but the requirement says "forwards ... to the MCP HTTP port".

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test --test test_mcp_bridge` and ensure the E2E tests pass.

## 5. Update Documentation
- [ ] Update the project documentation to include usage instructions for `devs-mcp-bridge`.

## 6. Automated Verification
- [ ] Run `./do lint` and `./do test` to verify requirement [2_TAS-REQ-129].
