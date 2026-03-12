# Task: Implement stream_logs MCP tool (Sub-Epic: 05_MCP Tools - Observability)

## Covered Requirements
- [3_MCP_DESIGN-REQ-011], [3_MCP_DESIGN-REQ-EC-OBS-004], [3_MCP_DESIGN-REQ-EC-OBS-DBG-001], [3_MCP_DESIGN-REQ-EC-OBS-DBG-002], [3_MCP_DESIGN-REQ-EC-OBS-DBG-008]

## Dependencies
- depends_on: [03_get_stage_output.md]
- shared_components: [devs-core, devs-mcp]

## 1. Initial Test Written
- [ ] Write integration tests in `crates/devs-mcp/tests/tools_obs.rs`.
- [ ] Test `stream_logs` with `follow: true`:
    - Assert HTTP chunked transfer is used.
    - Assert log lines arrive in real-time.
    - Test client disconnect mid-stream. // Covers: [3_MCP_DESIGN-REQ-EC-OBS-004]
    - Test streaming for a stage that hasn't started yet (wait for output). // Covers: [3_MCP_DESIGN-REQ-EC-OBS-DBG-001]
- [ ] Test buffer limits: verify only the last 10,000 lines are returned if `follow: false`. // Covers: [3_MCP_DESIGN-REQ-EC-OBS-DBG-002]
- [ ] Test `from_sequence`: verify lines starting from the given sequence are returned. // Covers: [3_MCP_DESIGN-REQ-EC-OBS-DBG-008]

## 2. Task Implementation
- [ ] Implement `stream_logs` handler in `crates/devs-mcp/src/tools/obs.rs`.
- [ ] Implement HTTP chunked transfer encoding for the response.
- [ ] Use `tokio::sync::broadcast` (or similar) to receive live log events from the scheduler.
- [ ] Implement `follow: false` by returning the current log buffer as a single JSON response.
- [ ] Ensure sequence numbers are monotonically increasing starting at 1.
- [ ] Implement the final `{"done": true}` chunk.

## 3. Code Review
- [ ] Verify that `stream_logs` does not hold the state lock while waiting for new log lines.
- [ ] Ensure large lines (over 32KB) are split correctly.

## 4. Run Automated Tests to Verify
- [ ] Execute `./do test -p devs-mcp`.

## 5. Update Documentation
- [ ] Update the MCP streaming protocol documentation in `docs/plan/specs/3_mcp_design.md`.

## 6. Automated Verification
- [ ] Run `./do presubmit`.
