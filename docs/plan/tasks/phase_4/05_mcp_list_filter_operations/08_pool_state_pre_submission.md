# Task: Implement get_pool_state Pre-Submission Validation (Sub-Epic: 05_MCP List & Filter Operations)

## Covered Requirements
- [3_MCP_DESIGN-REQ-085]

## Dependencies
- depends_on: []
- shared_components: [devs-mcp, devs-pool, devs-scheduler]

## 1. Initial Test Written
- [ ] Write a unit test in `crates/devs-mcp/src/tools/submit_run.rs` that verifies:
    - `submit_run` checks pool state before accepting the submission.
    - If all agents in the target pool are rate-limited, `submit_run` still succeeds (run created in `Pending` state) but no stage transitions to `Running`.
    - The run is created with status `Pending` when pool is exhausted.
- [ ] Write an E2E test in `tests/mcp_e2e.rs` that:
    - Calls `get_pool_state` to verify available agents.
    - Simulates rate-limiting all agents in the pool (via MCP tool or test fixture).
    - Calls `submit_run` and verifies the run is created in `Pending` status.
    - Waits for an agent's cooldown to expire and verifies that stages transition to `Running`.
    - Verifies that the agent can observe the pending run via `list_runs` or `get_run`.
- [ ] Write a test verifying that `get_pool_state` returns accurate rate-limit cooldown timestamps.

## 2. Task Implementation
- [ ] Update `submit_run` MCP tool handler in `devs-mcp` to:
    - Accept the submission regardless of pool state (preserve idempotency and agent autonomy).
    - Check pool state and set run status to `Pending` if no agents are available.
- [ ] Update `devs-pool::acquire_agent()` to:
    - Return `Pending` status when all agents are rate-limited.
    - Include cooldown expiration timestamps in the response.
- [ ] Update `devs-scheduler` to:
    - Handle `Pending` runs in the scheduling loop.
    - Periodically re-check pool state for `Pending` runs (polling interval configurable, e.g., 5s).
    - Transition `Pending` runs to `Running` when an agent becomes available.
- [ ] Ensure `get_pool_state` returns:
    - `available_agents`: count of agents not rate-limited.
    - `rate_limited_agents`: array of `{agent_id, cooldown_until}`.
    - `max_concurrent`: pool limit.
    - `current_running`: count of currently running agents.
- [ ] Add documentation to the system prompt for agents about the `get_pool_state` → `submit_run` pattern.

## 3. Code Review
- [ ] Verify that `submit_run` does not block waiting for agents (submission is async).
- [ ] Check that the scheduler's pending-run polling does not cause excessive CPU usage.
- [ ] Ensure rate-limit cooldowns are absolute timestamps (not relative) to survive server restarts.
- [ ] Confirm that the `Pending` status is persisted in checkpoints.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-mcp` for submit_run unit tests.
- [ ] Run `cargo test -p devs-pool` for pool state tests.
- [ ] Run `cargo test -p devs-scheduler` for pending-run scheduling tests.
- [ ] Run `cargo test --test mcp_e2e` for the full submission flow.
- [ ] Run `./do test` to ensure all tests pass and traceability is updated.

## 5. Update Documentation
- [ ] Add `Pending` run status to `docs/plan/specs/3_mcp_design.md` §1.3.1 (WorkflowRun state machine).
- [ ] Document the `get_pool_state` → `submit_run` pattern in agent-facing documentation.
- [ ] Update pool state response schema in MCP tool documentation.

## 6. Automated Verification
- [ ] Run `./do test` and verify that `target/traceability.json` shows [3_MCP_DESIGN-REQ-085] as covered.
- [ ] Run `./do coverage` to ensure the new pool validation code meets the 90% unit coverage gate.
