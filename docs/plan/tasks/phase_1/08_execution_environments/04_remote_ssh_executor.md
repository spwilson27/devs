# Task: Implement RemoteSshExecutor (Sub-Epic: 08_Execution Environments)

## Covered Requirements
- [2_TAS-REQ-041], [2_TAS-REQ-042], [2_TAS-REQ-043]

## Dependencies
- depends_on: [01_executor_trait.md]
- shared_components: [devs-executor]

## 1. Initial Test Written
- [ ] Create an integration test in `devs-executor/src/remote.rs` (or equivalent) that:
    - Mocks the SSH server (using a library or a mock `ssh2` Session).
    - Calls `prepare` on a `RemoteSshExecutor`.
    - Verifies that the clone path is `~/devs-runs/<run-id>-<stage-name>/repo/` on the remote host.
    - Verifies that a shallow clone (`--depth 1`) is used.
    - Verifies that `cleanup` removes the remote directory.

## 2. Task Implementation
- [ ] Add `ssh2` dependency for SSH communication.
- [ ] Implement `RemoteSshExecutor` struct.
- [ ] Implement `prepare` method:
    - Establish an SSH session using the provided `ssh_config`.
    - Create the remote directory `~/devs-runs/<run-id>-<stage-name>/repo/`.
    - Run `git clone <repo_url> ~/devs-runs/<run-id>-<stage-name>/repo/` via the SSH channel.
    - Use `--depth 1` unless `full_clone` is `true`.
- [ ] Implement `cleanup` method:
    - Remove the remote directory `~/devs-runs/<run-id>-<stage-name>/` using `rm -rf`.
    - Cleanup failures MUST be logged at `WARN` level.
- [ ] Implement `collect_artifacts` (can be a simple stub for now).

## 3. Code Review
- [ ] Verify clone path on remote host matches `2_TAS-REQ-041`.
- [ ] Verify shallow clone logic against `2_TAS-REQ-042`.
- [ ] Verify cleanup robustness and logging against `2_TAS-REQ-043`.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-executor --lib remote` (ensure mock SSH server is used).

## 5. Update Documentation
- [ ] Update `GEMINI.md` memory to reflect the implementation of `RemoteSshExecutor`.

## 6. Automated Verification
- [ ] Run `./do test` and check for successful SSH connection and cleanup logs.
