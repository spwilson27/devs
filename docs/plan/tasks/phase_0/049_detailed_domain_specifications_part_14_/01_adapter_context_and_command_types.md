# Task: Define StageContext and AdapterCommand Types (Sub-Epic: 049_Detailed Domain Specifications (Part 14))

## Covered Requirements
- [2_TAS-REQ-116], [2_TAS-REQ-117]

## Dependencies
- depends_on: [none]
- shared_components: [devs-core (consume), devs-adapters (create types in)]

## 1. Initial Test Written
- [ ] In `crates/devs-adapters/src/context_tests.rs` (or inline `#[cfg(test)]` module), write a test `test_stage_context_has_all_required_fields` that constructs a `StageContext` with every field populated: `run_id: Uuid`, `stage_name: String`, `attempt: u32`, `prompt: String`, `system_prompt: Option<String>`, `env: HashMap<String, String>`, `working_dir: PathBuf`, `mcp_addr: String`, `prompt_file: Option<PathBuf>`. Assert all fields are accessible and hold the expected values.
- [ ] Write `test_stage_context_prompt_is_fully_resolved` — construct a `StageContext` with `prompt` containing no `{{` template markers. Assert `prompt` does not contain `{{` (documenting the contract that prompts are pre-resolved before reaching `StageContext`).
- [ ] Write `test_adapter_command_contains_devs_mcp_addr` — call a mock/test adapter's `build_command(&stage_context)` and assert the returned `AdapterCommand.env` map contains key `"DEVS_MCP_ADDR"` with value equal to `stage_context.mcp_addr`.
- [ ] Write `test_adapter_command_excludes_server_internal_env_vars` — populate `stage_context.env` with `DEVS_LISTEN`, `DEVS_MCP_PORT`, and `DEVS_DISCOVERY_FILE` keys. Call `build_command` and assert none of these three keys appear in the returned `AdapterCommand.env`.
- [ ] Write `test_adapter_command_preserves_user_env_vars` — populate `stage_context.env` with user-defined keys like `MY_API_KEY`. Assert they appear in `AdapterCommand.env` after `build_command`.

## 2. Task Implementation
- [ ] Create `crates/devs-adapters/src/context.rs` and define:
    ```rust
    use std::collections::HashMap;
    use std::path::PathBuf;
    use uuid::Uuid;

    /// All information needed to construct an agent invocation.
    /// The `prompt` field is fully resolved — all template variables have been substituted.
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
- [ ] Define `AdapterCommand` in the same module:
    ```rust
    pub struct AdapterCommand {
        pub program:   String,
        pub args:      Vec<String>,
        pub env:       HashMap<String, String>,
        pub working_dir: PathBuf,
    }
    ```
- [ ] Implement a helper function `fn sanitize_env(env: &HashMap<String, String>) -> HashMap<String, String>` that clones the map and removes the keys `DEVS_LISTEN`, `DEVS_MCP_PORT`, and `DEVS_DISCOVERY_FILE`.
- [ ] Define the constant list of forbidden env var keys: `const FORBIDDEN_ENV_KEYS: &[&str] = &["DEVS_LISTEN", "DEVS_MCP_PORT", "DEVS_DISCOVERY_FILE"];`
- [ ] Ensure `sanitize_env` is called during `build_command` in every adapter implementation and that `DEVS_MCP_ADDR` is always injected from `stage_context.mcp_addr`.
- [ ] Export `StageContext`, `AdapterCommand`, and `sanitize_env` from the crate's public API.

## 3. Code Review
- [ ] Verify `StageContext` field types match the spec exactly (`Uuid`, `u32`, `String`, `Option<String>`, `HashMap<String, String>`, `PathBuf`, `Option<PathBuf>`).
- [ ] Confirm all fields are `pub`.
- [ ] Verify `FORBIDDEN_ENV_KEYS` covers exactly `DEVS_LISTEN`, `DEVS_MCP_PORT`, `DEVS_DISCOVERY_FILE` — no more, no less.
- [ ] Confirm `DEVS_MCP_ADDR` injection happens unconditionally in `AdapterCommand` construction.
- [ ] Verify no wire types from `devs-proto` leak into the public API of this module.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-adapters -- context` and confirm all 5 tests pass.

## 5. Update Documentation
- [ ] Add doc comments to `StageContext` explaining that `prompt` is fully resolved and `env` is the merged server + workflow + stage environment.
- [ ] Add doc comments to `AdapterCommand` explaining that `env` has server-internal vars stripped and `DEVS_MCP_ADDR` injected.

## 6. Automated Verification
- [ ] Run `./do lint` and confirm no warnings or errors for `devs-adapters`.
- [ ] Run `cargo clippy -p devs-adapters -- -D warnings` and confirm clean output.
