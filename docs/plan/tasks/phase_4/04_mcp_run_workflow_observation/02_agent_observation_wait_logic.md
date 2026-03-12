# Task: Agent Observation Protocol: Wait Logic and Polling Safety (Sub-Epic: 04_MCP Run & Workflow Observation)

## Covered Requirements
- [3_MCP_DESIGN-REQ-081]

## Dependencies
- depends_on: [01_agent_observation_run_tracking.md]
- shared_components: [devs-mcp, devs-grpc, devs-server]

## 1. Initial Test Written
- [ ] Create an E2E test in `crates/devs-mcp/tests/agent_wait_protocol_test.rs` to verify the agent's wait strategy.
- [ ] The test MUST:
  - Mock a workflow run with multiple stages.
  - Assert that the agent calls `stream_logs` with `follow: true` to wait for stage completion.
  - Use a spy or log-check to verify the agent *does not* call `get_run` in a tight loop (< 1 second interval) while the stream is active.
  - Simulate a connection loss during `stream_logs`.
  - Verify that *only* after connection loss, the agent falls back to `get_run` polling.
  - Assert that the polling interval is exactly 1 second (per REQ-081).
  - Verify that if the poll count exceeds 120, the agent transitions to a timeout failure.

## 2. Task Implementation
- [ ] Implement the `AgentWaitStrategy` component (or use it in the reference agent):
  - Primary wait: use `stream_logs` with `follow: true`.
  - On stream interruption: log a warning, wait 1 second, and call `get_run`.
  - Repeat the `get_run` poll every 1 second until the run status changes or the poll count reaches 120.
  - If the poll count reaches 120, escalate to a fatal error/timeout.
- [ ] Ensure `stream_logs` implementation in `devs-mcp` (verified in Phase 3) supports chunked transfer and properly emits `done: true` to signal terminal state.

## 3. Code Review
- [ ] Verify that polling is ONLY a fallback for connection loss (REQ-081).
- [ ] Ensure the 1s interval and 120-poll cap are strictly enforced.
- [ ] Check that `stream_logs` is used for blocking on stage completion.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-mcp --test agent_wait_protocol_test`.
- [ ] Confirm all wait-logic scenarios (stream wait, polling fallback, timeout escalation) pass.

## 5. Update Documentation
- [ ] Update `docs/plan/specs/3_mcp_design.md` with details on the polling safety invariants.
- [ ] Record the 1s/120-poll protocol in the `MEMORY.md` of the AI agent.

## 6. Automated Verification
- [ ] Execute `./do presubmit`.
- [ ] Verify that `target/traceability.json` shows [3_MCP_DESIGN-REQ-081] as covered.
