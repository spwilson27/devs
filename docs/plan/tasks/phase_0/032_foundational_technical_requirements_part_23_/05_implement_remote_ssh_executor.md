# Task: Implement RemoteSshExecutor logic (Sub-Epic: 032_Foundational Technical Requirements (Part 23))

## Covered Requirements
- [2_TAS-REQ-044B]

## Dependencies
- depends_on: [none]
- shared_components: [devs-executor, devs-core]

## 1. Initial Test Written
- [ ] Create a unit test for `RemoteSshExecutor` in `devs-executor/tests/remote_ssh.rs`.
- [ ] Mock the SSH connection (using `ssh2` or a mock layer).
- [ ] Verify that it establishes a connection using `ssh_config` parameters.
- [ ] Verify that `git clone` is executed over the SSH channel.
- [ ] Verify that the `DEVS_MCP_ADDR` is correctly set in the remote environment.
- [ ] Verify that stdout/stderr from the remote process are correctly streamed.

## 2. Task Implementation
- [ ] Implement the `RemoteSshExecutor` struct and the `StageExecutor` trait in `devs-executor`.
- [ ] Integrate the `ssh2` crate for establishing SSH sessions. Note: If `ssh2` is not yet in the authoritative `[dependencies]` list in `docs/plan/requirements/2_tas.md` [2_TAS-REQ-005], add it there first per [2_TAS-REQ-007B].
- [ ] Implement `prepare()`: establish session, run `git clone` on remote host, create `~/devs-runs/<run-id>-<stage-name>/repo/`.
- [ ] Implement the logic for `SCPing` the context file to the remote machine.
- [ ] Implement the execution logic: Invoke the agent CLI via SSH exec channel with full environment.
- [ ] Implement real-time log streaming from remote stdout/stderr to local logs.
- [ ] Ensure that `DEVS_MCP_ADDR` is set to the externally-reachable address of the `devs` server.

## 3. Code Review
- [ ] Verify that the `ssh_config` mapping is correct (HostName, User, Port, etc.).
- [ ] Ensure that SSH connection drops result in a stage `Failed` state with error `"SSH connection lost"`.
- [ ] Confirm that `DEVS_MCP_ADDR` defaults correctly if `server.external_addr` is not set.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-executor --test remote_ssh` (requires a mock SSH server or a local test setup).

## 5. Update Documentation
- [ ] Update `devs-executor` documentation regarding the SSH executor and its configuration.

## 6. Automated Verification
- [ ] Run `./do lint` and `./do test` to ensure 100% pass and traceability.
