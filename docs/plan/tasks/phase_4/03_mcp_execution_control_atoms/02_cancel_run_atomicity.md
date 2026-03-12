# Task: cancel_run Multi-Stage Atomicity (Sub-Epic: 03_MCP Execution Control & Atoms)

## Covered Requirements
- [3_MCP_DESIGN-REQ-089]

## Dependencies
- depends_on: [none]
- shared_components: [devs-mcp, devs-scheduler, devs-checkpoint, devs-core]

## 1. Initial Test Written
- [ ] Write an integration test in `crates/devs-mcp/tests/cancel_run_atomicity.rs`.
- [ ] The test MUST:
    - [ ] Create a `WorkflowRun` with multiple (e.g., 5) parallel `Running` stages.
    - [ ] Mock the `CheckpointStore` to simulate a failure (e.g., panic or IO error) in the middle of a batch status update.
    - [ ] Call `cancel_run` and trigger the simulated checkpoint failure.
    - [ ] Assert that the `CheckpointStore` maintains the invariant: either the run status remains `"running"` or the run AND all its stages are marked `"cancelled"`. A partial cancellation (run cancelled but some stages still `"running"`) must be impossible.
    - [ ] Verify that the `cancel_run` call is idempotent (calling it twice on a non-terminal run results in only one checkpoint write).

## 2. Task Implementation
- [ ] Implement/Update the `cancel_run` tool in `crates/devs-mcp/src/tools/control.rs`:
    - [ ] Dispatch a `SchedulerEvent::CancelRun` to the DAG scheduler.
    - [ ] Ensure the scheduler transitions all non-terminal `StageRun` records to `Cancelled` in memory first.
    - [ ] Invoke `CheckpointStore::save_checkpoint` once for the entire run status change, passing the atomic set of stage transitions.
    - [ ] Block the MCP tool response until the git commit/push to the state branch is acknowledged (or recorded in the local checkpoint log).
- [ ] Return the final run status `"cancelled"` in the tool response.

## 3. Code Review
- [ ] Verify that no stage is left hanging in `Running` or `Eligible` state after the run is marked `Cancelled`.
- [ ] Ensure that `devs:cancel\n` is sent to the stdin of all `Running` stage processes immediately.
- [ ] Check that the tool returns a `failed_precondition` error if the run is already in a terminal state (`Completed`, `Failed`, `Cancelled`).

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-mcp --test cancel_run_atomicity`
- [ ] Run `./do test` and verify traceability for REQ-089.

## 5. Update Documentation
- [ ] Update `docs/plan/specs/3_mcp_design.md` §2.5.7 to specify the atomicity of multi-stage cancellation in a single checkpoint.

## 6. Automated Verification
- [ ] Run `./do test` and ensure `target/traceability.json` reports `[3_MCP_DESIGN-REQ-089]` as covered.
