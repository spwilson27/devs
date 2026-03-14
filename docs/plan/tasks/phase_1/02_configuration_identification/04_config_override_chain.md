# Task: Configuration Override Chain (TOML -> Env -> CLI Flags) (Sub-Epic: 02_Configuration & Identification)

## Covered Requirements
- [1_PRD-REQ-042], [2_TAS-REQ-024]

## Dependencies
- depends_on: ["01_server_config_toml_parsing.md", "02_project_registry_parsing.md"]
- shared_components: ["devs-config (owner)"]

## 1. Initial Test Written
- [ ] Create `crates/devs-config/tests/override_chain_tests.rs`.
- [ ] Write a test `test_env_var_overrides_toml_listen_addr` that parses a TOML config with `listen_addr = "127.0.0.1:9090"`, then applies env override `DEVS_LISTEN_ADDR=0.0.0.0:8080`, and asserts the final `listen_addr` is `"0.0.0.0:8080"`.
- [ ] Write a test `test_cli_flag_overrides_env_var` that sets both an env override and a CLI override for `listen_addr`. Assert the CLI value wins.
- [ ] Write a test `test_env_var_overrides_mcp_port` that parses a TOML config with `mcp_port = 5000`, sets `DEVS_MCP_PORT=6000`, and asserts the resolved port is `6000`.
- [ ] Write a test `test_no_override_preserves_toml_value` that parses a TOML config and applies no overrides. Assert all values match the TOML.
- [ ] Write a test `test_invalid_env_var_type_returns_error` that sets `DEVS_MCP_PORT=not_a_number` and asserts the override application returns an error.
- [ ] Annotate each test with `// Covers: 1_PRD-REQ-042` and `// Covers: 2_TAS-REQ-024`.

## 2. Task Implementation
- [ ] Define `ConfigOverrides` struct in `crates/devs-config/src/overrides.rs` with optional fields mirroring `ServerConfig`: `listen_addr: Option<String>`, `mcp_port: Option<u16>`, `default_pool: Option<String>`, `scheduling_policy: Option<SchedulingPolicy>`.
- [ ] Implement `ConfigOverrides::from_env() -> Result<Self, ConfigError>` that reads `DEVS_LISTEN_ADDR`, `DEVS_MCP_PORT`, `DEVS_DEFAULT_POOL`, `DEVS_SCHEDULING_POLICY` from environment variables and parses them into the appropriate types.
- [ ] Implement `ServerConfig::apply_overrides(&mut self, env: &ConfigOverrides, cli: &ConfigOverrides)` that applies env overrides first, then CLI overrides (CLI wins over env, env wins over TOML).
- [ ] Implement `ServerConfig::load(toml_path: &Path, cli_overrides: &ConfigOverrides) -> Result<Self, Vec<ConfigError>>` that: reads file, parses TOML, applies env overrides, applies CLI overrides, validates, and returns the final config or collected errors.
- [ ] Re-export `ConfigOverrides` from `crates/devs-config/src/lib.rs`.

## 3. Code Review
- [ ] Verify the precedence order is strictly: CLI > env > TOML.
- [ ] Verify env var parsing errors are reported with the env var name in the error message.
- [ ] Verify `load` calls `validate()` after all overrides are applied.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-config` and verify all tests pass.

## 5. Update Documentation
- [ ] Add doc comments documenting the override precedence chain.

## 6. Automated Verification
- [ ] Run `cargo test -p devs-config -- --nocapture 2>&1 | grep -E "test result"` and confirm `0 failed`.
- [ ] Run `cargo clippy -p devs-config -- -D warnings` and confirm zero warnings.
