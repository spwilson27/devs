# Task: Artifact Collection Logic (Sub-Epic: 050_Detailed Domain Specifications (Part 15))

## Covered Requirements
- [2_TAS-REQ-122]

## Dependencies
- depends_on: ["01_executor_preparation_sequence.md"]
- shared_components: ["devs-executor (Consumer)", "devs-checkpoint (Consumer)"]

## 1. Initial Test Written
- [ ] Create `crates/devs-executor/tests/artifact_collection.rs` with the following tests:
- [ ] `test_collect_artifacts_not_called_on_failure`: Simulate a stage failure. Assert `collect_artifacts()` is NOT invoked (unless `auto_collect` is configured).
- [ ] `test_collect_artifacts_not_called_on_timeout`: Simulate a stage timeout. Assert `collect_artifacts()` is NOT invoked (unless `auto_collect` is configured).
- [ ] `test_collect_artifacts_not_called_on_cancel`: Simulate a stage cancellation. Assert `collect_artifacts()` is NOT invoked (unless `auto_collect` is configured).
- [ ] `test_collect_artifacts_called_on_success`: Simulate a successful stage. Assert `collect_artifacts()` IS invoked.
- [ ] `test_auto_collect_called_on_failure_when_configured`: Set `auto_collect = true`. Simulate a stage failure. Assert `collect_artifacts()` IS invoked.
- [ ] `test_auto_collect_runs_git_add_all`: Mock git commands. Assert `git -C <working_dir> add -A` is executed.
- [ ] `test_auto_collect_skips_commit_when_no_changes`: Mock `git diff --cached --quiet` returning exit code 0. Assert no `git commit` is called.
- [ ] `test_auto_collect_commits_when_changes_present`: Mock `git diff --cached --quiet` returning exit code 1 (changes present). Assert `git commit` is called with message `"devs: auto-collect stage <name> run <run-id>"` and author `devs <devs@localhost>`.
- [ ] `test_auto_collect_pushes_to_checkpoint_branch_only`: Assert `git push` targets only the configured checkpoint branch. Assert no push to any other branch.
- [ ] `test_auto_collect_commit_message_format`: Verify the commit message exactly matches `"devs: auto-collect stage <stage_name> run <run_id>"`.
- [ ] `test_auto_collect_commit_author`: Verify the git author is set to `devs <devs@localhost>`.

## 2. Task Implementation
- [ ] In `crates/devs-executor/src/artifacts.rs`, implement `collect_artifacts(env: &WorkingEnvironment, mode: ArtifactMode, stage_name: &str, run_id: &RunId) -> Result<()>`:
  1. Match on `ArtifactMode::AutoCollect`:
     a. Run `git -C <working_dir> add -A`.
     b. Run `git -C <working_dir> diff --cached --quiet`. If exit code 0 (no changes), return Ok (no changes).
     c. Run `git -C <working_dir> commit -m "devs: auto-collect stage <name> run <run-id>" --author="devs <devs@localhost>"`.
     d. Run `git -C <working_dir> push origin <checkpoint_branch>`.
  2. Match on `ArtifactMode::AgentDriven`: no-op (agent handles its own commits).
- [ ] In the stage completion handler (caller of `collect_artifacts`), add gating logic:
  - Only call `collect_artifacts()` on successful completion by default.
  - If `auto_collect` is configured on the stage, also call on failure/timeout/cancel.

## 3. Code Review
- [ ] Verify the 4-step git sequence (add, diff, commit, push) matches the requirement exactly.
- [ ] Verify push targets ONLY the checkpoint branch — no hardcoded branch names.
- [ ] Verify commit author is `devs <devs@localhost>` — not the system user.
- [ ] Verify the gating logic correctly distinguishes success vs failure/timeout/cancel cases.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-executor --test artifact_collection` and confirm all tests pass.

## 5. Update Documentation
- [ ] Add doc comments to `collect_artifacts()` referencing `[2_TAS-REQ-122]`.

## 6. Automated Verification
- [ ] Run `cargo test -p devs-executor --test artifact_collection 2>&1 | tail -1` and verify output shows `test result: ok`.
- [ ] Run `cargo clippy -p devs-executor -- -D warnings` and verify zero warnings.
