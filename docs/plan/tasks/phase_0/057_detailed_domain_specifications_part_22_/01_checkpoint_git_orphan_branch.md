# Task: Checkpoint Git Orphan Branch Creation (Sub-Epic: 057_Detailed Domain Specifications (Part 22))

## Covered Requirements
- [2_TAS-REQ-156]

## Dependencies
- depends_on: [none]
- shared_components: ["devs-checkpoint"]

## 1. Initial Test Written
- [ ] In `devs-checkpoint`, write a test in `checkpoint_git_tests.rs` that initializes a temporary git repository.
- [ ] The test should attempt to create a checkpoint branch (e.g., `devs/state`) and verify that it is created as an **orphan** branch (i.e., it has no parent commits and is not connected to the `main` branch).
- [ ] Verify that committing a JSON file to this branch does not affect the `main` branch.
- [ ] Verify that the `devs-checkpoint` component correctly identifies and creates the branch only if it doesn't exist.

## 2. Task Implementation
- [ ] Implement the `GitCheckpointStore` in the `devs-checkpoint` crate.
- [ ] Use `git2` to perform repository operations.
- [ ] Implement a method (e.g., `ensure_checkpoint_branch`) that checks for the existence of the configured state branch.
- [ ] If the branch does not exist, use `git2` to create an orphan branch. This involves creating a new reference that is not derived from any existing commit.
- [ ] Ensure that all checkpoint commits (saves of `checkpoint.json` and snapshots) are targeted at this branch.
- [ ] Explicitly enforce that the project's main branch is never written to by this component (unless `AutoCollect` is explicitly configured, which is handled separately).

## 3. Code Review
- [ ] Verify that `git2` operations are properly handled and errors are propagated.
- [ ] Ensure that orphan branch creation logic is robust against existing but empty repositories.
- [ ] Confirm that no reference to `HEAD` or the current branch is used when writing checkpoints to the state branch.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-checkpoint` and ensure all git-related tests pass.

## 5. Update Documentation
- [ ] Document the orphan branch behavior in the `devs-checkpoint` README.md.
- [ ] Update `GEMINI.md` to note that the checkpoint persistence layer now correctly isolates state history.

## 6. Automated Verification
- [ ] Run a script that inspects a test repository after a checkpoint write and asserts that `git rev-list --count devs/state --not main` equals the number of checkpoints, and `git merge-base main devs/state` returns an error (no common ancestor).
