# Task: Implement Parallel Run Orchestration and Pool Monitoring E2E Tests (Sub-Epic: 10_Agent TDD Loop Enforcement)

## Covered Requirements
- [3_MCP_DESIGN-REQ-032], [3_MCP_DESIGN-REQ-033]

## Dependencies
- depends_on: [none]
- shared_components: [devs-mcp, devs-executor, devs-pool]

## 1. Initial Test Written
- [ ] Write an E2E test in `tests/mcp_parallel_tasks_e2e.rs` that:
    1. Submits 5 `tdd-green` runs simultaneously, each with a different `branch_name` input.
    2. Uses `list_runs` with `status: "running"` to monitor the progress of all 5 runs.
    3. Calls `get_pool_state` periodically to verify pool usage and detect pool exhaustion when `max_concurrent` is reached.
    4. Simulates a `report_rate_limit` event from one of the agents and verifies the run is requeued and wait is observed.
- [ ] Verify that each run's work is correctly isolated by checking that the separate git branches are created and populated.

## 2. Task Implementation
- [ ] Ensure `devs-executor` correctly handles the `branch` or `worktree` isolation if specified by the agent via `submit_run` inputs or per-stage config.
- [ ] Implement the `list_runs` filtering logic in `crates/devs-mcp/src/tools/observation.rs` for `status`, `workflow_name`, and `project_id`.
- [ ] Implement the `get_pool_state` tool to return `rate_limited` status, `cooldown_remaining_secs`, and `active_stage_run_ids` for all agents.
- [ ] Implement a `wait-for-pool` utility that an agent can call to block until a slot becomes available or a rate-limit clears (REQ-033).

## 3. Code Review
- [ ] Verify that `list_runs` results are sorted by `created_at` descending.
- [ ] Ensure that `get_pool_state` does not leak sensitive agent config information (only capabilities and status).
- [ ] Confirm that `devs-executor` cleans up temporary worktrees or branches after a run completes to prevent disk clutter.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test --test mcp_parallel_tasks_e2e` to verify the orchestration and monitoring.

## 5. Update Documentation
- [ ] Document the requirement for parallel task isolation in `docs/plan/specs/3_mcp_design.md` section §3.3.

## 6. Automated Verification
- [ ] Run `./do test --package devs-pool` and ensure the pool state reporting is accurate and concurrent-safe.
