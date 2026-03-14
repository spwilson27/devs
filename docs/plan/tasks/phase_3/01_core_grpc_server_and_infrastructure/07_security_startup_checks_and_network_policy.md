# Task: Security Startup Checks and Network Access Policy (Sub-Epic: 01_Core gRPC Server and Infrastructure)

## Covered Requirements
- [5_SECURITY_DESIGN-REQ-001], [5_SECURITY_DESIGN-REQ-002], [5_SECURITY_DESIGN-REQ-005], [5_SECURITY_DESIGN-REQ-013], [5_SECURITY_DESIGN-REQ-014], [5_SECURITY_DESIGN-REQ-015], [5_SECURITY_DESIGN-REQ-016], [5_SECURITY_DESIGN-REQ-018], [5_SECURITY_DESIGN-REQ-022], [5_SECURITY_DESIGN-REQ-051], [5_SECURITY_DESIGN-REQ-057], [5_SECURITY_DESIGN-REQ-058], [5_SECURITY_DESIGN-REQ-063]

## Dependencies
- depends_on: ["04_devs_server_crate_and_startup_sequence.md"]
- shared_components: ["devs-config (consumer)"]

## 1. Initial Test Written
- [ ] In `crates/devs-server/tests/security_startup_test.rs`:
  - `test_default_bind_is_loopback`: Assert default config binds gRPC to `127.0.0.1:7890` and MCP to `127.0.0.1:7891`, not `0.0.0.0`.
  - `test_non_loopback_bind_logs_warn`: Configure `0.0.0.0:7890`; capture log output; assert `WARN` message about non-loopback binding in untrusted environments.
  - `test_devs_toml_world_readable_logs_warn`: Create a `devs.toml` with mode `0644`; start server; assert `WARN` about file permissions.
  - `test_credentials_in_toml_logs_warn`: Put `[credentials]` section in config; assert `WARN` about plaintext credentials.
  - `test_no_auth_interceptor_at_mvp`: Make a gRPC call without any auth metadata; assert it succeeds (no authentication enforced).
  - `test_mcp_no_auth_at_mvp`: Make an MCP request without auth; assert success.
  - `test_forward_compatible_interceptor_slot`: Verify the server's gRPC tower stack has a slot/layer for a future auth interceptor (the layer exists but is a passthrough at MVP).

## 2. Task Implementation
- [ ] Implement `SecurityChecker` module in `devs-server` that runs on startup and logs `WARN` for:
  1. Non-loopback listen address configured (REQ-001).
  2. `devs.toml` has permissions more permissive than `0600` on Unix (REQ-058).
  3. `[credentials]` section present in `devs.toml` (REQ-058, REQ-010).
  4. Any credential environment variables are set but empty (potential misconfiguration).
- [ ] Ensure default `listen_addr` is `127.0.0.1` in config defaults (REQ-001).
- [ ] Add a no-op `AuthInterceptor` tower layer to the gRPC stack that is forward-compatible with mTLS/bearer token addition (REQ-002, REQ-022). Document the extension point.
- [ ] Document the MVP security model in a module-level doc comment: no client auth (REQ-015), network-perimeter access control (REQ-051), Glass-Box MCP exposes all state (REQ-013, REQ-057), no PII processing (REQ-014), no MCP tool-level restrictions (REQ-018), no client auth credentials to protect (REQ-063), agent processes run as server user (REQ-005), MCP bridge inherits spawner trust (REQ-016).

## 3. Code Review
- [ ] Verify WARN messages are clear and actionable for operators.
- [ ] Confirm no-op auth interceptor compiles and passes through all requests.
- [ ] Ensure security documentation covers all assigned REQs.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-server -- security` and confirm all pass.

## 5. Update Documentation
- [ ] Add `// Covers: 5_SECURITY_DESIGN-REQ-001, ...` annotations.

## 6. Automated Verification
- [ ] Run `./do test` and `./do lint` with zero failures.
