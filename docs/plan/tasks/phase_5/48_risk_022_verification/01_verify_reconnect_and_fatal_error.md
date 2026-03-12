# Task: Verify MCP Bridge Reconnect and Fatal Error Reporting (Sub-Epic: 48_Risk 022 Verification)

## Covered Requirements
- [RISK-022], [RISK-022-BR-001], [RISK-022-BR-004]

## Dependencies
- depends_on: [none]
- shared_components: [devs-grpc, devs-proto]

## 1. Initial Test Written
- [ ] Create an E2E test in `crates/devs-mcp-bridge/tests/reconnect_test.rs` that:
    - Starts the `devs-mcp-bridge` process.
    - Simulates an HTTP connection failure (e.g., by not starting the server or killing it mid-request).
    - Verifies that the bridge waits for 1 second before attempting a single reconnect.
    - Verifies that after the single failed reconnect, the bridge writes a JSON object to stdout containing `"fatal": true` and a `server_unreachable` error message.
    - Asserts that the bridge process exits with code 1.
    - **// Covers: RISK-022, RISK-022-BR-001, RISK-022-BR-004**

## 2. Task Implementation
- [ ] Implement or update the `devs-mcp-bridge` main loop to:
    - Use a retry mechanism that attempts exactly one reconnect after a 1-second delay following a connection error.
    - Ensure that terminal connection failures produce the mandatory `"fatal": true` field in the JSON-RPC error response.
    - Ensure the process terminates with exit code 1 immediately after the single failed retry.
    - Avoid any further retry attempts beyond the first one.

## 3. Code Review
- [ ] Verify that the retry logic uses a non-blocking delay (e.g., `tokio::time::sleep`).
- [ ] Confirm that the `"fatal": true` field is strictly present only for terminal bridge errors, not standard tool-call errors returned from the server.
- [ ] Ensure that the bridge does not leak resources or hang if the server remains unreachable.

## 4. Run Automated Tests to Verify
- [ ] Run the newly created E2E test: `cargo test --test reconnect_test`.
- [ ] Confirm the test passes on Linux, macOS, and Windows to ensure consistent behavior.

## 5. Update Documentation
- [ ] Ensure the MCP bridge's README or design document reflects the single-retry policy and the meaning of the `fatal` flag in its output.

## 6. Automated Verification
- [ ] Run `./do test` and verify that `target/traceability.json` shows [RISK-022], [RISK-022-BR-001], and [RISK-022-BR-004] as 100% covered.
- [ ] Check `target/coverage/report.json` to ensure the bridge's main loop and error handling paths are exercised.
