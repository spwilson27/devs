# Task: devs-config: ServerConfig Implementation and devs.toml Parsing (Sub-Epic: 02_Configuration & Identification)

## Covered Requirements
- [1_PRD-REQ-042], [2_TAS-REQ-024]

## Dependencies
- depends_on: [none]
- shared_components: [devs-core, devs-config]

## 1. Initial Test Written
- [ ] Create a unit test suite in `crates/devs-config/src/server.rs` that attempts to parse a variety of `devs.toml` samples (valid, partially invalid, and completely malformed).
- [ ] Test that validation collects ALL errors (e.g., missing multiple required fields, invalid port numbers) in a single pass as per [2_TAS-REQ-001H].
- [ ] Test that defaults are correctly applied when optional fields are missing.
- [ ] Test that `[secrets]` and `[triggers]` sections are parsed (and rejected for `[triggers]` with a clear error) as per [1_PRD-REQ-071] and [1_PRD-REQ-076].

## 2. Task Implementation
- [ ] Create the `devs-config` crate in the workspace.
- [ ] Define the `ServerConfig` struct with all fields from [1_PRD-REQ-042]:
    - `listen_addr` (String, default `127.0.0.1:7890`)
    - `mcp_port` (u32, default `7891`)
    - `default_pool` (String)
    - `scheduling_policy` (Enum: `StrictPriority` | `WeightedFairQueuing`)
    - `webhooks` (List of global webhook targets)
    - `pools` (Map of named `AgentPoolConfig`)
- [ ] Define `AgentPoolConfig` with `max_concurrent` and a list of `AgentConfig` (tool, capabilities, fallback).
- [ ] Implement `FromStr` or a dedicated `parse(toml_str: &str)` function using `serde` and `toml` crate.
- [ ] Implement a `validate()` method that returns a `Vec<ConfigError>` (using the error infrastructure from `devs-core`).
- [ ] Ensure that `[triggers]` section parsing returns a specific error stating it's a post-MVP feature [1_PRD-REQ-076].

## 3. Code Review
- [ ] Verify that no business logic is embedded in the parsing layer (only validation of the config schema and constraints).
- [ ] Confirm that all public items have doc comments.
- [ ] Ensure `missing_docs`, `unsafe_code`, and `unused_must_use` are denied.
- [ ] Verify that `anyhow` is NOT used in this library crate (use `thiserror` for internal errors).

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-config`.
- [ ] Ensure all parsing and validation tests pass.

## 5. Update Documentation
- [ ] Update `devs-config/README.md` with the `devs.toml` schema and example.

## 6. Automated Verification
- [ ] Run `./do lint` and ensure no formatting or clippy errors.
- [ ] Run `cargo-llvm-cov` and verify that `devs-config` achieves ≥ 90% unit test coverage.
