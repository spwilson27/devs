# Task: Define Stage Executor Preparation Sequence (Sub-Epic: 050_Detailed Domain Specifications (Part 15))

## Covered Requirements
- [2_TAS-REQ-121]

## Dependencies
- depends_on: [none]
- shared_components: [devs-core, devs-executor]

## 1. Initial Test Written
- [ ] Create unit tests in `crates/devs-executor/src/lib.rs` (or equivalent test module) for the `prepare()` method of the `StageExecutor` trait.
- [ ] For `LocalTempDirExecutor`, write a test that mocks the filesystem and git commands to verify it creates the correct directory structure and performs a shallow clone.
- [ ] For `DockerExecutor`, write a test verifying it pulls the correct image and starts a container with the required environment variables (especially `DEVS_MCP_ADDR`).
- [ ] For `RemoteSshExecutor`, write a test verifying it establishes an SSH session and creates the remote directory structure.

## 2. Task Implementation
- [ ] Implement the `prepare()` logic for `LocalTempDirExecutor`:
    - Create the directory `<os-tempdir>/devs-<run-id>-<stage-name>/repo/`.
    - Execute `git clone --depth 1 <repo_url> repo/` (supporting `full_clone` override).
    - Write `.devs_context.json` to the working directory using an atomic write.
- [ ] Implement the `prepare()` logic for `DockerExecutor`:
    - Pull the specified Docker image using the Docker API via `DOCKER_HOST`.
    - Create and start a container with `--rm` and inject `DEVS_MCP_ADDR` and all stage-specific environment variables.
    - Run `git clone` inside the container via `docker exec`.
    - Copy `.devs_context.json` into the container's working directory.
- [ ] Implement the `prepare()` logic for `RemoteSshExecutor`:
    - Establish an SSH session using the `ssh2` crate and `ssh_config` parameters.
    - Create the remote directory `~/devs-runs/<run-id>-<stage-name>/repo/`.
    - Execute `git clone` over the SSH exec channel.
    - SCP `.devs_context.json` to the remote working directory.
- [ ] Ensure all implementations return a valid `ExecutionHandle`.

## 3. Code Review
- [ ] Verify that all three executors follow the exact sequence specified in [2_TAS-REQ-121].
- [ ] Ensure atomic writes are used for `.devs_context.json`.
- [ ] Check that `DEVS_MCP_ADDR` is correctly injected in the `DockerExecutor` environment.
- [ ] Confirm that error handling is robust (e.g., git clone failure, directory creation failure).

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-executor` to ensure all `prepare()` implementations pass their unit tests.

## 5. Update Documentation
- [ ] Add doc comments to the `StageExecutor` trait and its implementations explaining the preparation sequence.
- [ ] Update the `devs-executor` README or module-level documentation.

## 6. Automated Verification
- [ ] Run `./do lint` to verify doc comments and formatting.
- [ ] Run `cargo clippy -p devs-executor` to ensure code quality.
