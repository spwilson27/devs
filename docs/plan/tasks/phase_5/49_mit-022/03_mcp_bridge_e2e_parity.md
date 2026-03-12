# Task: MCP Bridge E2E Parity and Mitigation Finalization (Sub-Epic: 49_MIT-022)

## Covered Requirements
- [AC-RISK-022-04], [MIT-022]

## Dependencies
- depends_on: [01_mcp_bridge_acceptance_hardening.md, 02_stage_completion_fallback.md]
- shared_components: [devs-mcp-bridge, devs-proto]

## 1. Initial Test Written
- [ ] Create an E2E test in `tests/e2e/test_mcp_bridge_parity.py` (or a Rust-based E2E test) that:
    - Starts the `devs` server.
    - Sends a direct `POST /mcp/v1/call` request to the server's MCP port.
    - Records the response JSON.
    - Spawns a `devs-mcp-bridge` process connected to the same server.
    - Sends the exact same request through the bridge's stdin.
    - Verifies that the bridge's stdout output matches the recorded server response (ignoring whitespace and transport-specific JSON-RPC envelope variations if any, but the payload must be identical).
    - **// Covers: AC-RISK-022-04**
- [ ] Create a final verification script or manual test case that:
    - Verifies that all `RISK-022` related tests (reconnect, fatal error, JSON robustness, security isolation, parity) pass in a single run.
    - **// Covers: MIT-022**

## 2. Task Implementation
- [ ] Refine the bridge's stdout formatting to ensure it doesn't add any unexpected wrappers or alter the JSON payload from the server.
- [ ] Ensure that `AC-RISK-022-04` is satisfied across all relevant MCP methods (e.g., `list_tools`, `call_tool`, `get_resource`, `stream_logs`).
- [ ] Implement the `MIT-022` mitigation by ensuring all its sub-requirements are met and verified by automated tests.

## 3. Code Review
- [ ] Confirm that the E2E parity test is robust and covers edge cases like large payloads and chunked streaming.
- [ ] Ensure that the bridge doesn't introduce any performance bottlenecks or latency.
- [ ] Verify that the `fatal: true` flag is documented and correctly handled by downstream agents.

## 4. Run Automated Tests to Verify
- [ ] Run the parity test: `pytest tests/e2e/test_mcp_bridge_parity.py` (or the Rust equivalent).
- [ ] Run all tests for Sub-Epic 49_MIT-022: `cargo test -p devs-mcp-bridge` and `cargo test -p devs-scheduler`.

## 5. Update Documentation
- [ ] Finalize the mitigation documentation in `docs/plan/specs/8_risks_mitigation.md`, linking the implementation to the verified tests.

## 6. Automated Verification
- [ ] Run `./do test` and verify that `target/traceability.json` shows [AC-RISK-022-04] and [MIT-022] as 100% covered.
- [ ] Run `python3 .tools/verify_requirements.py` to ensure no traceability gaps exist for Sub-Epic 49_MIT-022.
