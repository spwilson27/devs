# Task: ServerConfig Struct Schema and TOML Deserialization (Sub-Epic: 046_Detailed Domain Specifications (Part 11))

## Covered Requirements
- [2_TAS-REQ-105]

## Dependencies
- depends_on: [03_multi_error_validation_framework.md]
- shared_components: [devs-config (owner — creates ServerConfig), devs-core (consumer — uses ValidationError/ValidationErrorCode for validation)]

## 1. Initial Test Written
- [ ] Create tests in `devs-config/src/server_config.rs` (inline `#[cfg(test)]` module) with `// Covers: 2_TAS-REQ-105` annotations:
- [ ] **Full valid TOML deserialization**: Parse a complete `devs.toml` string containing all sections (`[server]`, `[retention]`, `[[pool]]` with nested `[[pool.agent]]`). Assert all 13+ fields are correctly populated.
- [ ] **Default values applied**: Parse a minimal TOML with only required fields. Assert defaults: `listen = "127.0.0.1:7890"`, `mcp_port = 7891`, `external_addr = None`, `scheduling = Weighted`, `max_age_days = 30`, `max_size_mb = 500`, `agent.capabilities = []`, `agent.fallback = false`, `agent.pty = None`, `agent.prompt_mode = None`.
- [ ] **mcp_port range validation**: Assert `mcp_port = 1023` produces a `ValueOutOfRange` validation error. Assert `mcp_port = 1024` passes. Assert `mcp_port = 65535` passes. Assert `mcp_port = 65536` fails deserialization (u16 overflow).
- [ ] **Pool name format**: Assert `pool.name = "my-pool_1"` passes (`[a-z0-9_-]+`). Assert `pool.name = "My Pool!"` produces a validation error. Assert name longer than 64 chars produces `FieldTooLong`.
- [ ] **max_concurrent range**: Assert `max_concurrent = 0` → `ValueOutOfRange`. Assert `max_concurrent = 1` passes. Assert `max_concurrent = 1024` passes. Assert `max_concurrent = 1025` → `ValueOutOfRange`.
- [ ] **AgentTool enum parsing**: Assert `tool = "claude"`, `"gemini"`, `"opencode"`, `"qwen"`, `"copilot"` all parse. Assert `tool = "unknown"` fails.
- [ ] **SchedulingMode enum**: Assert `scheduling = "strict"` → `SchedulingMode::Strict`. Assert `scheduling = "weighted"` → `SchedulingMode::Weighted`. Assert `scheduling = "random"` fails.
- [ ] **PromptMode enum**: Assert `prompt_mode = "flag"` → `PromptMode::Flag`. Assert `prompt_mode = "file"` → `PromptMode::File`.
- [ ] **retention.max_age_days range**: Assert `0` → error, `1` → ok, `3650` → ok, `3651` → error.
- [ ] **retention.max_size_mb range**: Assert `0` → error, `1` → ok, `1_000_000` → ok, `1_000_001` → error.
- [ ] **Capability tag length**: Assert a capability string of 65 chars produces `FieldTooLong`.
- [ ] **Required fields missing**: Omit `pool.name` → `SchemaMissing`. Omit `pool.max_concurrent` → `SchemaMissing`. Omit `pool.agent.tool` → `SchemaMissing`.
- [ ] **Multi-error collection**: A TOML with invalid `mcp_port`, invalid pool name, and missing `agent.tool` produces a `Vec` of 3+ validation errors in a single pass.
- [ ] **external_addr validation**: `external_addr = "not-valid"` (no port) → validation error. `external_addr = "0.0.0.0:8080"` → ok.
- [ ] **listen address validation**: `listen = "not-an-address"` → validation error.

## 2. Task Implementation
- [ ] Create `devs-config/src/server_config.rs` (or appropriate module structure).
- [ ] Define `ServerConfig` with serde deserialization:
    ```rust
    #[derive(Debug, Clone, Deserialize)]
    pub struct ServerConfig {
        #[serde(default = "default_server")]
        pub server: ServerSection,
        #[serde(default)]
        pub retention: RetentionSection,
        #[serde(default)]
        pub pool: Vec<PoolConfig>,
    }
    ```
- [ ] Define `ServerSection` with fields: `listen: String` (default `"127.0.0.1:7890"`), `mcp_port: u16` (default `7891`), `external_addr: Option<String>` (default `None`), `scheduling: SchedulingMode` (default `Weighted`).
- [ ] Define `RetentionSection`: `max_age_days: u32` (default `30`), `max_size_mb: u64` (default `500`).
- [ ] Define `PoolConfig`: `name: String` (required), `max_concurrent: u32` (required), `agent: Vec<AgentConfig>`.
- [ ] Define `AgentConfig`: `tool: AgentTool` (required), `capabilities: Vec<String>` (default `[]`), `fallback: bool` (default `false`), `pty: Option<bool>` (default `None`), `prompt_mode: Option<PromptMode>` (default `None`).
- [ ] Define enums `SchedulingMode { Strict, Weighted }`, `AgentTool { Claude, Gemini, Opencode, Qwen, Copilot }`, `PromptMode { Flag, File }` — all with `#[serde(rename_all = "lowercase")]` and deriving `Debug, Clone, Copy, PartialEq, Eq`.
- [ ] Implement `ServerConfig::validate(&self) -> Result<(), Vec<ValidationError>>` using the `ValidationCollector` from `devs-core`:
    - Validate `listen` is a valid `host:port` string.
    - Validate `mcp_port` is in range 1024–65535.
    - Validate `external_addr` if `Some` is a valid `host:port`.
    - Validate `max_age_days` in 1–3650, `max_size_mb` in 1–1,000,000.
    - For each pool: validate `name` matches `[a-z0-9_-]+` and length ≤ 64, `max_concurrent` in 1–1024.
    - For each agent: validate each capability tag length ≤ 64.
    - Collect ALL errors before returning.
- [ ] Re-export `ServerConfig` and related types from `devs-config/src/lib.rs`.

## 3. Code Review
- [ ] Verify all 13+ fields from the [2_TAS-REQ-105] table are present with correct Rust types and defaults.
- [ ] Confirm `external_addr` defaults to `None` (not to `listen` — that fallback is a runtime behavior, not a deserialization default).
- [ ] Verify validation uses `ValidationCollector` from devs-core, not a custom error type.
- [ ] Confirm pool name regex is anchored: `^[a-z0-9_-]+$`.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-config -- server_config` and confirm all tests pass.
- [ ] Run `cargo clippy -p devs-config -- -D warnings` with zero warnings.

## 5. Update Documentation
- [ ] Add doc comments to `ServerConfig`, all nested section structs, and all enum variants documenting defaults, constraints, and TOML key mappings.

## 6. Automated Verification
- [ ] Run `./do test` and confirm `target/traceability.json` includes coverage for `2_TAS-REQ-105`.
- [ ] Run `./do lint` and confirm zero errors.
