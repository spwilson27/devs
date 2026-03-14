# Task: DockerExecutor Requirements Contract and Types (Sub-Epic: 032_Foundational Technical Requirements (Part 23))

## Covered Requirements
- [2_TAS-REQ-044A]

## Dependencies
- depends_on: ["none"]
- shared_components: ["devs-core (consumer — uses domain types)", "devs-executor (owner in Phase 1 — this task defines the foundational contract)"]

## 1. Initial Test Written
- [ ] Create a test module in `devs-core` (e.g., `src/executor/docker.rs` tests or `tests/docker_executor_contract.rs`) with the following test cases written before any implementation:
  1. **`test_docker_config_requires_image`**: Construct a `DockerExecutorConfig` without an image field. Assert validation returns an error indicating image is required.
  2. **`test_docker_config_default_docker_host`**: Construct a `DockerExecutorConfig` with no explicit `docker_host`. Assert it defaults to `None` (meaning the system default `DOCKER_HOST` is used).
  3. **`test_docker_config_custom_docker_host`**: Set `docker_host` to `"tcp://192.168.1.100:2375"`. Assert it is stored and retrievable.
  4. **`test_docker_config_rm_flag_always_set`**: Assert `DockerExecutorConfig` has a method or constant indicating containers are always run with `--rm` (auto-cleanup).
  5. **`test_docker_config_devs_mcp_addr_injected`**: Assert the config includes `DEVS_MCP_ADDR` in its required environment variables list. This env var must be injected into the container so agents can reach the MCP server.
  6. **`test_docker_config_serde_roundtrip`**: Serialize a `DockerExecutorConfig` to TOML and back. Assert all fields survive the roundtrip.
  7. **`test_docker_config_clone_operation_type`**: Assert that `DockerExecutorConfig` specifies the clone mechanism as `docker exec` (not volume mount), matching the requirement that the project repo is cloned into the container.
  8. **`test_docker_command_builder_produces_correct_args`**: Given a `DockerExecutorConfig` with image `"rust:latest"` and `docker_host = Some("tcp://host:2375")`, build the expected command-line args: `["--host", "tcp://host:2375", "run", "--rm", "-e", "DEVS_MCP_ADDR=...", "rust:latest"]`. Assert the arg list matches.

## 2. Task Implementation
- [ ] In `devs-core`, define:
  ```rust
  #[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
  struct DockerExecutorConfig {
      image: String,
      docker_host: Option<String>,
      extra_env: HashMap<String, String>,
  }
  ```
- [ ] Implement `DockerExecutorConfig::validate(&self) -> Result<(), CoreError>` that checks `image` is non-empty.
- [ ] Implement `DockerExecutorConfig::build_run_args(&self, mcp_addr: &str) -> Vec<String>` that constructs the `docker run` argument list including `--rm`, `-e DEVS_MCP_ADDR={mcp_addr}`, optional `--host`, and the image name.
- [ ] Define a constant or method `CONTAINER_AUTO_REMOVE: bool = true` documenting the `--rm` policy.
- [ ] Document that repo cloning is performed via `docker exec git clone ...` after container start, not via volume mount.
- [ ] Add `// Covers: 2_TAS-REQ-044A` annotations to each test function.

## 3. Code Review
- [ ] Verify `--rm` is unconditionally applied — no configuration option to disable it.
- [ ] Verify `DEVS_MCP_ADDR` injection is mandatory and cannot be omitted.
- [ ] Verify `docker_host` maps to Docker's `--host` / `DOCKER_HOST` correctly.
- [ ] Verify no secrets are logged in `Debug` output of the config struct.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test docker_executor` and confirm all 8 tests pass.
- [ ] Run `cargo clippy --all-targets` and confirm no warnings.

## 5. Update Documentation
- [ ] Add doc comments to `DockerExecutorConfig` explaining DOCKER_HOST usage, --rm policy, clone-via-exec strategy, and DEVS_MCP_ADDR injection.

## 6. Automated Verification
- [ ] Run `./do test` and confirm the new tests appear in output and pass.
- [ ] Grep test source for `// Covers: 2_TAS-REQ-044A` and confirm the annotation exists at least once.
