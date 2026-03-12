# Task: Agent Observation Protocol: Run Tracking and Recovery Verification (Sub-Epic: 04_MCP Run & Workflow Observation)

## Covered Requirements
- [3_MCP_DESIGN-REQ-080], [3_MCP_DESIGN-REQ-AC-1.19]

## Dependencies
- depends_on: [none]
- shared_components: [devs-mcp, devs-grpc, devs-server]

## 1. Initial Test Written
- [ ] Write an E2E test in `crates/devs-mcp/tests/agent_observation_test.rs` that simulates an orchestrating agent.
- [ ] The test MUST:
  - Call `submit_run` via MCP.
  - Verify the agent records the `run_id` immediately before any further action.
  - Simulate a connection interruption (e.g., by dropping the MCP client connection).
  - Verify that upon reconnection, the agent uses the *stored* `run_id` to call `get_run`.
  - Assert that `get_run` is called *before* any new `submit_run` for the same workflow.
  - Verify that if the run is still active, the agent resumes monitoring instead of resubmitting.

## 2. Task Implementation
- [ ] Ensure `devs-mcp` exposes the necessary tools for `submit_run` and `get_run` (if not already verified in Phase 3).
- [ ] Implement or update the `OrchestratingAgent` reference logic (or a helper in the test suite) that:
  - Stores `active_run_id` in a local state before calling `stream_logs`.
  - Implements the "Recover from Interrupted" protocol: check `task_state.json` (mocked or actual) and call `get_run` as the first action.
  - Only allows `submit_run` if `active_run_id` is null or the run is terminal/cancelled.
- [ ] Use `StateMachine::transition()` to ensure terminal status is correctly identified.

## 3. Code Review
- [ ] Verify that `get_run` is used as the *first* MCP action after recovery (REQ-AC-1.19).
- [ ] Ensure that `submit_run` is NOT called if an active run exists for the same workflow (REQ-080).
- [ ] Check for clear error handling if `get_run` returns a `NOT_FOUND` error (e.g., due to retention sweep).

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-mcp --test agent_observation_test`.
- [ ] Verify the test case for "Run ID Recovery after Interruption" passes.

## 5. Update Documentation
- [ ] Document the "Run Tracking & Recovery" protocol in `docs/plan/specs/3_mcp_design.md` if any refinements were found during implementation.
- [ ] Update the `MEMORY.md` of the AI agent with these protocol steps.

## 6. Automated Verification
- [ ] Execute `./do presubmit` to ensure no regressions in traceability or coverage.
- [ ] Verify that `target/traceability.json` shows [3_MCP_DESIGN-REQ-080] and [3_MCP_DESIGN-REQ-AC-1.19] as covered.
