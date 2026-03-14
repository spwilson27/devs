# Task: Implement Auto-Collect for DockerExecutor (Sub-Epic: 09_Artifact Collection)

## Covered Requirements
- [2_TAS-REQ-044], [1_PRD-REQ-023]

## Dependencies
- depends_on: ["01_define_artifact_collection_strategy_schema.md", "02_implement_local_auto_collect.md"]
- shared_components: [devs-executor (consumer — implement collect_artifacts for Docker target)]

## 1. Initial Test Written
- [ ] In `crates/devs-executor/src/docker.rs` (or `crates/devs-executor/tests/docker_auto_collect.rs`), write integration tests using a mock/trait-based Docker command executor (do NOT require a real Docker daemon for unit tests):
  - `test_docker_auto_collect_executes_git_sequence`:
    1. Create a `MockDockerExec` that records all commands executed via `docker exec`.
    2. Configure `DockerExecutor` with container ID `"test-container-abc"`, working dir `/workspace/repo`, checkpoint branch `devs/state`.
    3. Call `collect_artifacts` with `ArtifactMode::AutoCollect`.
    4. Assert `MockDockerExec` received exactly 4 commands in order:
       - `docker exec test-container-abc git -C /workspace/repo diff --quiet` (simulated exit code 1 = has changes)
       - `docker exec test-container-abc git -C /workspace/repo add -A`
       - `docker exec test-container-abc git -C /workspace/repo commit -m "devs: auto-collect stage <name> run <id>"`
       - `docker exec test-container-abc git -C /workspace/repo push origin HEAD:devs/state`
  - `test_docker_auto_collect_no_changes_skips`:
    1. Mock `git diff --quiet` returning exit code 0.
    2. Call `collect_artifacts` with `AutoCollect`.
    3. Assert only the diff command was executed (no add, commit, or push).
  - `test_docker_auto_collect_agent_driven_is_noop`:
    1. Call `collect_artifacts` with `ArtifactMode::AgentDriven`.
    2. Assert zero docker exec calls.
  - `test_docker_auto_collect_push_failure_propagates_error`:
    1. Mock push returning exit code 128 with stderr `"fatal: remote error"`.
    2. Assert `collect_artifacts` returns `Err` containing the stderr message.
- [ ] Annotate all tests with `// Covers: 2_TAS-REQ-044`.

## 2. Task Implementation
- [ ] Define a `DockerCommandExecutor` trait (or reuse existing Docker abstraction) that `DockerExecutor` uses to run commands inside containers. This enables test mocking without a real Docker daemon.
  ```rust
  #[async_trait]
  pub trait DockerCommandRunner: Send + Sync {
      async fn exec_in_container(&self, container_id: &str, cmd: &[&str]) -> Result<CommandOutput, ExecutorError>;
  }
  ```
- [ ] Implement `DockerExecutor::collect_artifacts`:
  1. If `mode == AgentDriven`, return `Ok(())`.
  2. Run `git -C {repo_path} diff --quiet` via `exec_in_container`. If exit 0, return `Ok(())`.
  3. Run `git -C {repo_path} add -A`.
  4. Run `git -C {repo_path} commit -m "devs: auto-collect stage {stage_name} run {run_id}"`.
  5. Run `git -C {repo_path} push origin HEAD:{checkpoint_branch}`.
  6. On any non-zero exit, return `ExecutorError` with captured stderr.
- [ ] The repo path inside the container is `/workspace/repo/` (or configurable via `WorkingEnvironment`).

## 3. Code Review
- [ ] Verify all git commands use `git -C <path>` to avoid `cd` shell state issues inside containers.
- [ ] Verify push targets only the checkpoint branch.
- [ ] Verify the `DockerCommandRunner` trait is mockable for tests.
- [ ] Verify error messages include the container ID for debugging.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-executor -- docker_auto_collect` and confirm all 4 tests pass.

## 5. Update Documentation
- [ ] Add doc comments to `DockerExecutor::collect_artifacts` explaining Docker-specific behavior.

## 6. Automated Verification
- [ ] Run `./do test` — all tests must pass.
- [ ] Run `./do lint` — must pass with zero warnings.
