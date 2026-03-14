# Task: Agent Diagnostic Protocol: Pool State Inspection (Sub-Epic: 06_MCP Logging & Stage Output)

## Covered Requirements
- [3_MCP_DESIGN-REQ-039]

## Dependencies
- depends_on: []
- shared_components: [devs-mcp, devs-scheduler, devs-pool]

## 1. Initial Test Written
- [ ] Create an integration test in `crates/devs-mcp/tests/agent_diagnostic_test.rs` that simulates a scheduler/pool failure.
- [ ] The test MUST:
  - Submit a workflow run that targets a pool with no available slots or where all agents are rate-limited.
  - Verify that when the stage fails to dispatch or times out in `Eligible` status, the agent (or test driver) calls `get_pool_state` via MCP.
  - Assert that the `get_pool_state` response is used to inspect:
    - `semaphore_availability` (must be 0 in this case).
    - `rate_limited_agents` count.
    - `queued_stage_count`.
  - Verify that the agent logs a diagnostic message explaining the delay/failure based on these pool metrics.

## 2. Task Implementation
- [ ] Implement a diagnostic helper in the development agent logic (or the reference agent used in E2E tests) that:
  - Identifies failures originating from `devs-scheduler` or `devs-pool` (e.g., by checking the error prefix or stage log signatures).
  - Automatically invokes the `get_pool_state` MCP tool.
  - Parses the response to identify infrastructure bottlenecks.
- [ ] Ensure that `devs-mcp` correctly serializes all fields required by `[3_MCP_DESIGN-REQ-012]` (active agents, rate-limited, queued stages, semaphore).

## 3. Code Review
- [ ] Verify that `get_pool_state` is called specifically for scheduler/pool related failures, not for generic build errors (REQ-039).
- [ ] Ensure the agent does not attempt a "blind fix" of project code when the pool is the bottleneck.
- [ ] Validate that `get_pool_state` uses a short-lived read lock to avoid blocking the scheduler (REQ-DBG-BR-009).

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-mcp --test agent_diagnostic_test`.
- [ ] Confirm that the diagnostic sequence correctly identifies pool exhaustion.

## 5. Update Documentation
- [ ] Update the "Diagnostic Protocol" section in `docs/plan/specs/3_mcp_design.md` to emphasize pool state inspection.
- [ ] Update the agent's memory with instructions on when to call `get_pool_state`.

## 6. Automated Verification
- [ ] Run `./do test` to verify traceability for [3_MCP_DESIGN-REQ-039].
