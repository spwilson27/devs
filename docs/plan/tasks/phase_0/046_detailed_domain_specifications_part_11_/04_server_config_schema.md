# Task: ServerConfig Struct Schema (Sub-Epic: 046_Detailed Domain Specifications (Part 11))

## Covered Requirements
- [2_TAS-REQ-105]

## Dependencies
- depends_on: [none]
- shared_components: [devs-config]

## 1. Initial Test Written
- [ ] Create unit tests in `devs-config/src/server_config.rs` (or equivalent) for `ServerConfig` that:
    - Verify deserialization of a complete `devs.toml` configuration with all sections (`server`, `retention`, `pool`).
    - Test that default values are correctly applied for all optional fields.
    - Verify field-level constraints (e.g., `mcp_port` within 1024-65535, pool name format, concurrency limits).
    - Ensure `SchedulingMode`, `AgentTool`, and `PromptMode` enums are correctly parsed from strings.
    - Test that required fields (like `pool.name`, `pool.max_concurrent`, and `pool.agent.tool`) cause an error if missing.

## 2. Task Implementation
- [ ] Implement the `ServerConfig` struct in `devs-config` with all 13+ field mappings specified in [2_TAS-REQ-105].
- [ ] Use `serde` for TOML deserialization.
- [ ] Implement `SchedulingMode`, `AgentTool`, and `PromptMode` enums with `serde` string mapping.
- [ ] Add validation logic using the multi-error reporting framework from `devs-core` to enforce all constraints (e.g., pool name `[a-z0-9_-]+`, max age days 1-3650, etc.).
- [ ] Implement default values for fields using `#[serde(default = "...")]` or equivalent.

## 3. Code Review
- [ ] Ensure the struct schema strictly matches the table in [2_TAS-REQ-105].
- [ ] Verify that all Rust types correspond accurately to the specification.
- [ ] Check that `external_addr` defaults to `None` and is validated if set.
- [ ] Confirm that `pool[*].agent[*].capabilities` is initialized to an empty vector if not provided.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-config` to verify the configuration parsing and validation.

## 5. Update Documentation
- [ ] Update the `devs-config` README with a sample `devs.toml` and explanations of each configuration field.

## 6. Automated Verification
- [ ] Run `./do verify` to ensure requirement traceability for [2_TAS-REQ-105] is maintained.
