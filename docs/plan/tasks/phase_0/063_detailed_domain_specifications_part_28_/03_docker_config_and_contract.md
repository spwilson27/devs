# Task: Define Docker Executor Configuration and Agent Binary Contract (Sub-Epic: 063_Detailed Domain Specifications (Part 28))

## Covered Requirements
- [2_TAS-REQ-281], [2_TAS-REQ-282]

## Dependencies
- depends_on: [none]
- shared_components: [devs-config (consumer — adds Docker execution env config), devs-executor (consumer — documents agent binary contract)]

## 1. Initial Test Written
- [ ] In `crates/devs-config/src/` (in the module handling stage execution environment parsing), create a test module `mod docker_config_tests`.
- [ ] **Test: `test_docker_env_requires_image_field`** — Parse a TOML snippet for a stage with `execution_env = "docker"` but no `image` field. Assert that validation returns an error with a message containing "image" and indicating it is required. Validates [2_TAS-REQ-281].
- [ ] **Test: `test_docker_env_parses_image_field`** — Parse a TOML snippet: `[stage.execution_env.docker]\nimage = "ubuntu:22.04"`. Assert the parsed `DockerExecutionEnv` struct has `image == "ubuntu:22.04"`. Validates [2_TAS-REQ-281].
- [ ] **Test: `test_docker_env_image_field_cannot_be_empty`** — Parse with `image = ""`. Assert validation error. The image field must be a non-empty string (use `BoundedString<1, 512>` or equivalent validation). Validates [2_TAS-REQ-281].
- [ ] **Test: `test_docker_env_image_field_max_length`** — Parse with an image name exceeding 512 characters. Assert validation error. Validates [2_TAS-REQ-281] boundary.
- [ ] **Test: `test_docker_executor_documents_binary_contract`** — This is a compile-time / doc-test style assertion. In `crates/devs-executor/src/docker.rs` (or equivalent), add a `#[test]` that verifies the `DockerExecutor` struct's doc comment contains the text "agent CLI binaries MUST be present in the container image" or similar. Uses `std::any::type_name` or a const string. Validates [2_TAS-REQ-282].
- [ ] **Test: `test_docker_env_full_stage_config_roundtrip`** — Parse a complete stage TOML with `execution_env.docker.image = "myorg/devs-agent:latest"` plus other stage fields (name, pool, prompt). Assert the full stage config deserializes and re-serializes correctly with the image field preserved.
- [ ] Annotate tests with `// Covers: [2_TAS-REQ-281]` or `// Covers: [2_TAS-REQ-282]` as appropriate.
- [ ] Verify all tests fail (Red phase) before implementation.

## 2. Task Implementation
- [ ] In `devs-config`, define or update the `DockerExecutionEnv` struct:
  ```rust
  /// Docker execution environment configuration for a stage.
  ///
  /// [2_TAS-REQ-281]: Container image MUST be specified in `image` field.
  /// [2_TAS-REQ-282]: Agent CLI binaries MUST be present in the container image;
  /// `devs` does not install them at runtime.
  #[derive(Debug, Clone, Serialize, Deserialize)]
  pub struct DockerExecutionEnv {
      /// The Docker image to use. Required. Must be non-empty.
      /// Example: "ubuntu:22.04", "myorg/devs-agent:latest"
      pub image: String, // or BoundedString<1, 512>
  }
  ```
- [ ] Add `DockerExecutionEnv` as a variant in the `ExecutionEnv` enum (e.g., `ExecutionEnv::Docker(DockerExecutionEnv)`).
- [ ] Implement validation in the config validation pass: if `execution_env` is `Docker`, the `image` field must be present and non-empty. Collect the error into the multi-error `Vec<ConfigError>` if missing.
- [ ] In `devs-executor`, create or update `DockerExecutor` with a doc comment that explicitly states the [2_TAS-REQ-282] contract: "`devs` does NOT install agent CLI binaries into Docker containers at runtime. The container image specified in `execution_env.docker.image` MUST already contain all required agent CLI binaries (claude, gemini, opencode, qwen, copilot as needed by the stage's pool configuration)."
- [ ] Add a `const AGENT_BINARY_CONTRACT: &str` in `DockerExecutor` (or as a module-level constant) documenting this requirement, which the doc-test can assert against.
- [ ] Ensure TOML deserialization handles the nested `[stage.execution_env.docker]` table correctly with serde.

## 3. Code Review
- [ ] Verify `DockerExecutionEnv` uses `BoundedString` if the project convention requires it for string fields; otherwise ensure manual length validation is present.
- [ ] Confirm the validation error message is descriptive: e.g., "stage 'review': execution_env.docker.image is required but was not provided".
- [ ] Ensure the `ExecutionEnv` enum's `Deserialize` impl correctly distinguishes between `tempdir`, `docker`, and `remote` variants (tagged enum or adjacently tagged).
- [ ] Verify no `unwrap()` in deserialization paths — all parse errors are collected.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-config -- docker_config_tests` to verify config parsing tests pass.
- [ ] Run `cargo test -p devs-executor -- docker` to verify executor contract tests pass.
- [ ] Run `./do lint` to ensure clippy, fmt, and doc standards are met.

## 5. Update Documentation
- [ ] Add a section to the `devs-executor` module docs explaining the Docker execution model and the agent binary pre-installation requirement.

## 6. Automated Verification
- [ ] Run `./do test` and verify that `target/traceability.json` maps `2_TAS-REQ-281` and `2_TAS-REQ-282` to the new tests.
- [ ] Run `grep -r 'Covers:.*2_TAS-REQ-281' crates/` and `grep -r 'Covers:.*2_TAS-REQ-282' crates/` to confirm annotations exist.
