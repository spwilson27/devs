# Task: Run deletion persistence (Sub-Epic: 04_Persistence & Checkpoints)

## Covered Requirements
- [2_TAS-REQ-087]

## Dependencies
- depends_on: [02_git_backed_persistence_configurable_branch.md]
- shared_components: [devs-core]

## 1. Initial Test Written
- [ ] Create a unit test in `devs-checkpoint/tests/run_deletion_test.rs` that verifies `CheckpointStore::delete_run()` correctly removes the `.devs/runs/<run-id>` directory.
- [ ] The test MUST also verify that a commit is recorded on the git branch with a message indicating deletion.
- [ ] Confirm that after deletion, the run data is no longer available in the store.

## 2. Task Implementation
- [ ] Add `delete_run(run_id: &RunId) -> Result<(), CheckpointError>` to the `CheckpointStore` trait.
- [ ] Implement `delete_run` in `GitCheckpointStore`:
    1. Verify that the run directory `.devs/runs/<run-id>` exists.
    2. Remove the entire directory tree using `std::fs::remove_dir_all`. [2_TAS-REQ-087]
    3. Stage the removal in the git index for the configured checkpoint branch.
    4. Commit the deletion with a message like `"devs: delete run <run-id>"`.
- [ ] Ensure that it doesn't fail if the directory is already gone (idempotency).

## 3. Code Review
- [ ] Ensure that `remove_dir_all` doesn't affect other runs in the same project.
- [ ] Verify that the git history remains intact (only the current state of the branch is updated). [2_TAS-REQ-087]

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-checkpoint --test run_deletion_test` to execute the deletion persistence tests.
- [ ] Run `./do test` to ensure no workspace regressions.

## 5. Update Documentation
- [ ] Add a section on run lifecycle and persistence to `devs-checkpoint` documentation.

## 6. Automated Verification
- [ ] Run `verify_requirements.py` to ensure [2_TAS-REQ-087] is covered by the new tests.
