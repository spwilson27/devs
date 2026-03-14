# Task: RemoteSshExecutor Requirements Contract and Types (Sub-Epic: 032_Foundational Technical Requirements (Part 23))

## Covered Requirements
- [2_TAS-REQ-044B]

## Dependencies
- depends_on: ["none"]
- shared_components: ["devs-core (consumer — uses domain types)", "devs-executor (owner in Phase 1 — this task defines the foundational contract)"]

## 1. Initial Test Written
- [ ] Create a test module in `devs-core` (e.g., `src/executor/ssh.rs` tests or `tests/ssh_executor_contract.rs`) with the following test cases written before any implementation:
  1. **`test_ssh_config_requires_host`**: Construct a `RemoteSshExecutorConfig` without a `host` field. Assert validation returns an error.
  2. **`test_ssh_config_default_port_22`**: Construct config with no explicit port. Assert it defaults to `22`.
  3. **`test_ssh_config_custom_port`**: Set `port` to `2222`. Assert it is stored correctly.
  4. **`test_ssh_config_ssh_config_path_optional`**: Assert `ssh_config_path` defaults to `None`, meaning the system default `~/.ssh/config` is used.
  5. **`test_ssh_config_custom_ssh_config_path`**: Set `ssh_config_path` to `"/etc/ssh/custom_config"`. Assert it is stored and retrievable.
  6. **`test_ssh_config_clone_via_exec_channel`**: Assert the config documents that repo cloning is done via SSH exec channel (`ssh2::Channel::exec`), not via SCP of the entire repo.
  7. **`test_ssh_config_context_file_via_scp`**: Assert the config has a `context_file_transfer` field or constant indicating context files are transferred via SCP.
  8. **`test_ssh_config_serde_roundtrip`**: Serialize a `RemoteSshExecutorConfig` to TOML and back. Assert all fields survive the roundtrip.
  9. **`test_ssh_config_user_field`**: Assert the config has a `user` field. Construct with `user = "deploy"` and assert it is stored.
  10. **`test_ssh_config_validate_host_not_empty`**: Set `host` to `""`. Assert validation returns an error.

## 2. Task Implementation
- [ ] In `devs-core`, define:
  ```rust
  #[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
  struct RemoteSshExecutorConfig {
      host: String,
      #[serde(default = "default_ssh_port")]
      port: u16,
      user: String,
      ssh_config_path: Option<PathBuf>,
      identity_file: Option<PathBuf>,
  }
  fn default_ssh_port() -> u16 { 22 }
  ```
- [ ] Implement `RemoteSshExecutorConfig::validate(&self) -> Result<(), CoreError>` that checks `host` and `user` are non-empty.
- [ ] Document that the implementation (in Phase 1 `devs-executor`) will:
  1. Use the `ssh2` crate to establish an SSH session.
  2. Clone the repo on the remote machine via SSH exec channel (`session.channel_session()` → `channel.exec("git clone ...")`).
  3. Transfer the context file to the remote machine via SCP (`session.scp_send()`).
- [ ] Add `// Covers: 2_TAS-REQ-044B` annotations to each test function.

## 3. Code Review
- [ ] Verify default port is 22 and is applied via serde `default` attribute.
- [ ] Verify `ssh_config_path` and `identity_file` are both `Option` — neither is required.
- [ ] Verify no sensitive fields (passwords, keys) are stored in this config struct — authentication is handled by ssh-agent or identity files.
- [ ] Verify the struct derives `Clone` and `PartialEq` for testability.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test ssh_executor` and confirm all 10 tests pass.
- [ ] Run `cargo clippy --all-targets` and confirm no warnings.

## 5. Update Documentation
- [ ] Add doc comments to `RemoteSshExecutorConfig` explaining the ssh2 crate dependency (Phase 1), clone-via-exec-channel strategy, and SCP context file transfer.

## 6. Automated Verification
- [ ] Run `./do test` and confirm the new tests appear in output and pass.
- [ ] Grep test source for `// Covers: 2_TAS-REQ-044B` and confirm the annotation exists at least once.
