# Task: Define Stage Context and Adapter Command Interface (Sub-Epic: 049_Detailed Domain Specifications (Part 14))

## Covered Requirements
- [2_TAS-REQ-116], [2_TAS-REQ-117]

## Dependencies
- depends_on: [none]
- shared_components: [devs-core, devs-adapters]

## 1. Initial Test Written
- [ ] Create `crates/devs-adapters/src/context.rs` (if not exists) and write unit tests for `StageContext` and `AdapterCommand` serialization.
- [ ] Write a test verifying that `StageContext` contains all required fields: `run_id`, `stage_name`, `attempt`, `prompt`, `system_prompt`, `env`, `working_dir`, `mcp_addr`, `prompt_file`.
- [ ] Write a test for `AdapterCommand` verifying its `env` map handling, specifically that it can store `DEVS_MCP_ADDR`.

## 2. Task Implementation
- [ ] Define the `StageContext` struct in `crates/devs-adapters/src/context.rs` with the following fields:
    ```rust
    pub struct StageContext {
        pub run_id:        Uuid,
        pub stage_name:    String,
        pub attempt:       u32,
        pub prompt:        String,
        pub system_prompt: Option<String>,
        pub env:           HashMap<String, String>,
        pub working_dir:   PathBuf,
        pub mcp_addr:      String,
        pub prompt_file:   Option<PathBuf>,
    }
    ```
- [ ] Define the `AdapterCommand` struct (or relevant type returned by `build_command`) that captures the executable path, arguments, and environment variables.
- [ ] Ensure `AdapterCommand` includes `DEVS_MCP_ADDR` in its environment map as required by [2_TAS-REQ-117].
- [ ] Implement logic (or a helper function) that ensures server-internal environment variables (`DEVS_LISTEN`, `DEVS_MCP_PORT`, `DEVS_DISCOVERY_FILE`) are NOT present in the environment map provided to the agent.

## 3. Code Review
- [ ] Verify that `StageContext` uses `Uuid` and `PathBuf` from standard/authoritative crates.
- [ ] Ensure all fields are public as required by the specification.
- [ ] Verify that the environment variable stripping logic is robust and covers all forbidden keys.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-adapters` to ensure the context and command types are correctly defined and tests pass.

## 5. Update Documentation
- [ ] Document the `StageContext` struct and `AdapterCommand` in the module-level doc comments.
- [ ] Reflect the environment variable stripping policy in the `devs-adapters` documentation.

## 6. Automated Verification
- [ ] Run `./do lint` to ensure doc comments are present and formatting is correct.
- [ ] Run `cargo clippy -p devs-adapters` to ensure idiomatic Rust.
