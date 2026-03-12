# Task: Implement Auto-Collect Artifact Logic (Sub-Epic: 050_Detailed Domain Specifications (Part 15))

## Covered Requirements
- [2_TAS-REQ-122]

## Dependencies
- depends_on: [01_executor_preparation_sequence.md]
- shared_components: [devs-core, devs-executor]

## 1. Initial Test Written
- [ ] Create unit tests in `crates/devs-executor/src/lib.rs` (or equivalent test module) for the `collect_artifacts()` method of the `StageExecutor` trait.
- [ ] Write a test for `ArtifactCollection::AutoCollect` that:
    - Simulates changes in the working directory.
    - Mocks the `git add -A` command.
    - Mocks the `git diff --cached --quiet` command to verify changes are detected.
    - Mocks the `git commit` command to ensure the author and message are correct.
    - Mocks the `git push` command to verify it targets only the checkpoint branch.
- [ ] Write a test ensuring that if no changes are present, the commit step is skipped.

## 2. Task Implementation
- [ ] Implement the `collect_artifacts()` method logic for `ArtifactCollection::AutoCollect`:
    - Run `git -C <working_dir> add -A` to stage all changes.
    - Check for changes using `git -C <working_dir> diff --cached --quiet`.
    - If changes are present, execute `git commit` with the message: `"devs: auto-collect stage <name> run <run-id>"`.
    - Set the author to `devs <devs@localhost>`.
    - Push the changes to the project's checkpoint branch ONLY.
- [ ] Ensure that `collect_artifacts()` is only called when the stage completes and `AutoCollect` is enabled.

## 3. Code Review
- [ ] Verify that the `AutoCollect` logic strictly follows the specification in [2_TAS-REQ-122].
- [ ] Ensure that it is impossible to push to a branch other than the checkpoint branch.
- [ ] Check that the git author is correctly set as `devs <devs@localhost>`.
- [ ] Verify that no commit is made when no changes are detected.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-executor` to ensure `collect_artifacts()` passes its unit tests.

## 5. Update Documentation
- [ ] Document the `collect_artifacts()` method and the `AutoCollect` behavior in the `StageExecutor` documentation.
- [ ] Update the `devs-executor` module-level documentation to reflect artifact collection logic.

## 6. Automated Verification
- [ ] Run `./do lint` to verify doc comments and formatting.
- [ ] Run `cargo clippy -p devs-executor` to ensure code quality.
