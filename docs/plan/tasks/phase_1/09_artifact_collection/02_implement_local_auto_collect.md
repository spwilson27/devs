# Task: Implement Auto-Collect for LocalTempDirExecutor (Sub-Epic: 09_Artifact Collection)

## Covered Requirements
- [2_TAS-REQ-044]

## Dependencies
- depends_on: [01_define_artifact_collection_strategy_schema.md]
- shared_components: [devs-executor]

## 1. Initial Test Written
- [ ] Create a test in `devs-executor/src/local_tempdir.rs` (or a new `git.rs` helper) that:
    - Initializes a git repository in a temporary directory.
    - Creates a dummy file and commits it to a `main` branch.
    - Creates a new `devs/state` branch.
    - Modifies the file in the working directory.
    - Calls the auto-collect logic targeting the `devs/state` branch.
    - Verifies that a new commit exists on the `devs/state` branch with the expected message: `devs: auto-collect stage <name> run <id>`.
    - Verifies that the `main` branch remains unchanged.
    - Verifies that if no changes are present, no commit is created and no error is returned.

## 2. Task Implementation
- [ ] Implement a `git_auto_collect` helper in `devs-executor` (using `std::process::Command` to invoke `git` or a library if preferred, but `Command` is consistent with other agent tool invocations).
- [ ] The helper must perform:
    1. `git diff --quiet` to check for changes. If it returns 0 (no changes), exit early.
    2. `git add -A`
    3. `git commit -m "devs: auto-collect stage <stage_name> run <run_id>"`
    4. `git push origin HEAD:<checkpoint_branch>` (Pushing the current HEAD to the specified remote branch).
- [ ] Update `LocalTempDirExecutor::collect_artifacts`:
    - Check if `policy` is `AutoCollect`.
    - If so, call the `git_auto_collect` helper using the `working_dir` from the `ExecutionHandle`.
- [ ] Ensure that all git commands are executed within the `working_dir`.

## 3. Code Review
- [ ] Verify that `git push` targets the correct branch and doesn't push to `main`.
- [ ] Ensure that the commit message matches the requirement in `2_TAS-REQ-044` exactly.
- [ ] Confirm that no-op collections (no changes) are handled gracefully.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-executor --lib local_tempdir`.

## 5. Update Documentation
- [ ] Update `GEMINI.md` memory to reflect that `LocalTempDirExecutor` now supports auto-collection.

## 6. Automated Verification
- [ ] Run `./do test` and verify that the new git tests pass.
