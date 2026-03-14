# Task: devs.toml Top-Level Section Schema Definition (Sub-Epic: 056_Detailed Domain Specifications (Part 21))

## Covered Requirements
- [2_TAS-REQ-154]

## Dependencies
- depends_on: ["01_string_field_length_validation.md"]
- shared_components: [devs-core (Consumer — BoundedString, PoolName), devs-config (Owner — ServerConfig structs)]

## 1. Initial Test Written
- [ ] In `crates/devs-config/src/lib.rs` (or `server_config.rs`), write unit tests:
  - `test_parse_minimal_devs_toml` — a TOML string with only `[server]` section containing `listen_addr` parses successfully.
  - `test_parse_full_devs_toml` — a TOML string with all four sections (`[server]`, `[retention]`, `[[pool]]` with nested `[[pool.agent]]`, `[webhooks]`) parses to the correct typed struct.
  - `test_server_section_fields` — `listen_addr`, `mcp_port`, `scheduling_mode` are correctly deserialized.
  - `test_retention_section_fields` — `max_age_days` and `max_size_mb` are correctly deserialized with appropriate defaults.
  - `test_pool_section_fields` — `name`, `max_concurrent`, and nested agent entries with `tool`, `capabilities`, `fallback` parse correctly.
  - `test_missing_required_field_returns_error` — omitting `listen_addr` from `[server]` returns a parse error.
  - `test_unknown_section_ignored_or_errors` — unknown top-level keys are handled per project policy (document which).
- [ ] Each test must include `// Covers: 2_TAS-REQ-154` annotation.

## 2. Task Implementation
- [ ] Define config structs in `devs-config`:
  - `pub struct DevsConfig { pub server: ServerSection, pub retention: Option<RetentionSection>, pub pools: Vec<PoolSection>, pub webhooks: Option<WebhooksSection> }`
  - `pub struct ServerSection { pub listen_addr: String, pub mcp_port: Option<u16>, pub scheduling_mode: Option<SchedulingMode> }`
  - `pub struct RetentionSection { pub max_age_days: Option<u32>, pub max_size_mb: Option<u32> }`
  - `pub struct PoolSection { pub name: PoolName, pub max_concurrent: u32, pub agents: Vec<PoolAgentEntry> }`
  - `pub struct PoolAgentEntry { pub tool: String, pub capabilities: Option<Vec<String>>, pub fallback: Option<bool> }`
  - `pub struct WebhooksSection { /* placeholder for per-project webhook defaults */ }`
  - `pub enum SchedulingMode { StrictPriority, WeightedFair }`
- [ ] All structs derive `Deserialize, Serialize, Debug, Clone`.
- [ ] Implement `DevsConfig::from_toml(content: &str) -> Result<Self, ConfigError>` using `toml` crate.

## 3. Code Review
- [ ] Verify `PoolSection.name` uses `PoolName` (BoundedString) not raw `String`.
- [ ] Verify `deny(missing_docs)` does not fail — all fields documented.
- [ ] Confirm TOML parsing uses `toml` crate, not hand-rolled parsing.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-config --lib` and confirm all tests pass.

## 5. Update Documentation
- [ ] Add doc comments on `DevsConfig` explaining each section's purpose and mapping to `devs.toml`.

## 6. Automated Verification
- [ ] Run `./do test` and confirm zero failures.
- [ ] Run `./do lint` and confirm no warnings or errors.
