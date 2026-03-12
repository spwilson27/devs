# Task: MCP Bridge Acceptance Hardening (Sub-Epic: 49_MIT-022)

## Covered Requirements
- [AC-RISK-022-01], [AC-RISK-022-03]

## Dependencies
- depends_on: [none]
- shared_components: [devs-grpc, devs-proto]

## 1. Initial Test Written
- [ ] Create an integration test in `crates/devs-mcp-bridge/tests/acceptance_test.rs` that:
    - Starts the `devs-mcp-bridge` process and connects it to a mock MCP server.
    - **Verify AC-RISK-022-01**: 
        - Stop the mock MCP server.
        - Send a request to the bridge's stdin.
        - Assert that the bridge writes `{"result":null,"error":"server_unreachable: ...","fatal":true}` to stdout and exits with code 1 within a 2-second timeout window.
    - **Verify AC-RISK-022-03**:
        - While the bridge is running, write a line of malformed JSON (e.g., `{"method": "test", "params": {`) to stdin.
        - Assert that the bridge writes a JSON-RPC `-32700` error to stdout.
        - Assert that the bridge remains running and correctly processes a subsequent valid request.
    - **// Covers: AC-RISK-022-01, AC-RISK-022-03**

## 2. Task Implementation
- [ ] Refine the `devs-mcp-bridge` main loop in `crates/devs-mcp-bridge/src/main.rs`:
    - Ensure the connection loss detection and single-reconnect attempt (from RISK-022-BR-001) are completed within the 2-second latency requirement of **AC-RISK-022-01**.
    - Verify the exact fatal error message format: `{"result":null,"error":"server_unreachable: <DETAILS>","fatal":true}`.
    - Harden the stdin parser to catch and report JSON-RPC `-32700` errors for any invalid line-terminated input without exiting the process.
    - Ensure that the bridge uses `BufferedStdout` and flushes immediately for real-time delivery.

## 3. Code Review
- [ ] Confirm that the bridge's error responses are strictly newline-delimited JSON.
- [ ] Verify that the `fatal: true` flag is NOT present for standard tool-call errors returned by the server, only for terminal bridge-level failures.
- [ ] Ensure that the 2-second timeout in the test is reliable and not prone to race conditions.

## 4. Run Automated Tests to Verify
- [ ] Run the acceptance test: `cargo test --test acceptance_test`.
- [ ] Verify that no other MCP bridge tests are broken by these changes.

## 5. Update Documentation
- [ ] Update `crates/devs-mcp-bridge/README.md` to document the specific JSON error formats and the 2-second fail-fast behavior.

## 6. Automated Verification
- [ ] Run `./do test` and verify that `target/traceability.json` shows [AC-RISK-022-01] and [AC-RISK-022-03] as 100% covered.
- [ ] Verify that `target/coverage/report.json` shows the error handling branches in the bridge as covered.
