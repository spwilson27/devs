# Task: Implement Auto-Collect for RemoteSshExecutor (Sub-Epic: 09_Artifact Collection)

## Covered Requirements
- [2_TAS-REQ-044], [1_PRD-REQ-023]

## Dependencies
- depends_on: [01_define_artifact_collection_strategy_schema.md, 02_implement_local_auto_collect.md]
- shared_components: [devs-executor (consumer — implement collect_artifacts for remote SSH target)]

## 1. Initial Test Written
- [ ] In `crates/devs-executor/src/remote.rs` (or `crates/devs-executor/tests/remote_auto_collect.rs`), write unit tests using a mock SSH command executor trait (do NOT require a real SSH server):
  - `test_ssh_auto_collect_executes_git_sequence`:
    1. Create a `MockSshRunner` that records all commands executed via SSH exec channels.
    2. Configure `RemoteSshExecutor` with remote working dir `~/devs-runs/run-123-build/repo`, checkpoint branch `devs/state`.
    3. Call `collect_artifacts` with `ArtifactMode::AutoCollect`.
    4. Assert `MockSshRunner` received a compound command (or sequential commands) equivalent to:
       - `cd ~/devs-runs/run-123-build/repo && git diff --quiet` (simulated exit 1 = has changes)
       - `cd ~/devs-runs/run-123-build/repo && git add -A`
       - `cd ~/devs-runs/run-123-build/repo && git commit -m "devs: auto-collect stage build run run-123"`
       - `cd ~/devs-runs/run-123-build/repo && git push origin HEAD:devs/state`
  - `test_ssh_auto_collect_no_changes_skips`:
    1. Mock `git diff --quiet` returning exit 0.
    2. Assert only the diff check command was executed.
  - `test_ssh_auto_collect_agent_driven_is_noop`:
    1. Call `collect_artifacts` with `ArtifactMode::AgentDriven`. Assert zero SSH commands.
  - `test_ssh_auto_collect_connection_failure_returns_error`:
    1. Mock SSH runner that returns an IO error on any exec.
    2. Assert `collect_artifacts` returns `Err` with SSH connection context.
  - `test_ssh_auto_collect_push_failure_returns_error`:
    1. Mock push returning exit code 128 with stderr.
    2. Assert `collect_artifacts` returns `Err` containing stderr.
- [ ] Annotate all tests with `// Covers: 2_TAS-REQ-044`.

## 2. Task Implementation
- [ ] Define (or reuse) an `SshCommandRunner` trait for testability:
  ```rust
  #[async_trait]
  pub trait SshCommandRunner: Send + Sync {
      async fn exec_remote(&self, command: &str) -> Result<CommandOutput, ExecutorError>;
  }
  ```
- [ ] Implement `RemoteSshExecutor::collect_artifacts`:
  1. If `mode == AgentDriven`, return `Ok(())`.
  2. Execute `cd {remote_repo_path} && git diff --quiet` via SSH. If exit 0, return `Ok(())`.
  3. Execute `cd {remote_repo_path} && git add -A && git commit -m "devs: auto-collect stage {stage_name} run {run_id}" && git push origin HEAD:{checkpoint_branch}` via SSH.
  4. On any failure, return `ExecutorError` with captured stderr and the remote host identifier for debugging.
- [ ] The remote repo path follows the convention `~/devs-runs/<run-id>-<stage-name>/repo/` as established by the executor's `prepare_environment`.
- [ ] SSH channel errors (connection lost, timeout) are wrapped in `ExecutorError::SshError` with sufficient context.

## 3. Code Review
- [ ] Verify push targets only the checkpoint branch, never `main`.
- [ ] Verify the `SshCommandRunner` trait is mockable for tests.
- [ ] Verify error messages include the remote host and repo path for debugging.
- [ ] Verify the compound command approach handles the `cd` correctly (fails fast if dir doesn't exist).

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-executor -- remote_auto_collect` and confirm all 5 tests pass.

## 5. Update Documentation
- [ ] Add doc comments to `RemoteSshExecutor::collect_artifacts` explaining SSH-specific behavior and error handling.

## 6. Automated Verification
- [ ] Run `./do test` — all tests must pass.
- [ ] Run `./do lint` — must pass with zero warnings.
