# Task: Implement DockerExecutor (Sub-Epic: 08_Execution Environments)

## Covered Requirements
- [2_TAS-REQ-041], [2_TAS-REQ-042], [2_TAS-REQ-043]

## Dependencies
- depends_on: ["01_executor_trait.md"]
- shared_components: [devs-executor (owner)]

## 1. Initial Test Written
- [ ] Add `bollard` as a dependency to `devs-executor` for Docker API interaction. Add `mockall` as a dev-dependency for mocking.
- [ ] Create `crates/devs-executor/src/docker.rs` with a test module. Define a `DockerApi` trait that wraps the bollard methods used (`create_container`, `start_container`, `exec_create`, `exec_start`, `remove_container`, `inspect_image`, `create_image`). This enables mocking without requiring a real Docker daemon.
- [ ] Write the following tests using a mock `DockerApi`:
  - `test_prepare_creates_container_with_correct_name`: Call `prepare()` with `run_id` and `stage_name = "test"`. Assert the container creation request uses name `devs-<run-id>-test`.
  - `test_prepare_clone_path_is_workspace_repo`: Assert the `git clone` exec command targets `/workspace/repo/` inside the container per [2_TAS-REQ-041].
  - `test_prepare_shallow_clone_default`: Assert the exec command includes `--depth 1` when `full_clone` is `false` per [2_TAS-REQ-042].
  - `test_prepare_full_clone_when_configured`: Assert the exec command does NOT include `--depth 1` when `full_clone` is `true`.
  - `test_prepare_uses_custom_docker_host`: When `docker_host` is `Some("tcp://remote:2375")`, assert the `Docker` client is constructed with that endpoint.
  - `test_prepare_uses_default_docker_host`: When `docker_host` is `None`, assert the `Docker` client connects via the default socket.
  - `test_cleanup_removes_container`: Call `cleanup()`. Assert `remove_container` is called with `force: true` on the container.
  - `test_cleanup_logs_warn_on_failure`: Mock `remove_container` to return an error. Assert `cleanup()` returns `Ok(())` and a `WARN` log is emitted per [2_TAS-REQ-043].
  - `test_prepare_pulls_image_if_not_present`: Mock `inspect_image` to return a 404 error. Assert `create_image` (pull) is called before container creation.
  - `test_execution_handle_contains_container_id`: Assert the `ExecutionHandle` state can be downcast to retrieve the container ID string.

## 2. Task Implementation
- [ ] Define the `DockerApi` trait in `crates/devs-executor/src/docker.rs` wrapping required bollard operations. Implement it for `bollard::Docker`.
- [ ] Implement `DockerExecutor` struct with a field `docker: Arc<dyn DockerApi + Send + Sync>`.
- [ ] Implement a constructor `DockerExecutor::new(docker_host: Option<&str>) -> Result<Self>` that creates a bollard `Docker` client with the given host or default.
- [ ] Implement `StageExecutor for DockerExecutor`:
  - **`prepare()`**:
    1. Check if the specified image exists locally via `inspect_image`. If not, pull it via `create_image`.
    2. Create a container named `devs-<run-id>-<stage-name>` from the image. Set working directory to `/workspace`. Inject `ctx.env_vars` as container environment variables.
    3. Start the container.
    4. Exec `git clone [--depth 1] <repo_url> /workspace/repo/` inside the container.
    5. Return `ExecutionHandle` with `working_dir = PathBuf::from("/workspace/repo/")`, container ID stored in state.
  - **`collect_artifacts()`**: Stub returning `Ok(())`.
  - **`cleanup()`**:
    1. Downcast handle state to get container ID.
    2. Call `remove_container` with `force: true` and `v: true` (remove volumes).
    3. On failure, log at `WARN` and return `Ok(())` per [2_TAS-REQ-043].
- [ ] Add `#[instrument]` tracing on each method.

## 3. Code Review
- [ ] Verify container clone path is `/workspace/repo/` per [2_TAS-REQ-041].
- [ ] Verify shallow clone logic per [2_TAS-REQ-042].
- [ ] Verify cleanup does not propagate errors per [2_TAS-REQ-043].
- [ ] Verify `DockerApi` trait abstraction enables full unit testing without a Docker daemon.
- [ ] Verify container naming convention `devs-<run-id>-<stage-name>` is consistent.
- [ ] Verify `DOCKER_HOST` override is respected when `docker_host` is `Some`.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-executor docker` and verify all tests pass.
- [ ] Run `cargo clippy -p devs-executor -- -D warnings` and verify zero warnings.

## 5. Update Documentation
- [ ] Add `// Covers: 2_TAS-REQ-041` annotation above the clone path logic.
- [ ] Add `// Covers: 2_TAS-REQ-042` annotation above the shallow clone logic.
- [ ] Add `// Covers: 2_TAS-REQ-043` annotation above the cleanup implementation.
- [ ] Add doc comments to `DockerExecutor`, `DockerApi` trait, and all implementations.

## 6. Automated Verification
- [ ] Run `./do test` and confirm all `docker` tests pass.
- [ ] Run `./do lint` and confirm no lint failures.
