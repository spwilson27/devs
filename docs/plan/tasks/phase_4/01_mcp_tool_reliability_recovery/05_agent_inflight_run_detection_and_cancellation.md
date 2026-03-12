# Task: Implement In-Flight Run Detection and Cancellation (Sub-Epic: 01_MCP Tool Reliability & Recovery)

## Covered Requirements
- [3_MCP_DESIGN-REQ-050]

## Dependencies
- depends_on: [04_agent_session_recovery_order.md]
- shared_components: [devs-core, devs-mcp]

## 1. Initial Test Written
- [ ] Write a unit test in `crates/devs-core/src/agent/client/submit.rs`.
- [ ] The test must:
    - [ ] Create a scenario where an agent attempts to submit a new workflow run for a task while an in-flight run for the same task already exists.
    - [ ] Assert that the agent client logic first calls `cancel_run` for the existing in-flight run.
    - [ ] Assert that the agent client logic kemudian calls `get_run` for the cancelled run to retrieve its final checkpointed state.
    - [ ] Assert that a new `submit_run` is only performed AFTER the previous run is confirmed as `cancelled`.

## 2. Task Implementation
- [ ] Implement the `DuplicateRunProtector` in the agent client's submission path:
    - [ ] Before any `submit_run` call, check the `SessionRecoverer`'s current context for existing in-flight runs.
    - [ ] If a matching run is found (same workflow, same input parameters):
        - [ ] Determine if the run can be resumed (e.g., if the agent's context is compatible with the run's progress).
        - [ ] If it cannot be resumed safely, call `cancel_run` for the existing run.
        - [ ] Wait for the run status to transition to `cancelled`.
        - [ ] Inspect the cancelled run's stage outputs to identify any partial work that can be reused.
    - [ ] Submit the new run only after cleanup is complete.
- [ ] Ensure the protector handles multiple in-flight runs by cancelling all of them.

## 3. Code Review
- [ ] Verify that the cancel-before-submit sequence is atomic to prevent race conditions (two agents submitting simultaneously).
- [ ] Ensure that `cancel_run` is idempotent (calling it twice on the same run is safe).
- [ ] Check for edge cases where `cancel_run` fails (e.g., run already completed).

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-core --lib agent::client::submit`
- [ ] Run `./do test` and verify traceability for REQ-050.

## 5. Update Documentation
- [ ] Update `docs/plan/specs/3_mcp_design.md` with the "cleanup before submission" protocol details.

## 6. Automated Verification
- [ ] Run `./do test` and ensure `target/traceability.json` reports `[3_MCP_DESIGN-REQ-050]` as covered.
