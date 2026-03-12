# Task: Agent Observation Protocol: Shutdown and Multi-Server Coordination (Sub-Epic: 04_MCP Run & Workflow Observation)

## Covered Requirements
- [3_MCP_DESIGN-REQ-006], [3_MCP_DESIGN-REQ-058]

## Dependencies
- depends_on: [02_agent_observation_wait_logic.md]
- shared_components: [devs-mcp, devs-grpc, devs-server]

## 1. Initial Test Written
- [ ] Write an E2E test in `crates/devs-mcp/tests/agent_shutdown_test.rs` to verify coordination and shutdown resiliency.
- [ ] The test MUST:
  - Simulate the agent connecting to both the `devs-mcp` (Glass-Box) and a mock Filesystem MCP server.
  - Assert that the agent can read source files (via Filesystem MCP) AND verify run correctness (via Glass-Box MCP) in the same session.
  - Simulate a server shutdown by making an MCP call that returns `failed_precondition: server is shutting down`.
  - Verify that the agent *immediately* writes its `task_state.json` to the filesystem (via the Filesystem MCP server) before terminating.
  - Assert the saved `task_state.json` contains the current `active_run_id` and `in_progress` requirements.

## 2. Task Implementation
- [ ] Ensure the reference `OrchestratingAgent` handles multiple MCP server connections simultaneously (REQ-006).
- [ ] Implement a global error handler or interceptor for MCP calls:
  - Detect the `"failed_precondition: server is shutting down"` error string in the response.
  - Trigger a mandatory "Checkpoint Save" routine that:
    - Serializes the current internal `TaskState` to JSON.
    - Calls `write_file` on the Filesystem MCP server targeting `.devs/agent-state/<session-id>/task_state.json`.
    - Returns a fatal exit signal to the agent process.
- [ ] Ensure the write is atomic (per Phase 1 `devs-checkpoint` or filesystem primitives).

## 3. Code Review
- [ ] Verify that state saving occurs BEFORE termination when the shutdown error is received (REQ-058).
- [ ] Confirm that both MCP server connections (Glass-Box and Filesystem) are active and used for their respective purposes (REQ-006).
- [ ] Check for proper UUIDv4 session-id generation for the state directory.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-mcp --test agent_shutdown_test`.
- [ ] Verify the agent correctly connects to multiple servers and saves state on shutdown signals.

## 5. Update Documentation
- [ ] Document the "Multi-Server Coordination" and "Shutdown Resiliency" protocols in `docs/plan/specs/3_mcp_design.md`.
- [ ] Record the shutdown state-save requirement in the AI agent's `MEMORY.md`.

## 6. Automated Verification
- [ ] Execute `./do presubmit`.
- [ ] Verify that `target/traceability.json` shows [3_MCP_DESIGN-REQ-006] and [3_MCP_DESIGN-REQ-058] as covered.
