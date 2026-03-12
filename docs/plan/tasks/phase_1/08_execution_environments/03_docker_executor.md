# Task: Implement DockerExecutor (Sub-Epic: 08_Execution Environments)

## Covered Requirements
- [2_TAS-REQ-041], [2_TAS-REQ-042], [2_TAS-REQ-043]

## Dependencies
- depends_on: [01_executor_trait.md]
- shared_components: [devs-executor]

## 1. Initial Test Written
- [ ] Create an integration test in `devs-executor/src/docker.rs` (or equivalent) that:
    - Mocks the Docker daemon (using `bollard`'s mock or a similar approach).
    - Calls `prepare` on a `DockerExecutor`.
    - Verifies that the clone path is `/workspace/repo/` inside the container.
    - Verifies that the container is started with `--rm`.
    - Verifies that a shallow clone (`--depth 1`) is used.
    - Verifies that `cleanup` removes the container.

## 2. Task Implementation
- [ ] Add `bollard` dependency for Docker API interaction.
- [ ] Implement `DockerExecutor` struct.
- [ ] Implement `prepare` method:
    - Pull the specified image if not present locally.
    - Create and start a container with the name `devs-<run-id>-<stage-name>`.
    - Set the working directory to `/workspace/repo/`.
    - Run `git clone <repo_url> /workspace/repo/` inside the container using `docker exec`.
    - Use `--depth 1` unless `full_clone` is `true`.
- [ ] Implement `cleanup` method:
    - Ensure the container is stopped and removed.
    - Cleanup failures MUST be logged at `WARN` level.
- [ ] Implement `collect_artifacts` (can be a simple stub for now).

## 3. Code Review
- [ ] Verify clone path inside container matches `2_TAS-REQ-041`.
- [ ] Verify shallow clone logic against `2_TAS-REQ-042`.
- [ ] Verify cleanup robustness and logging against `2_TAS-REQ-043`.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-executor --lib docker` (ensure Docker daemon is available for integration tests).

## 5. Update Documentation
- [ ] Update `GEMINI.md` memory to reflect the implementation of `DockerExecutor`.

## 6. Automated Verification
- [ ] Run `./do test` and check for successful container creation and destruction logs.
