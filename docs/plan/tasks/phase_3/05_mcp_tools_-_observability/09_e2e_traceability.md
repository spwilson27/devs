# Task: E2E Verification and Traceability for Observability Tools (Sub-Epic: 05_MCP Tools - Observability)

## Covered Requirements
- [3_MCP_DESIGN-REQ-EC-OBS-DBG-004], [3_MCP_DESIGN-REQ-EC-OBS-DBG-005], [3_MCP_DESIGN-REQ-EC-OBS-DBG-006]

## Dependencies
- depends_on: [01_mcp_bridge.md, 04_stream_logs.md, 08_cancel_tools.md]
- shared_components: [devs-server, devs-mcp-bridge, devs-cli]

## 1. Initial Test Written
- [ ] Create a comprehensive E2E test in `tests/e2e/mcp_observability.rs`.
- [ ] The test should start a `devs` server and a `devs-mcp-bridge`.
- [ ] Through the bridge (stdio), it should:
    - Submit a run.
    - Stream logs with `follow: true`.
    - Verify pool state.
    - Cancel the run.
- [ ] Verify server discovery file handling and port conflicts. // Covers: [3_MCP_DESIGN-REQ-EC-OBS-DBG-004]
- [ ] Verify coverage reporting for MCP paths. // Covers: [3_MCP_DESIGN-REQ-EC-OBS-DBG-005]
- [ ] (Optional) TUI Snapshot diffing check if integrated with MCP observation. // Covers: [3_MCP_DESIGN-REQ-EC-OBS-DBG-006]

## 2. Task Implementation
- [ ] Ensure `crates/devs-server` correctly initializes the MCP server and exposes all tools.
- [ ] Refine the E2E test harness to handle stdio-based bridge interaction.
- [ ] Implement traceability markers `// Covers: REQ-ID` for all newly implemented MCP tool tests.

## 3. Code Review
- [ ] Verify that all 100% requirement-to-test traceability is maintained.
- [ ] Check for E2E coverage gaps in MCP tool handlers.

## 4. Run Automated Tests to Verify
- [ ] Execute `./do test` and check `target/traceability.json`.

## 5. Update Documentation
- [ ] Update `docs/plan/tasks/phase_3/05_mcp_tools_-_observability/` status.

## 6. Automated Verification
- [ ] Run `./do presubmit`.
