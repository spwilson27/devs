# Task: Executor Preparation Sequence Logic (Sub-Epic: 050_Detailed Domain Specifications (Part 15))

## Covered Requirements
- [2_TAS-REQ-121]

## Dependencies
- depends_on: ["none"]
- shared_components: ["devs-executor (Consumer)", "devs-core (Consumer)"]

## 1. Initial Test Written
- [ ] Create `crates/devs-executor/tests/preparation_sequence.rs` with tests for all three executor types:
- [ ] **LocalTempDirExecutor tests:**
  - `test_local_prepare_creates_temp_dir_with_correct_path_pattern`: Assert directory matches `<os-tempdir>/devs-<run-id>-<stage-name>/repo/` pattern. Use a mock run-id `"abc123"` and stage name `"build"`. Verify the directory exists after `prepare()`.
  - `test_local_prepare_runs_shallow_clone_by_default`: Mock or stub the git clone call. Assert `--depth 1` is passed. Verify the repo URL and target path are correct.
  - `test_local_prepare_runs_full_clone_when_configured`: Set `full_clone = true` in config. Assert `--depth 1` is NOT passed.
  - `test_local_prepare_writes_context_file_atomically`: After `prepare()`, assert `.devs_context.json` exists in the working dir. Verify it was written atomically (temp file + rename pattern — mock filesystem or check for no partial writes).
  - `test_local_prepare_returns_execution_handle`: Assert the returned `ExecutionHandle` contains the correct working directory path.
- [ ] **DockerExecutor tests:**
  - `test_docker_prepare_pulls_image_if_missing`: Mock Docker API. Assert image pull is called when image is not present locally.
  - `test_docker_prepare_skips_pull_if_image_present`: Mock Docker API with image already present. Assert no pull call.
  - `test_docker_prepare_creates_container_with_correct_flags`: Assert container creation includes `--rm`, `--env DEVS_MCP_ADDR=<host-gateway>:<mcp_port>`, and all stage env vars.
  - `test_docker_prepare_clones_repo_inside_container`: Assert `docker exec` is called with `git clone` command inside the container.
  - `test_docker_prepare_copies_context_file_into_container`: Assert `.devs_context.json` is copied to `/workspace/repo/` inside container.
  - `test_docker_prepare_returns_handle_with_container_id`: Assert `ExecutionHandle` contains `docker_container_id`.
- [ ] **RemoteSshExecutor tests:**
  - `test_ssh_prepare_establishes_session_from_ssh_config`: Mock `ssh2` crate. Assert session is established with correct host, port, and auth from `ssh_config`.
  - `test_ssh_prepare_creates_remote_directory`: Assert remote directory `~/devs-runs/<run-id>-<stage-name>/repo/` is created via SSH exec channel.
  - `test_ssh_prepare_clones_repo_remotely`: Assert `git clone` is executed over SSH exec channel.
  - `test_ssh_prepare_scps_context_file`: Assert `.devs_context.json` is SCP'd to remote working dir.
  - `test_ssh_prepare_returns_handle_with_ssh_session`: Assert `ExecutionHandle` contains `ssh_session`.

## 2. Task Implementation
- [ ] In `crates/devs-executor/src/local.rs`, implement `LocalTempDirExecutor::prepare()`:
  1. Use `std::env::temp_dir()` to get OS temp dir.
  2. Create directory `devs-<run_id>-<stage_name>/repo/` under temp dir.
  3. Shell out to `git clone --depth 1 <repo_url> <path>` (or without `--depth 1` if `full_clone` is set).
  4. Write `.devs_context.json` atomically using temp-file + rename in the repo directory.
  5. Return `ExecutionHandle { working_dir, .. }`.
- [ ] In `crates/devs-executor/src/docker.rs`, implement `DockerExecutor::prepare()`:
  1. Check if image exists via Docker API (using `DOCKER_HOST` config).
  2. Pull image if missing.
  3. Create container with `--rm`, env vars including `DEVS_MCP_ADDR=<host-gateway>:<mcp_port>`, and all stage env vars.
  4. Start container.
  5. Execute `git clone` inside container via `docker exec`.
  6. Copy `.devs_context.json` into `/workspace/repo/` via `docker cp`.
  7. Return `ExecutionHandle { docker_container_id, .. }`.
- [ ] In `crates/devs-executor/src/remote.rs`, implement `RemoteSshExecutor::prepare()`:
  1. Establish SSH session using `ssh2` crate with `ssh_config` parameters.
  2. Create `~/devs-runs/<run-id>-<stage-name>/repo/` via SSH exec.
  3. Execute `git clone` via SSH exec channel.
  4. SCP `.devs_context.json` to remote working dir.
  5. Return `ExecutionHandle { ssh_session, .. }`.
- [ ] Define `ExecutionHandle` enum/struct in `crates/devs-executor/src/handle.rs` with variants for local (working_dir), docker (container_id), and ssh (session).

## 3. Code Review
- [ ] Verify each executor type follows the exact step ordering from the requirement.
- [ ] Verify atomic write pattern (temp file + rename) for `.devs_context.json` in all three executors.
- [ ] Verify `ExecutionHandle` carries the correct metadata per executor type.
- [ ] Verify no `unwrap()` calls — all errors are propagated via `Result`.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-executor --test preparation_sequence` and confirm all tests pass.

## 5. Update Documentation
- [ ] Add doc comments to each executor's `prepare()` method referencing `[2_TAS-REQ-121]`.

## 6. Automated Verification
- [ ] Run `cargo test -p devs-executor --test preparation_sequence 2>&1 | tail -1` and verify output shows `test result: ok`.
- [ ] Run `cargo clippy -p devs-executor -- -D warnings` and verify zero warnings.
