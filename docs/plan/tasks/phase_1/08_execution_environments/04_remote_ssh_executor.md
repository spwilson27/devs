# Task: Implement RemoteSshExecutor (Sub-Epic: 08_Execution Environments)

## Covered Requirements
- [2_TAS-REQ-041], [2_TAS-REQ-042], [2_TAS-REQ-043]

## Dependencies
- depends_on: ["01_executor_trait.md"]
- shared_components: [devs-executor (owner)]

## 1. Initial Test Written
- [ ] Add `russh` (or `ssh2`) as a dependency to `devs-executor` for SSH communication. Add `mockall` as a dev-dependency if not already present.
- [ ] Create `crates/devs-executor/src/remote_ssh.rs` with a test module. Define an `SshSession` trait wrapping the SSH operations used (`connect`, `exec_command`, `disconnect`). This enables mocking without requiring a real SSH server.
- [ ] Write the following tests using a mock `SshSession`:
  - `test_prepare_creates_correct_remote_path`: Call `prepare()` with `run_id` and `stage_name = "deploy"`. Assert the `mkdir -p` command targets `~/devs-runs/<run-id>-deploy/repo/` per [2_TAS-REQ-041].
  - `test_prepare_shallow_clone_default`: Assert the executed git clone command includes `--depth 1` when `full_clone` is `false` per [2_TAS-REQ-042].
  - `test_prepare_full_clone_when_configured`: Assert git clone does NOT include `--depth 1` when `full_clone` is `true`.
  - `test_prepare_uses_ssh_config_values`: Provide `ssh_config` with `HostName`, `User`, `Port` entries. Assert the SSH connection uses these values.
  - `test_prepare_sets_devs_mcp_addr`: When `server_addr` is `Some("myhost:50051")`, assert the remote environment includes `DEVS_MCP_ADDR=myhost:50051`.
  - `test_prepare_devs_mcp_addr_not_set_when_none`: When `server_addr` is `None`, assert `DEVS_MCP_ADDR` is not injected.
  - `test_cleanup_removes_remote_directory`: Call `cleanup()`. Assert `rm -rf ~/devs-runs/<run-id>-<stage-name>/` is executed on the remote.
  - `test_cleanup_logs_warn_on_ssh_failure`: Mock SSH exec to return an error during cleanup. Assert `cleanup()` returns `Ok(())` and a `WARN` log is emitted per [2_TAS-REQ-043].
  - `test_cleanup_logs_warn_on_nonzero_exit`: Mock SSH exec to return exit code 1 for the `rm -rf`. Assert `cleanup()` returns `Ok(())` with `WARN` log.
  - `test_execution_handle_stores_remote_info`: Assert the `ExecutionHandle` state can be downcast to retrieve SSH session/host information for later cleanup.

## 2. Task Implementation
- [ ] Define the `SshSession` trait in `crates/devs-executor/src/remote_ssh.rs`:
  ```rust
  #[async_trait]
  pub(crate) trait SshSession: Send + Sync {
      async fn connect(config: &HashMap<String, String>) -> Result<Self> where Self: Sized;
      async fn exec_command(&self, command: &str) -> Result<(i32, String, String)>;
      async fn disconnect(&self) -> Result<()>;
  }
  ```
- [ ] Implement `SshSession` for the chosen SSH library's session type. Use `spawn_blocking` for any blocking SSH operations.
- [ ] Implement `RemoteSshExecutor` struct with no stored fields (config comes from `StageContext`).
- [ ] Implement `StageExecutor for RemoteSshExecutor`:
  - **`prepare()`**:
    1. Extract SSH connection parameters from `ctx.execution_env` (the `Remote` variant's `ssh_config` HashMap).
    2. Establish an SSH connection using the `SshSession` trait.
    3. Execute `mkdir -p ~/devs-runs/<run-id>-<stage-name>/` on the remote.
    4. Execute `git clone [--depth 1] <repo_url> ~/devs-runs/<run-id>-<stage-name>/repo/` on the remote.
    5. If `server_addr` is `Some(addr)`, prepend `DEVS_MCP_ADDR=<addr>` to subsequent commands' environment.
    6. Store the SSH session (or reconnection config) in the `ExecutionHandle` state.
    7. Return `ExecutionHandle` with `working_dir = PathBuf::from(format!("~/devs-runs/{}-{}/repo/", run_id, stage_name))`.
  - **`collect_artifacts()`**: Stub returning `Ok(())`.
  - **`cleanup()`**:
    1. Downcast handle state to get SSH session/config.
    2. Reconnect if needed, execute `rm -rf ~/devs-runs/<run-id>-<stage-name>/`.
    3. On any failure (connection, command, non-zero exit), log at `WARN` and return `Ok(())` per [2_TAS-REQ-043].
    4. Disconnect the SSH session.
- [ ] Add `#[instrument]` tracing on each method.

## 3. Code Review
- [ ] Verify remote clone path is `~/devs-runs/<run-id>-<stage-name>/repo/` per [2_TAS-REQ-041].
- [ ] Verify shallow clone logic per [2_TAS-REQ-042].
- [ ] Verify cleanup never propagates errors per [2_TAS-REQ-043].
- [ ] Verify `SshSession` trait abstraction enables full unit testing without a real SSH server.
- [ ] Verify SSH config keys from the HashMap are correctly mapped to connection parameters.
- [ ] Verify `DEVS_MCP_ADDR` injection only when `server_addr` is `Some`.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-executor remote_ssh` and verify all tests pass.
- [ ] Run `cargo clippy -p devs-executor -- -D warnings` and verify zero warnings.

## 5. Update Documentation
- [ ] Add `// Covers: 2_TAS-REQ-041` annotation above the remote clone path logic.
- [ ] Add `// Covers: 2_TAS-REQ-042` annotation above the shallow clone logic.
- [ ] Add `// Covers: 2_TAS-REQ-043` annotation above the cleanup implementation.
- [ ] Add doc comments to `RemoteSshExecutor`, `SshSession` trait, and all implementations.

## 6. Automated Verification
- [ ] Run `./do test` and confirm all `remote_ssh` tests pass.
- [ ] Run `./do lint` and confirm no lint failures.
