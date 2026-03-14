# Task: AgentAdapter Trait, Crate Scaffold, and Environment Injection (Sub-Epic: 05_Agent Adapter Infrastructure)

## Covered Requirements
- [2_TAS-REQ-034], [1_PRD-REQ-014], [2_TAS-REQ-037]

## Dependencies
- depends_on: []
- shared_components: [devs-core (consume), devs-adapters (create)]

## 1. Initial Test Written
- [ ] Create `crates/devs-adapters/Cargo.toml` with a dependency on `devs-core` and add it to the workspace `Cargo.toml` members list. Add `dev-dependencies` for test utilities as needed.
- [ ] Create `crates/devs-adapters/src/lib.rs` with a `#[cfg(test)] mod tests;` declaration and `crates/devs-adapters/src/tests.rs`.
- [ ] Write a test `test_agent_adapter_trait_is_object_safe` that creates a `Box<dyn AgentAdapter>` from a mock struct implementing the trait, confirming the trait is object-safe and usable as a trait object.
- [ ] Write a test `test_tool_returns_correct_kind` that instantiates the mock adapter and asserts `tool()` returns the expected `ToolKind` variant.
- [ ] Write a test `test_build_command_returns_adapter_command` that calls `build_command()` with a minimal `AgentInvocation` and asserts the returned `AdapterCommand` has the expected `program`, `args`, and `env` fields.
- [ ] Write a test `test_detect_rate_limit_returns_none_for_normal_exit` that calls `detect_rate_limit()` with exit code 0 and empty stderr and asserts `None` is returned.
- [ ] Write a test `test_detect_rate_limit_returns_some_for_rate_limit` that calls `detect_rate_limit()` with exit code 1 and stderr containing "rate limit" and asserts `Some(RateLimitInfo)` is returned.
- [ ] Write a test `test_env_injection_includes_devs_mcp_addr` that calls the environment merge helper with a `devs_mcp_addr` value and asserts the resulting `HashMap` contains `DEVS_MCP_ADDR` set to that value.
- [ ] Write a test `test_env_injection_strips_internal_vars` that calls the environment merge helper with an inherited env containing `DEVS_LISTEN`, `DEVS_MCP_PORT`, and `DEVS_DISCOVERY_FILE`, and asserts none of these keys appear in the output.
- [ ] Write a test `test_env_injection_preserves_stage_vars` that passes stage-specific env vars and asserts they appear in the final merged output alongside `DEVS_MCP_ADDR`.
- [ ] Confirm all tests fail to compile or fail at runtime (trait and types do not exist yet).

## 2. Task Implementation
- [ ] Define `ToolKind` enum in `crates/devs-adapters/src/types.rs` with variants: `Claude`, `Gemini`, `OpenCode`, `Qwen`, `Copilot`. Derive `Debug`, `Clone`, `Copy`, `PartialEq`, `Eq`, `Hash`, `serde::Serialize`, `serde::Deserialize`.
- [ ] Define `RateLimitInfo` struct in `types.rs` with fields: `tool: ToolKind`, `message: String`. Derive `Debug`, `Clone`.
- [ ] Define `AgentInvocation` struct in `types.rs` with fields: `prompt: String`, `system_prompt: Option<String>`, `env_vars: HashMap<String, String>`, `working_dir: PathBuf`, `use_pty: bool`. Derive `Debug`, `Clone`.
- [ ] Define `AdapterCommand` struct in `types.rs` with fields: `program: String`, `args: Vec<String>`, `env: HashMap<String, String>`, `use_pty: bool`. Derive `Debug`, `Clone`.
- [ ] Define `AdapterError` enum in `types.rs` with variants: `CommandBuild(String)`, `InvalidConfig(String)`. Implement `std::fmt::Display` and `std::error::Error`.
- [ ] Define the `AgentAdapter` trait in `crates/devs-adapters/src/trait_def.rs`:
  ```rust
  pub trait AgentAdapter: Send + Sync {
      fn tool(&self) -> ToolKind;
      fn build_command(&self, invocation: &AgentInvocation) -> Result<AdapterCommand, AdapterError>;
      fn detect_rate_limit(&self, exit_code: i32, stderr: &str) -> Option<RateLimitInfo>;
  }
  ```
- [ ] Implement the environment merge helper function `merge_env` in `crates/devs-adapters/src/env.rs`:
  - Accept `inherited_env: &HashMap<String, String>`, `stage_env: &HashMap<String, String>`, `devs_mcp_addr: &str`.
  - Start with a clone of `inherited_env`.
  - Remove keys: `DEVS_LISTEN`, `DEVS_MCP_PORT`, `DEVS_DISCOVERY_FILE`, and any key starting with `DEVS_` that is on the internal-only list.
  - Merge `stage_env` (stage vars override inherited).
  - Insert `DEVS_MCP_ADDR` with the provided value (always, overriding any existing value).
  - Return the final `HashMap<String, String>`.
- [ ] Re-export all public types and the trait from `lib.rs`.

## 3. Code Review
- [ ] Verify `AgentAdapter` trait is object-safe (`Send + Sync` bounds, no `Self: Sized` constraints, no generic methods).
- [ ] Verify `detect_rate_limit` is a pure function with no I/O or network calls.
- [ ] Verify the internal variable strip list is defined as a `const` array for maintainability.
- [ ] Verify `AdapterCommand` does not contain any sensitive data types (credentials should go through `Redacted<T>` in the executor, not here).
- [ ] Verify all public items have doc comments (`#![deny(missing_docs)]` in `lib.rs`).

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-adapters` and confirm all tests pass.
- [ ] Run `cargo clippy -p devs-adapters -- -D warnings` and confirm zero warnings.

## 5. Update Documentation
- [ ] Add `//! Covers: 2_TAS-REQ-034` annotation to the trait definition test.
- [ ] Add `//! Covers: 2_TAS-REQ-037` annotation to the env injection tests.
- [ ] Add `//! Covers: 1_PRD-REQ-014` annotation to the object-safety test.
- [ ] Add doc comments to all public types, trait, and functions.

## 6. Automated Verification
- [ ] Run `./do lint` and confirm it passes.
- [ ] Run `./do test` and confirm `target/traceability.json` includes entries for `2_TAS-REQ-034`, `1_PRD-REQ-014`, and `2_TAS-REQ-037`.
- [ ] Run `cargo test -p devs-adapters -- --nocapture 2>&1 | grep -c "test result: ok"` and confirm the count matches expected test count.
