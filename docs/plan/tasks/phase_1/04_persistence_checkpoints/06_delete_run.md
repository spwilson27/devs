# Task: Implement store.delete_run() with Git Commit (Sub-Epic: 04_Persistence & Checkpoints)

## Covered Requirements
- [2_TAS-REQ-087]

## Dependencies
- depends_on: ["02_atomic_checkpoint_save.md", "04_configurable_checkpoint_branch.md"]
- shared_components: [devs-checkpoint (own)]

## 1. Initial Test Written
- [ ] In `crates/devs-checkpoint/tests/delete_run_tests.rs`, write `test_delete_run_removes_directory_tree` that saves a checkpoint for a run, calls `delete_run`, and asserts the `.devs/runs/<run_id>/` directory no longer exists in the git tree.
- [ ] Write `test_delete_run_creates_deletion_commit` that saves a checkpoint, calls `delete_run`, and asserts a new commit exists on the checkpoint branch with a message containing "delete" and the run ID.
- [ ] Write `test_delete_run_preserves_other_runs` that saves checkpoints for runs A and B, deletes run A, and asserts run B's checkpoint still exists and is restorable.
- [ ] Write `test_delete_run_nonexistent_returns_not_found` that calls `delete_run` with a non-existent run ID and asserts a `CheckpointError::NotFound` is returned.
- [ ] Write `test_delete_run_does_not_prune_git_history` that saves a checkpoint, deletes the run, and asserts the previous commit (with the checkpoint data) is still reachable in git history via `git log`.

## 2. Task Implementation
- [ ] Implement `delete_run` in `GitCheckpointStore`:
  1. Open the repo, resolve the checkpoint branch.
  2. Check that `.devs/runs/<run_id>/` exists in the branch's HEAD tree — if not, return `CheckpointError::NotFound`.
  3. Remove the entire `.devs/runs/<run_id>/` subtree from the index.
  4. Create a commit with message `"devs: delete run <run_id>"`.
  5. Update the branch ref to point to the new commit.
  6. Do NOT run `git gc` or prune history — per 2_TAS-REQ-087, git history is not automatically pruned.
- [ ] All git2 operations inside `spawn_blocking`.

## 3. Code Review
- [ ] Verify the entire run directory tree is removed (checkpoint.json, workflow_snapshot.json, any logs).
- [ ] Verify git history is preserved (no pruning) as specified by 2_TAS-REQ-087.
- [ ] Verify `NotFound` error for non-existent runs.
- [ ] Verify `spawn_blocking` wraps git operations.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-checkpoint -- delete_run` and confirm all tests pass.

## 5. Update Documentation
- [ ] Add `// Covers: 2_TAS-REQ-087` to all `delete_run` test functions.

## 6. Automated Verification
- [ ] Run `cargo test -p devs-checkpoint` and verify zero failures.
- [ ] Run `cargo clippy -p devs-checkpoint -- -D warnings` and verify zero warnings.
