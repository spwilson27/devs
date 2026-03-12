# Task: MCP Mid-Run Agent Tools (Progress, Completion, Rate Limit) (Sub-Epic: 06_MCP Tools - Control and Management)

## Covered Requirements
- [3_MCP_DESIGN-REQ-022], [3_MCP_DESIGN-REQ-023], [3_MCP_DESIGN-REQ-024], [3_MCP_DESIGN-REQ-073], [3_MCP_DESIGN-REQ-074], [3_MCP_DESIGN-REQ-075], [3_MCP_DESIGN-REQ-076], [3_MCP_DESIGN-REQ-077], [3_MCP_DESIGN-REQ-078], [3_MCP_DESIGN-REQ-EC-AGENT-001], [3_MCP_DESIGN-REQ-EC-AGENT-002], [3_MCP_DESIGN-REQ-EC-AGENT-003], [3_MCP_DESIGN-REQ-EC-AGENT-004], [3_MCP_DESIGN-REQ-NEW-002], [3_MCP_DESIGN-REQ-NEW-030]

## Dependencies
- depends_on: [none]
- shared_components: [devs-mcp, devs-scheduler, devs-pool, devs-core]

## 1. Initial Test Written
- [ ] Write integration tests in `crates/devs-mcp/tests/agent_tools.rs` for `report_progress`, `signal_completion`, and `report_rate_limit`.
- [ ] For `report_progress`:
    - [ ] Call with `%` and `message`. Verify it updates `StageRun` state in scheduler.
    - [ ] Call for a non-running stage should return an error.
- [ ] For `signal_completion`:
    - [ ] Call with `success: true/false` and optional `output`.
    - [ ] Verify it causes the scheduler to transition the stage to terminal status.
    - [ ] Call for an already terminal stage should return error.
- [ ] For `report_rate_limit`:
    - [ ] Call for an agent in a pool. Verify it triggers pool fallback and puts the agent in cooldown.
- [ ] Write E2E test in `tests/mcp_agent_e2e.rs` involving a mock agent:
    - [ ] Spawn mock agent that calls `report_progress` twice then `signal_completion`.
    - [ ] Verify the server's `WorkflowRun` reflects progress updates and terminal status.

## 2. Task Implementation
- [ ] Implement `report_progress(run_id, stage_name, percentage, message)` in `devs-mcp`:
    - [ ] Update the `StageRun` progress fields in the scheduler's state.
    - [ ] Emit notification to connected clients (TUI/CLI) via gRPC streams if applicable.
- [ ] Implement `signal_completion(run_id, stage_name, success, output_json)` in `devs-mcp`:
    - [ ] If `success=true`, transition stage to `Completed`.
    - [ ] If `success=false`, transition stage to `Failed`.
    - [ ] Store `output_json` in `StageRun.structured_output`.
    - [ ] Ensure the scheduler is notified to process dependencies.
- [ ] Implement `report_rate_limit(pool_name, agent_tool)` in `devs-mcp`:
    - [ ] Mark the specific agent in the named pool as `RateLimited` with a cooldown timestamp.
    - [ ] Ensure the pool's slot management correctly accounts for this.
- [ ] Handle error prefixes: `resource_exhausted:` for rate limiting, `failed_precondition:` for state conflicts.

## 3. Code Review
- [ ] Verify that `signal_completion` is the final act of an agent and correctly releases pool slots.
- [ ] Ensure `report_progress` is non-blocking and high-performance to avoid stalling the agent.
- [ ] Check `report_rate_limit` triggers immediate fallback in the pool if other agents are available.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-mcp --test agent_tools`
- [ ] Run `cargo test --test mcp_agent_e2e`

## 5. Update Documentation
- [ ] Update `crates/devs-mcp/README.md` with instructions for agents to use these tools mid-run.

## 6. Automated Verification
- [ ] Run `./do test` and verify coverage for agent mid-run tool requirements.
