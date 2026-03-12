# Task: Implement Session Recovery State Machine (Sub-Epic: 01_MCP Tool Reliability & Recovery)

## Covered Requirements
- [3_MCP_DESIGN-REQ-049]

## Dependencies
- depends_on: [none]
- shared_components: [devs-core, devs-mcp]

## 1. Initial Test Written
- [ ] Write a unit test in `crates/devs-core/src/agent/client/recovery.rs`.
- [ ] The test must:
    - [ ] Simulate an agent session restart (no in-memory context).
    - [ ] Assert that the agent client performs the following MCP calls in the required priority order:
        1. `list_runs(status=running)` — find in-flight work.
        2. `get_run(<in-flight-id>)` — reconstruct stage state.
        3. `list_directory` / `read_file` — check for partial source edits.
        4. `submit_run(workflow="git-log")` (or equivalent) — identify last committed state.
    - [ ] Verify that a successful recovery results in a task state that can resume without re-running completed stages.

## 2. Task Implementation
- [ ] Implement the `SessionRecoverer` state machine in the agent client:
    - [ ] On startup, enter the `Recovering` state.
    - [ ] Orchestrate the 4-step sequence as defined in REQ-049.
    - [ ] Store the results of each step in the agent's initial context.
    - [ ] If `list_runs` returns multiple in-flight runs, categorize them by timestamp and relevance to the current task.
    - [ ] Verify if the `devs` server has already resumed the runs (check for recent logs or stage updates).
- [ ] Ensure the recoverer handles server outages or connectivity issues during the recovery sequence.

## 3. Code Review
- [ ] Verify that the priority order is strictly followed (list runs BEFORE git log).
- [ ] Ensure that the "git log" step correctly handles the branch/remote context of the agent.
- [ ] Check for potential state inconsistencies if a run completes *during* the recovery sequence.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-core --lib agent::client::recovery`
- [ ] Run `./do test` and verify traceability for REQ-049.

## 5. Update Documentation
- [ ] Update `docs/plan/specs/3_mcp_design.md` with a diagram of the recovery state machine and its transitions.

## 6. Automated Verification
- [ ] Run `./do test` and ensure `target/traceability.json` reports `[3_MCP_DESIGN-REQ-049]` as covered.
