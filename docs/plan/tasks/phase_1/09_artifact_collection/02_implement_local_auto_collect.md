# Task: Implement Auto-Collect Git Logic for LocalTempDirExecutor (Sub-Epic: 09_Artifact Collection)

## Covered Requirements
- [2_TAS-REQ-044], [1_PRD-REQ-023]

## Dependencies
- depends_on: ["01_define_artifact_collection_strategy_schema.md"]
- shared_components: [devs-executor (consumer — implement collect_artifacts for local target), devs-checkpoint (consumer — uses same checkpoint branch config)]

## 1. Initial Test Written
- [ ] Create `crates/devs-executor/src/auto_collect.rs` (new module for shared git auto-collect logic) with the following unit tests. All tests use `tempfile::TempDir` to create isolated git repos via `git init`:
  - `test_auto_collect_commits_changes_to_checkpoint_branch`:
    1. Init a bare "remote" repo and clone it into a working dir. Create an initial commit on `main`. Create a `devs/state` branch.
    2. Write a new file `output.txt` in the working dir.
    3. Call `git_auto_collect(working_dir, checkpoint_branch="devs/state", stage_name="build", run_id="run-123")`.
    4. Assert: a new commit exists on `devs/state` with message `devs: auto-collect stage build run run-123`.
    5. Assert: `main` branch has no new commits.
  - `test_auto_collect_no_changes_is_noop`:
    1. Init repo with initial commit. No modifications to working dir.
    2. Call `git_auto_collect(...)`.
    3. Assert: no new commit on any branch. Function returns `Ok(())`.
  - `test_auto_collect_stages_all_files`:
    1. Init repo with initial commit. Add three new files and modify one existing file.
    2. Call `git_auto_collect(...)`.
    3. Assert: all four changes are included in the single auto-collect commit (verify via `git diff --stat` on the commit).
  - `test_auto_collect_push_failure_returns_error`:
    1. Init repo with no remote configured.
    2. Write a change and call `git_auto_collect(...)`.
    3. Assert: returns `Err` with a message indicating push failure.
  - `test_auto_collect_commit_message_format`:
    1. Run auto-collect with `stage_name="deploy"` and `run_id="abc-def-456"`.
    2. Assert the commit message is exactly `devs: auto-collect stage deploy run abc-def-456`.
- [ ] Annotate all tests with `// Covers: 2_TAS-REQ-044`.
- [ ] All tests must fail initially.

## 2. Task Implementation
- [ ] Create `crates/devs-executor/src/auto_collect.rs` with a public function:
  ```rust
  /// Performs git auto-collect: diffs working directory, stages all changes,
  /// commits with a standardized message, and pushes to the checkpoint branch.
  /// Returns Ok(()) if no changes are present (no-op).
  pub async fn git_auto_collect(
      working_dir: &Path,
      checkpoint_branch: &str,
      stage_name: &str,
      run_id: &str,
  ) -> Result<(), ExecutorError> { ... }
  ```
- [ ] Implementation steps (all git operations via `tokio::process::Command` with `spawn_blocking` wrapper or direct async Command):
  1. Run `git diff --quiet && git diff --cached --quiet` in `working_dir`. If exit code 0, return `Ok(())` (no changes).
  2. Run `git add -A` in `working_dir`. If failure, return error.
  3. Run `git commit -m "devs: auto-collect stage {stage_name} run {run_id}"` in `working_dir`. If failure, return error.
  4. Run `git push origin HEAD:{checkpoint_branch}` in `working_dir`. If failure, return error with stderr captured.
- [ ] Wire this into `LocalTempDirExecutor::collect_artifacts`: when `mode == ArtifactMode::AutoCollect`, call `git_auto_collect` with the working directory path, the project's checkpoint branch, and the stage/run identifiers from the `WorkingEnvironment`. When `mode == ArtifactMode::AgentDriven`, return `Ok(())` immediately.
- [ ] Add `pub mod auto_collect;` to `crates/devs-executor/src/lib.rs`.

## 3. Code Review
- [ ] Verify `git push` targets ONLY the checkpoint branch, never `main` or the working branch (per [1_PRD-REQ-023] and related business rule 3_PRD-BR-029).
- [ ] Verify commit message format matches `devs: auto-collect stage <name> run <id>` exactly.
- [ ] Verify no-changes case is a clean no-op (no empty commits, no errors).
- [ ] Verify all git commands capture stderr for error reporting.
- [ ] Verify `git add -A` is used (stages all tracked and untracked files).

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-executor -- auto_collect` and confirm all 5 tests pass.
- [ ] Run `cargo test -p devs-executor` to confirm no regressions in existing executor tests.

## 5. Update Documentation
- [ ] Add doc comments to `git_auto_collect` explaining the four-step git sequence and the no-op behavior.
- [ ] Ensure `cargo doc -p devs-executor --no-deps` builds without warnings.

## 6. Automated Verification
- [ ] Run `./do test` — all tests must pass.
- [ ] Run `./do lint` — must pass with zero warnings.
- [ ] Verify test output contains `test_auto_collect_commits_changes_to_checkpoint_branch ... ok`.
