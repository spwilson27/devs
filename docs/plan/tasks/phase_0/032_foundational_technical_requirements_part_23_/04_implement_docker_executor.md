# Task: Implement DockerExecutor logic (Sub-Epic: 032_Foundational Technical Requirements (Part 23))

## Covered Requirements
- [2_TAS-REQ-044A]

## Dependencies
- depends_on: [none]
- shared_components: [devs-executor, devs-core]

## 1. Initial Test Written
- [ ] Create an integration test for `DockerExecutor` in `devs-executor/tests/docker.rs` (if possible, or mock the Docker daemon connection).
- [ ] Verify that it uses `DOCKER_HOST` or falls back to platform defaults.
- [ ] Verify that `pull_image` is called before starting the container if it's missing.
- [ ] Verify that the container is created with `--rm` and correctly mounts the workspace at `/workspace/repo/`.
- [ ] Verify that `DEVS_MCP_ADDR` is injected into the container environment.

## 2. Task Implementation
- [ ] Implement the `DockerExecutor` struct and the `StageExecutor` trait for it in `devs-executor`.
- [ ] Use `bollard` crate (v0.17) to interact with the Docker daemon. Note: If `bollard` is not yet in the authoritative `[dependencies]` list in `docs/plan/requirements/2_tas.md` [2_TAS-REQ-005], add it there first per [2_TAS-REQ-007B].
- [ ] Implement `prepare()`: pull image, create container, start container.
- [ ] Implement `docker exec` for performing `git clone` inside the container.
- [ ] Ensure that `DEVS_MCP_ADDR` is correctly mapped based on the platform (host-gateway IP on Linux, `host.docker.internal` on macOS/Windows).
- [ ] Implement `cleanup()` to ensure the container is removed (though `--rm` should handle it, explicit removal on failure is safer).

## 3. Code Review
- [ ] Verify that the implementation uses `DOCKER_HOST` environment variable for daemon connection.
- [ ] Ensure that `DEVS_MCP_ADDR` points to the host's MCP server port correctly from inside the container.
- [ ] Verify that the stage environment variables are passed to the container using `--env` or equivalent.
- [ ] Ensure the container is removed immediately after use.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-executor --test docker` (requires Docker daemon for real test, or use mocks).

## 5. Update Documentation
- [ ] Update `devs-executor` documentation regarding the Docker executor's configuration and behavior.

## 6. Automated Verification
- [ ] Run `./do lint` and `./do test` to ensure 100% compliance.
