# Task: Git-backed persistence and configurable branch (Sub-Epic: 04_Persistence & Checkpoints)

## Covered Requirements
- [1_PRD-REQ-029], [1_PRD-REQ-030]

## Dependencies
- depends_on: [01_devs_checkpoint_crate_setup_atomic_write.md]
- shared_components: [devs-core, devs-config]

## 1. Initial Test Written
- [ ] Create an integration test in `devs-checkpoint/tests/git_persistence_test.rs` that initializes a temporary git repository.
- [ ] Test the `GitCheckpointStore` to ensure it can commit `checkpoint.json` to the specified branch.
- [ ] Test that the `CheckpointStore` correctly switches between the `working branch` and a `dedicated state branch` (e.g. `devs/state`) based on configuration.
- [ ] Verify that a commit is created on the target branch after calling `write_checkpoint()`.

## 2. Task Implementation
- [ ] Add `git2` crate as a dependency to `devs-checkpoint`.
- [ ] Implement `GitCheckpointStore` using `git2` bindings.
- [ ] Implement the logic to detect the target branch from the project configuration. [1_PRD-REQ-030]
- [ ] The `GitCheckpointStore` should:
    1. Call the underlying `FileCheckpointStore` to write the `checkpoint.json` file atomically.
    2. Add the `checkpoint.json` file to the git index for the specified branch.
    3. Create a commit on that branch with a descriptive message (e.g., `"devs: update checkpoint for run <run-id>"`).
- [ ] Handle error scenarios like a missing checkpoint branch (if dedicated, it should be created). [1_PRD-REQ-031]
- [ ] Ensure that git operations are done in a thread-safe manner if needed (although most operations are on individual files in a local repo).

## 3. Code Review
- [ ] Ensure `git2` is used efficiently, with reuse of objects (Repository, Signature) where appropriate.
- [ ] Check for proper error mapping from `git2::Error` to `CheckpointError`.
- [ ] Verify that the git commit doesn't conflict with any existing work-in-progress on the branch.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-checkpoint --test git_persistence_test` to execute the git integration tests.
- [ ] Run `./do test` to ensure no workspace regressions.

## 5. Update Documentation
- [ ] Update the `README.md` in `devs-checkpoint` with a summary of how checkpoints are committed to git.

## 6. Automated Verification
- [ ] Run `verify_requirements.py` to ensure [1_PRD-REQ-029] and [1_PRD-REQ-030] are covered by the new tests.
