# Task: Implement MCP Glass-Box Exposure Risk Acceptance Criteria (Sub-Epic: 01_core_domain_models_state_machine)

## Covered Requirements
- [AC-RISK-015-02], [MIT-015]

## Dependencies
- depends_on: ["11_redacted_wrapper_credential_security.md", "18_mcp_bridge_security.md"]
- shared_components: [devs-core (Owner), devs-mcp (Consumer), devs-server (Consumer)]

## 1. Initial Test Written
- [ ] Write test `test_mcp_network_bind_mode_loopback_only` that asserts default MCP server binds to 127.0.0.1 only
- [ ] Write test `test_mcp_network_bind_mode_all_interfaces_requires_explicit_config` that asserts binding to 0.0.0.0 requires explicit `--bind-all-interfaces` flag
- [ ] Write test `test_mcp_exposure_tls_required_on_non_loopback` that asserts TLS is required when binding to non-loopback addresses
- [ ] Write test `test_mcp_trust_level_inherited_from_bridge` that verifies MCP bridge trust level is correctly inherited from spawning process
- [ ] Write test `test_mit_015_network_bind_documented` that asserts the network bind mode configuration is documented with security rationale

## 2. Task Implementation
- [ ] Define `NetworkBindMode` enum in `crates/devs-core/src/mcp/network.rs` with variants:
  - `Loopback` — binds to 127.0.0.1 only (default, secure)
  - `AllInterfaces { require_tls: bool }` — binds to 0.0.0.0 (requires explicit config)
- [ ] Define `McpNetworkConfig` struct with:
  - `bind_mode: NetworkBindMode`
  - `listen_port: u16`
  - `tls_config: Option<TlsConfig>` (required for `AllInterfaces` mode)
  - `explicit_override: bool` — tracks if non-default was explicitly configured
- [ ] Implement `MIT-015` mitigation: Network bind mode with secure defaults
  - Default: Loopback only (127.0.0.1)
  - All interfaces requires explicit `--bind-all-interfaces` flag
  - Non-loopback binding requires TLS configuration
- [ ] Define `McpTrustLevel` enum with variants:
  - `Inherited` — trusts spawning process (MCP stdio bridge)
  - `Network { authenticated: bool }` — network clients require authentication (post-MVP)
- [ ] Implement `McpExposureValidator` with `validate(config: &McpNetworkConfig) -> Result<(), McpExposureError>` that:
  - Rejects non-loopback binding without TLS
  - Warns if binding to all interfaces
  - Validates port is not well-known (avoid conflicts)
- [ ] Add `pub mod network;` to `crates/devs-core/src/mcp/mod.rs`

## 3. Code Review
- [ ] Verify default bind mode is loopback (secure by default)
- [ ] Verify non-loopback binding requires explicit configuration
- [ ] Verify `MIT-015` mitigation is correctly implemented per the risk matrix
- [ ] Verify TLS requirement for non-loopback binding is enforced

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-core mcp::network` and confirm all network bind tests pass
- [ ] Run `cargo test -p devs-core` to confirm no regressions in the crate
- [ ] Run `cargo clippy -p devs-core -- -D warnings` and confirm no warnings

## 5. Update Documentation
- [ ] Add module-level doc comment to `crates/devs-core/src/mcp/network.rs` explaining the Glass-Box exposure risk and MIT-015 mitigation
- [ ] Add doc comments to `NetworkBindMode` variants describing security implications
- [ ] Document the secure-by-default network binding policy

## 6. Automated Verification
- [ ] Confirm `cargo test -p devs-core` passes with zero failures
- [ ] Confirm `cargo doc -p devs-core --no-deps` generates documentation without errors
- [ ] Verify `NetworkBindMode::Loopback` is the default variant
- [ ] Run `grep -r "RISK-015" crates/devs-core/src/` and confirm the requirement ID appears in test annotations
