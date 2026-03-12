# Task: retry_stage State Transition Atomicity (Sub-Epic: 03_MCP Execution Control & Atoms)

## Covered Requirements
- [3_MCP_DESIGN-REQ-091]

## Dependencies
- depends_on: [03_retry_stage_attempt_reset.md]
- shared_components: [devs-mcp, devs-scheduler, devs-checkpoint, devs-core]

## 1. Initial Test Written
- [ ] Write an integration test in `crates/devs-mcp/tests/retry_stage_atomicity.rs`.
- [ ] The test MUST:
    - [ ] Take a `WorkflowRun` with one `Failed` stage and several downstream `Cancelled` stages.
    - [ ] Mock the `CheckpointStore` to simulate a failure during the multi-stage status update.
    - [ ] Call `retry_stage` on the failed stage.
    - [ ] Assert that the `CheckpointStore` ensures either nothing changes or the failed stage AND its downstream dependencies are atomically updated (to `Eligible`/`Waiting` as appropriate).
    - [ ] Verify that no "ghost" `Cancelled` stages are left after the failed stage is retried.

## 2. Task Implementation
- [ ] Implement/Update the `retry_stage` tool in `crates/devs-mcp/src/tools/control.rs`:
    - [ ] Ensure the scheduler calculates all downstream stages that need to be re-evaluated for transition.
    - [ ] Create a batch status update covering all affected stages.
    - [ ] Use `CheckpointStore::save_checkpoint` to commit the entire batch in a single atomic transaction on the state branch.
    - [ ] Handle any `git` push failures gracefully (by logging and ensuring the local state reflects the requested change).
- [ ] Ensure the tool returns the final set of affected stage statuses.

## 3. Code Review
- [ ] Verify that `retry_stage` correctly handles "dangling" stage outputs by clearing them in the checkpoint.
- [ ] Check that the `RetryScheduled` events are correctly injected into the scheduler queue without duplicates.
- [ ] Confirm that the atomic checkpoint write happens BEFORE the MCP tool call returns to the client.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-mcp --test retry_stage_atomicity`
- [ ] Run `./do test` and verify traceability for REQ-091.

## 5. Update Documentation
- [ ] Update `docs/plan/specs/3_mcp_design.md` with the new tool definition and atomicity guarantees for `retry_stage`.

## 6. Automated Verification
- [ ] Run `./do test` and ensure `target/traceability.json` reports `[3_MCP_DESIGN-REQ-091]` as covered.
