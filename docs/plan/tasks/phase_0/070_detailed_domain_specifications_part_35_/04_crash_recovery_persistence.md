# Task: Implement Crash Recovery for Running Stages (Sub-Epic: 070_Detailed Domain Specifications (Part 35))

## Covered Requirements
- [2_TAS-REQ-428]

## Dependencies
- depends_on: ["none"]
- shared_components: ["devs-checkpoint", "devs-scheduler", "devs-core"]

## 1. Initial Test Written
- [ ] Write an E2E test that: (1) starts a server, (2) submits a workflow with at least one stage, (3) waits until the stage reaches `Running` state (poll via gRPC `GetRun` or `devs status`), (4) sends `SIGKILL` to the server process (simulating a crash), (5) restarts the server with the same config and checkpoint data, (6) polls the run status and asserts the previously-`Running` stage transitions to `Eligible` (not stuck in `Running`), (7) waits for the stage to eventually reach `Running` again (re-dispatched by the scheduler).
- [ ] Write a unit test for the checkpoint restore logic: given a serialized checkpoint where a stage has state `Running`, assert that `restore_checkpoints` returns the stage with state `Eligible` (or equivalent re-schedulable state). This tests the state fixup logic that prevents stages from being stuck in `Running` after an unclean shutdown.
- [ ] Write a unit test for the state machine transition: assert that `StageRunState::Running` can transition to `StageRunState::Eligible` via a `recover_from_crash` (or equivalent) method.

## 2. Task Implementation
- [ ] In the checkpoint restore logic (`restore_checkpoints` or equivalent), add a post-load fixup pass: any stage in `Running` state must be reset to `Eligible`. This is because a crash means the agent process is gone and the stage must be re-dispatched.
- [ ] Add the `recover_from_crash` transition (or equivalent) to the `StageRunState` state machine in `devs-core`, allowing `Running → Eligible`.
- [ ] Ensure the server startup sequence calls `restore_checkpoints` for all projects and feeds the recovered runs back into the scheduler for re-evaluation.
- [ ] Ensure the checkpoint is persisted atomically before a stage transitions to `Running`, so that a crash during `Running` always has a checkpoint to recover from.
- [ ] Log an `INFO` or `WARN` message when a stage is recovered from `Running` to `Eligible` during startup, including the run ID and stage name.

## 3. Code Review
- [ ] Verify the fixup pass handles all non-terminal states that imply active work (not just `Running` — also check if `Cancelling` or similar states need fixup).
- [ ] Verify the state machine transition is explicit and documented, not a force-override.
- [ ] Confirm no data is lost during recovery: stage outputs from completed stages must be preserved.

## 4. Run Automated Tests to Verify
- [ ] Run the E2E crash-recovery test and confirm it passes.
- [ ] Run the unit tests for checkpoint restore and state machine transitions.
- [ ] Run `./do test` and confirm all tests pass.

## 5. Update Documentation
- [ ] Document the crash recovery behavior in the `devs-checkpoint` crate-level docs: which states are fixed up, and what guarantees are provided.

## 6. Automated Verification
- [ ] Run `./do test` and confirm exit code 0.
- [ ] Run the E2E test in isolation and verify the stage transitions from `Running` → `Eligible` → `Running` in the server logs.
