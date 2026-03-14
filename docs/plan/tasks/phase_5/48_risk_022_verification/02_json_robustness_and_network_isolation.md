# Task: Verify MCP Bridge JSON Robustness and Network Isolation (Sub-Epic: 48_Risk 022 Verification)

## Covered Requirements
- [RISK-022-BR-002], [RISK-022-BR-003]

## Dependencies
- depends_on: ["01_verify_reconnect_and_fatal_error.md"]
- shared_components: [devs-grpc, devs-proto]

## 1. Initial Test Written
- [ ] Create an E2E test in `crates/devs-mcp-bridge/tests/robustness_test.rs` that:
    - Starts the `devs-mcp-bridge` process.
    - Writes multiple lines of invalid JSON to its stdin (e.g., `{`, `not json`, `{"id": 1}`).
    - Verifies that for each invalid line, the bridge writes a JSON-RPC parse error to stdout: `{"jsonrpc":"2.0","error":{"code":-32700,"message":"Parse error"},"id":null}`.
    - Verifies that the bridge process remains alive and can still process a subsequent valid JSON request correctly.
    - **// Covers: RISK-022-BR-002**
- [ ] Create an E2E test in `crates/devs-mcp-bridge/tests/security_test.rs` that:
    - Starts the `devs-mcp-bridge` process.
    - Uses a tool like `lsof` (or a cross-platform equivalent like `sysinfo` in a separate Rust binary) to check the open files/sockets of the bridge process.
    - Asserts that the bridge process has zero open listening sockets.
    - Verifies that the bridge only communicates with the server via outgoing HTTP requests.
    - **// Covers: RISK-022-BR-003**

## 2. Task Implementation
- [ ] Implement or update the `devs-mcp-bridge` input processing to:
    - Use a line-by-line reader for stdin.
    - Handle JSON parsing errors by emitting the standard JSON-RPC 2.0 parse error response.
    - Ensure that any parsing error does not break the main loop or trigger an early exit.
- [ ] Review the `devs-mcp-bridge` implementation to ensure no server or listening socket is initialized.
    - Verify that only an `HttpClient` is used for forwarding requests.

## 3. Code Review
- [ ] Ensure that the bridge doesn't buffer excessively large invalid lines.
- [ ] Confirm that no library dependencies are inadvertently starting background listeners or servers.

## 4. Run Automated Tests to Verify
- [ ] Run the robustness test: `cargo test --test robustness_test`.
- [ ] Run the security test: `cargo test --test security_test`.
- [ ] Confirm both pass on the target CI platform (Linux).

## 5. Update Documentation
- [ ] Update the MCP bridge documentation to state clearly that it is a pure proxy and never listens on any port.

## 6. Automated Verification
- [ ] Run `./do test` and verify that `target/traceability.json` shows [RISK-022-BR-002] and [RISK-022-BR-003] as 100% covered.
- [ ] Validate that the security test correctly identifies any accidentally opened ports.
