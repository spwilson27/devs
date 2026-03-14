# Task: ServerConfig TOML Parsing and Validation (Sub-Epic: 02_Configuration & Identification)

## Covered Requirements
- [1_PRD-REQ-042], [2_TAS-REQ-024]

## Dependencies
- depends_on: ["none"]
- shared_components: ["devs-core (consumer)", "devs-config (owner)"]

## 1. Initial Test Written
- [ ] Create `crates/devs-config/src/lib.rs` and `crates/devs-config/tests/server_config_tests.rs`.
- [ ] Write a test `test_parse_minimal_server_config` that deserializes a minimal valid `devs.toml` string containing only `listen_addr = "127.0.0.1:9090"` into a `ServerConfig` struct and asserts `listen_addr` equals `"127.0.0.1:9090"` and all optional fields are `None` or default.
- [ ] Write a test `test_parse_full_server_config` that deserializes a complete `devs.toml` string with all fields populated: `listen_addr`, `mcp_port`, `default_pool`, `scheduling_policy` (enum: `StrictPriority` or `WeightedFair`), `webhook_targets` (vec of `WebhookTarget` with `url` and `events`), and `credentials` (map of string to `Redacted<String>`). Assert every field is correctly parsed.
- [ ] Write a test `test_parse_pool_definitions` that deserializes a TOML string with `[[pool]]` array containing pool name, `max_concurrent`, and nested `[[pool.agent]]` entries with `tool`, `capabilities`, and `fallback` fields. Assert the parsed `Vec<PoolConfig>` has the correct length and field values.
- [ ] Write a test `test_validation_collects_all_errors` that constructs a `ServerConfig` with multiple invalid fields (e.g., empty `listen_addr`, `max_concurrent = 0`, negative MCP port) and calls `validate()`. Assert it returns `Err(Vec<ConfigError>)` with at least 2 errors (not short-circuiting on the first).
- [ ] Write a test `test_validation_passes_for_valid_config` that constructs a fully valid `ServerConfig` and asserts `validate()` returns `Ok(())`.
- [ ] Write a test `test_credentials_use_redacted_wrapper` that parses a TOML config with `[credentials]` section, accesses the credential value via `.expose()`, and asserts the `Debug` output of the `ServerConfig` does not contain the raw credential string.
- [ ] Annotate each test with `// Covers: 1_PRD-REQ-042` or `// Covers: 2_TAS-REQ-024` as appropriate.

## 2. Task Implementation
- [ ] Add `devs-config` as a new crate in the Cargo workspace at `crates/devs-config/Cargo.toml` with dependencies: `serde`, `serde_derive`, `toml`, `devs-core` (path dependency).
- [ ] Define `ServerConfig` struct in `crates/devs-config/src/server.rs` with fields: `listen_addr: String`, `mcp_port: Option<u16>`, `default_pool: Option<String>`, `scheduling_policy: Option<SchedulingPolicy>`, `pools: Vec<PoolConfig>`, `webhook_targets: Vec<WebhookTarget>`, `credentials: HashMap<String, Redacted<String>>`. Derive `Deserialize`.
- [ ] Define `SchedulingPolicy` enum with variants `StrictPriority` and `WeightedFair`. Derive `Deserialize`.
- [ ] Define `PoolConfig` struct with fields: `name: String`, `max_concurrent: u32`, `agents: Vec<AgentConfig>`. Derive `Deserialize`. Use `#[serde(rename = "agent")]` for the nested TOML `[[pool.agent]]` array.
- [ ] Define `AgentConfig` struct with fields: `tool: String`, `capabilities: Vec<String>`, `fallback: Option<bool>`. Derive `Deserialize`.
- [ ] Define `WebhookTarget` struct with fields: `url: String`, `events: Vec<String>`. Derive `Deserialize`.
- [ ] Implement `ServerConfig::from_toml(content: &str) -> Result<Self, toml::de::Error>` using `toml::from_str`.
- [ ] Implement `ServerConfig::validate(&self) -> Result<(), Vec<ConfigError>>` that checks: `listen_addr` is non-empty, each pool has `max_concurrent >= 1`, each pool has a non-empty `name`, each agent has a non-empty `tool` field, each webhook URL is non-empty. Collect all errors into a `Vec<ConfigError>` before returning.
- [ ] Define `ConfigError` enum in `crates/devs-config/src/error.rs` with variants like `EmptyField { field: String }`, `InvalidValue { field: String, reason: String }`.
- [ ] Re-export public types from `crates/devs-config/src/lib.rs`.

## 3. Code Review
- [ ] Verify `Redacted<T>` is used from `devs-core` and NOT re-implemented in this crate.
- [ ] Verify validation collects ALL errors (does not short-circuit on first failure).
- [ ] Verify no wire types (protobuf) leak into the config crate public API.
- [ ] Verify `Debug` impl of `ServerConfig` never exposes raw credential values.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-config` and verify all tests pass.

## 5. Update Documentation
- [ ] Add doc comments to all public types and methods in the crate.

## 6. Automated Verification
- [ ] Run `cargo test -p devs-config -- --nocapture 2>&1 | grep -E "test result"` and confirm `0 failed`.
- [ ] Run `cargo clippy -p devs-config -- -D warnings` and confirm zero warnings.
