# Task: Implement LocalTempDirExecutor (Sub-Epic: 08_Execution Environments)

## Covered Requirements
- [2_TAS-REQ-041], [2_TAS-REQ-042], [2_TAS-REQ-043]

## Dependencies
- depends_on: ["01_executor_trait.md"]
- shared_components: [devs-executor (owner)]

## 1. Initial Test Written
- [ ] Create `crates/devs-executor/src/local_tempdir.rs` with a test module. Write the following tests:
  - `test_prepare_creates_correct_path`: Call `prepare()` with `run_id = Uuid::from_u128(1)` and `stage_name = "build"`. Assert the returned `ExecutionHandle.working_dir()` matches `<std::env::temp_dir()>/devs-<run_id>-build/repo/` (exact path format per [2_TAS-REQ-041]).
  - `test_prepare_shallow_clone_by_default`: Set up a bare git repo in a temp directory as the "remote". Call `prepare()` with `ExecutionEnv::Tempdir { full_clone: false }`. After prepare completes, run `git log --oneline` in the cloned repo and assert there is exactly 1 commit (shallow clone).
  - `test_prepare_full_clone_when_configured`: Same bare repo setup. Call `prepare()` with `ExecutionEnv::Tempdir { full_clone: true }`. Assert `git log --oneline` shows all commits (more than 1; create at least 3 commits in the bare repo fixture).
  - `test_cleanup_removes_entire_directory`: Call `prepare()`, then `cleanup()`. Assert `<os-tempdir>/devs-<run-id>-<stage-name>/` directory no longer exists.
  - `test_cleanup_succeeds_even_if_dir_already_removed`: Manually delete the working directory before calling `cleanup()`. Assert `cleanup()` returns `Ok(())` (does not error). Verify a `WARN`-level log is emitted by using `tracing_test` or `tracing_subscriber::fmt::TestWriter`.
  - `test_cleanup_runs_after_prepare_failure`: Set repo_url to a nonexistent path. Call `prepare()` and expect an error. Create the directory manually to simulate partial state, then call `cleanup()` and assert it succeeds.
  - `test_collect_artifacts_auto_collect_stub`: Call `collect_artifacts()` with `ArtifactMode::AutoCollect`. Assert it returns `Ok(())` (stub behavior for now).

## 2. Task Implementation
- [ ] Implement `LocalTempDirExecutor` struct (no fields needed; all config comes from `StageContext`).
- [ ] Implement `StageExecutor for LocalTempDirExecutor`:
  - **`prepare()`**:
    1. Compute the target directory: `format!("{}/devs-{}-{}", std::env::temp_dir().display(), ctx.run_id, ctx.stage_name)`.
    2. Create the directory with `tokio::fs::create_dir_all(&target_dir).await`.
    3. Spawn a `git clone` command via `tokio::process::Command`:
       - If `full_clone` is `false` (default): `git clone --depth 1 <repo_url> <target_dir>/repo/`.
       - If `full_clone` is `true`: `git clone <repo_url> <target_dir>/repo/`.
    4. Check the exit status. If non-zero, return an error with stderr contents.
    5. Return `ExecutionHandle` with `working_dir = <target_dir>/repo/`, a new `Uuid`, and unit `()` as state.
  - **`collect_artifacts()`**: Stub implementation returning `Ok(())`. Log at `DEBUG` level that artifact collection is not yet implemented.
  - **`cleanup()`**:
    1. Compute the parent directory (strip `/repo/` suffix from `working_dir`).
    2. Call `tokio::fs::remove_dir_all(&parent_dir).await`.
    3. If removal fails, log at `WARN` level with the error message but return `Ok(())` — cleanup failures MUST NOT propagate as errors per [2_TAS-REQ-043].
- [ ] Add `tracing` instrumentation: `#[instrument(skip(self, ctx))]` on each method.

## 3. Code Review
- [ ] Verify clone path structure is exactly `<os-tempdir>/devs-<run-id>-<stage-name>/repo/` per [2_TAS-REQ-041].
- [ ] Verify `--depth 1` is passed when `full_clone` is `false` per [2_TAS-REQ-042].
- [ ] Verify cleanup logs at `WARN` on failure but returns `Ok(())` per [2_TAS-REQ-043].
- [ ] Verify cleanup removes the parent directory (including `/repo/`), not just the repo subdirectory.
- [ ] Verify no `unwrap()` or `expect()` calls in non-test code.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-executor local_tempdir` and verify all tests pass.
- [ ] Run `cargo clippy -p devs-executor -- -D warnings` and verify zero warnings.

## 5. Update Documentation
- [ ] Add `// Covers: 2_TAS-REQ-041` annotation above the `prepare()` implementation (clone path).
- [ ] Add `// Covers: 2_TAS-REQ-042` annotation above the `--depth 1` logic.
- [ ] Add `// Covers: 2_TAS-REQ-043` annotation above the `cleanup()` implementation.
- [ ] Add doc comments to `LocalTempDirExecutor` struct and all trait method implementations.

## 6. Automated Verification
- [ ] Run `./do test` and confirm all `local_tempdir` tests pass.
- [ ] Run `./do lint` and confirm no lint failures.
