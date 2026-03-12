# Task: Restore checkpointed runs from git (Sub-Epic: 058_Detailed Domain Specifications (Part 23))

## Covered Requirements
- [2_TAS-REQ-206]

## Dependencies
- depends_on: [none]
- shared_components: ["devs-server", "devs-checkpoint", "devs-scheduler"]

## 1. Initial Test Written
- [ ] Create a mock git repository with multiple `checkpoint.json` files representing different states (`Running`, `Waiting`, `Eligible`, `Pending`).
- [ ] Write an integration test in `devs-server/tests/startup_recovery.rs` (or similar).
- [ ] The test should verify that:
    - Stages in `Running` state are reset to `Eligible`.
    - Stages in `Waiting` or `Eligible` state are re-queued to the scheduler.
    - `Pending` runs are re-queued for execution.
    - A failure to read one project's checkpoints does not stop the recovery of other projects.
    - Errors are logged at the `ERROR` level for failed project restorations.

## 2. Task Implementation
- [ ] Implement the `CheckpointStore::load_all_runs` (or equivalent) in the `devs-checkpoint` crate using `git2` to read the checkpoint branch.
- [ ] Implement the `ServerState::restore_checkpoints` method in `devs-server` that orchestrates the recovery sequence.
- [ ] Implement the logic to scan all registered projects and their respective checkpoint branches.
- [ ] Implement the crash-recovery state transitions:
    - `StageStatus::Running` → `StageStatus::Eligible`.
- [ ] Implement the re-queueing logic into the `SchedulerState` channels.
- [ ] Ensure that failures are handled per-project with a `match` or `if let Err(...)` and a `tracing::error!` log.

## 3. Code Review
- [ ] Verify that the implementation follows the exact startup sequence step 8 specified in `2_TAS-REQ-206`.
- [ ] Ensure that `Running` stages are correctly reset to `Eligible` to avoid being stuck.
- [ ] Check that re-queueing happens for all non-terminal stages (`Waiting`, `Eligible`) and for `Pending` runs.
- [ ] Verify that the implementation uses the `CheckpointStore` abstraction and `git2` for repo access.

## 4. Run Automated Tests to Verify
- [ ] Run the integration test created in step 1 and ensure it passes.
- [ ] Run `cargo test -p devs-server` to ensure no regressions in server startup.

## 5. Update Documentation
- [ ] Update `.agent/MEMORY.md` to reflect the implementation of the checkpoint restoration logic and its conformance to `2_TAS-REQ-206`.

## 6. Automated Verification
- [ ] Run `./do test` and verify that the tests covering `2_TAS-REQ-206` are present and passing in the traceability report.
