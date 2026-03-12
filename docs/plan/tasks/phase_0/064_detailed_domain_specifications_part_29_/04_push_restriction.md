# Task: Implement auto-collect push restriction (Sub-Epic: 064_Detailed Domain Specifications (Part 29))

## Covered Requirements
- [2_TAS-REQ-283]

## Dependencies
- depends_on: [none]
- shared_components: [devs-checkpoint, devs-executor]

## 1. Initial Test Written
- [ ] Create a unit test in `devs-checkpoint` that attempts to push to a branch other than the configured checkpoint branch and asserts that it fails or is blocked.
- [ ] Create an integration test in `devs-executor` that simulates an auto-collect operation and verifies it only pushes to the correct state branch.

## 2. Task Implementation
- [ ] Implement a strict validation check in the `CheckpointStore` (in `devs-checkpoint`) that compares the target branch name for any git push operations against the configured `checkpoint_branch`.
- [ ] Modify the artifact collection logic in `devs-executor` to use this restricted push mechanism, ensuring that under no circumstances can it affect the main or working branches of the repository.
- [ ] If the current branch is not the checkpoint branch, the push MUST be aborted with a clear error message.

## 3. Code Review
- [ ] Confirm that the push restriction is applied at a low enough level (e.g., in the `git` wrapper in `devs-checkpoint`) to prevent accidental bypass.
- [ ] Verify that the `checkpoint_branch` configuration is correctly loaded and used in this validation.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-checkpoint` and ensure the branch restriction logic is robust.
- [ ] Perform a manual test with a local repository to verify that only the state branch receives updates.

## 5. Update Documentation
- [ ] Document this restriction in the security and architectural sections of the project docs, explaining why it's critical for protecting user project history.

## 6. Automated Verification
- [ ] Run `./do test` and `./do coverage` to ensure the restriction logic is fully tested and doesn't interfere with standard repository operations.
