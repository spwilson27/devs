# Task: Implement Bulk Status Monitoring Protocol (Sub-Epic: 01_MCP Tool Reliability & Recovery)

## Covered Requirements
- [3_MCP_DESIGN-REQ-048]

## Dependencies
- depends_on: []
- shared_components: [devs-core, devs-mcp]

## 1. Initial Test Written
- [ ] Write a unit test in `crates/devs-core/src/agent/client/monitor.rs`.
- [ ] The test must:
    - [ ] Setup a scenario with 20 active workflow runs.
    - [ ] Assert that the agent client loop performs one `list_runs(status=running)` call to check for terminal state transitions.
    - [ ] Verify that individual `get_run` calls are only made for runs that have changed status or were not already in the local cache.
    - [ ] Measure and assert that the total number of MCP calls per iteration remains constant regardless of the number of runs.

## 2. Task Implementation
- [ ] Implement the `RunMonitor` in the agent client:
    - [ ] Maintain a local `Map<RunID, RunStatus>` representing the last known status of all relevant runs.
    - [ ] At the start of each monitoring iteration, call `list_runs` with a filter for `running` status.
    - [ ] Compare the returned list with the local status map:
        - [ ] If a run is missing from the list, it has reached a terminal state; call `get_run` once to retrieve its final status and outputs.
        - [ ] If a run's state is unchanged, skip further processing.
    - [ ] Use `list_runs` pagination if necessary to handle a large number of runs (e.g., > 100).
- [ ] Ensure that "local summary" persists for the duration of the agent's main loop.

## 3. Code Review
- [ ] Verify that the monitor loop correctly identifies terminal states (e.g., a run that completed between two `list_runs` calls).
- [ ] Ensure that `list_runs` status filtering is correctly applied on the server side to minimize payload size.
- [ ] Check for potential race conditions if the server state changes during the iteration.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-core --lib agent::client::monitor`
- [ ] Run `./do test` and verify traceability for REQ-048.

## 5. Update Documentation
- [ ] Update `docs/plan/specs/3_mcp_design.md` with details on the monitoring frequency and cache invalidation rules.

## 6. Automated Verification
- [ ] Run `./do test` and ensure `target/traceability.json` reports `[3_MCP_DESIGN-REQ-048]` as covered.
