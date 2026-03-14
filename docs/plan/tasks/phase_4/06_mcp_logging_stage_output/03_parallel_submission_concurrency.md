# Task: Parallel Task Protocol: Concurrency Limit Guard (Sub-Epic: 06_MCP Logging & Stage Output)

## Covered Requirements
- [3_MCP_DESIGN-REQ-084]

## Dependencies
- depends_on: ["01_agent_diagnostic_pool_inspection.md"]
- shared_components: [devs-mcp, devs-scheduler, devs-pool]

## 1. Initial Test Written
- [ ] Create an integration test in `crates/devs-mcp/tests/concurrency_limit_test.rs` to verify the parallel task submission strategy.
- [ ] The test MUST:
  - Submit a list of parallel tasks (e.g., 10 tasks).
  - Use `get_pool_state` to determine the `max_concurrent` limit for the target pool (e.g., 4).
  - Verify that the agent (or test driver) only submits a maximum of `max_concurrent` tasks in a single parallel session.
  - Assert that if the number of tasks exceeds the limit, the agent splits them into multiple batches or serializes them.
  - Verify that if the pool is already highly utilized, the agent waits or reduces the session size accordingly.

## 2. Task Implementation
- [ ] Implement the `ConcurrencyAwareSubmitter` logic:
  - Calls `get_pool_state` as the first step before preparing a parallel submission.
  - Reads the `max_concurrent` and `active_agents` values.
  - Calculates the `remaining_slots`.
  - caps the number of `Running` tasks in a single parallel session to this limit.
  - Uses the `fan_out` mechanism in `devs` properly if the submission is through a single stage with parallel execution.
- [ ] Ensure the agent does not attempt to "overflow" the pool, which would lead to queuing and potential priority conflicts.

## 3. Code Review
- [ ] Verify that the `max_concurrent` limit is checked specifically from the `get_pool_state` response (REQ-084).
- [ ] Ensure the calculation of `remaining_slots` is accurate and accounts for current pool utilization.
- [ ] Validate that the splitting/serialization logic doesn't break task dependencies.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-mcp --test concurrency_limit_test`.
- [ ] Confirm that parallel submissions are correctly throttled to match pool capacity.

## 5. Update Documentation
- [ ] Document the "Concurrency Guard" rules in `docs/plan/specs/3_mcp_design.md`.
- [ ] Update the AI agent's memory to include checking pool state before parallel submission.

## 6. Automated Verification
- [ ] Run `./do test` to verify traceability for [3_MCP_DESIGN-REQ-084].
