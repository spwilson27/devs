# Task: Workflow snapshot persistence (Sub-Epic: 04_Persistence & Checkpoints)

## Covered Requirements
- [2_TAS-REQ-018], [1_PRD-REQ-009]

## Dependencies
- depends_on: [02_git_backed_persistence_configurable_branch.md]
- shared_components: [devs-core, devs-config]

## 1. Initial Test Written
- [ ] Create a unit test in `devs-checkpoint/src/snapshotter.rs` that verifies `Snapshotter::snapshot()` can write a `WorkflowDefinition` to `.devs/runs/<run-id>/workflow_snapshot.json`.
- [ ] The test MUST verify that after the first snapshot, any attempt to overwrite it fails with an error (immutability).
- [ ] Verify that a commit is recorded for this snapshot on the checkpoint branch.

## 2. Task Implementation
- [ ] Implement a `Snapshotter` struct in `devs-checkpoint`.
- [ ] Add `snapshot_workflow(run_id: &RunId, definition: &WorkflowDefinition) -> Result<(), CheckpointError>` method.
- [ ] Logic for snapshotting:
    1. Check if `.devs/runs/<run-id>/workflow_snapshot.json` already exists. If yes, return an error (immutability). [2_TAS-REQ-018]
    2. Write the snapshot atomically (reusing the logic from `FileCheckpointStore`).
    3. Commit the snapshot file to git on the configured branch. [1_PRD-REQ-009]
- [ ] Ensure that this happens before the first stage transitions from `Waiting` to `Eligible`. (This is a protocol enforcement, logic should be available for the scheduler to call).

## 3. Code Review
- [ ] Verify that `WorkflowDefinition` is correctly serialized to JSON.
- [ ] Confirm that `Snapshotter` handles missing directories gracefully.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-checkpoint` to execute the unit tests for snapshotting.
- [ ] Run `./do test` to ensure no workspace regressions.

## 5. Update Documentation
- [ ] Document the immutability of `workflow_snapshot.json` in `devs-checkpoint`'s doc comments.

## 6. Automated Verification
- [ ] Run `verify_requirements.py` to ensure [2_TAS-REQ-018] and [1_PRD-REQ-009] are covered by the new tests.
