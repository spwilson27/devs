# Task: 04_Security Configuration Verification Tests (Sub-Epic: 08_Risk 006 Verification)

## Covered Requirements
- [RISK-BR-008]

## Dependencies
- depends_on: []
- shared_components: [devs-core, devs-config, devs-server]

## 1. Initial Test Written
- [ ] Create a Rust integration test file at `tests/e2e/security/test_security_startup.rs` with the following test cases:
- [ ] Write a test `test_warn_on_insecure_bind_address_without_tls` that:
  - Starts a `TestServer` with config `listen_addr = "0.0.0.0:50051"` and `tls_enabled = false`.
  - Captures log output and asserts a WARN log is emitted containing `[SEC-WARN-BIND-INSECURE]`.
  - Verifies the server still starts (non-fatal) but the test framework flags this as a security violation.
- [ ] Write a test `test_warn_on_credentials_in_toml_config` that:
  - Starts a `TestServer` with a TOML config containing `api_key = "sk-xxx"` inline (instead of env var).
  - Captures log output and asserts a WARN log is emitted containing `[SEC-WARN-CREDS-IN-CONFIG]`.
- [ ] Write a test `test_warn_on_insecure_file_permissions` that:
  - Creates a temp config directory with world-readable permissions (`0o777`).
  - Starts a `TestServer` and asserts a WARN log is emitted containing `[SEC-WARN-PERMS-INSECURE]`.
- [ ] Write a test `test_warn_on_webhook_target_without_https` that:
  - Starts a `TestServer` with a webhook target `http://example.com/hook` (not HTTPS).
  - Captures log output and asserts a WARN log is emitted containing `[SEC-WARN-WEBHOOK-NOT-TLS]`.
- [ ] Ensure all tests use the `TestServer` fixture from `tests/common/mod.rs` and assert exact log messages.

## 2. Task Implementation
- [ ] In `src/config.rs` or `src/server.rs`, implement security validation checks during server startup:
  - **Bind address check**: if `listen_addr` starts with `0.0.0.0` and `tls_enabled` is false, emit `tracing::warn!("[SEC-WARN-BIND-INSECURE] Listening on all interfaces without TLS")`.
  - **Credentials check**: when parsing TOML config, if any field matches `api_key`, `secret`, `password`, or `token`, emit `tracing::warn!("[SEC-WARN-CREDS-IN-CONFIG] Credentials found in config file; use environment variables instead")`.
  - **File permissions check**: on startup, check `~/.config/devs/` directory permissions; if world-readable (`mode & 0o077 != 0`), emit `tracing::warn!("[SEC-WARN-PERMS-INSECURE] Config directory is world-readable")`.
  - **Webhook TLS check**: when validating webhook targets, if any URL starts with `http://` (not `https://`), emit `tracing::warn!("[SEC-WARN-WEBHOOK-NOT-TLS] Webhook target {} uses insecure HTTP", url)`.
- [ ] Ensure the server continues startup after emitting warnings (these are non-fatal).
- [ ] Update `tests/common/mod.rs` to provide a `TestServerBuilder` that allows injecting insecure configs for testing.
- [ ] Configure the test runner to treat these specific WARN logs as test failures when asserted (the test explicitly expects the warning and passes by detecting it).

## 3. Code Review
- [ ] Verify all four security checks are implemented and emit consistent, machine-readable log messages with `[SEC-WARN-*]` tags.
- [ ] Confirm the `Redacted<T>` wrapper is used for any credential values in logs to prevent accidental exposure.
- [ ] Verify the test isolation: security warning tests run in separate test processes to avoid polluting other tests.
- [ ] Ensure error messages are actionable and reference the specific security concern.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test --test test_security_startup -- --nocapture` and confirm all four security warning tests pass.
- [ ] Run `./do test` and verify the security tests execute without breaking other integration tests.
- [ ] Manually start a server with an insecure config and verify the WARN log appears in stdout.

## 5. Update Documentation
- [ ] Update `docs/plan/summaries/5_security_design.md` to document: "Automated security configuration checks emit `[SEC-WARN-*]` logs on startup; verified by E2E tests in `tests/e2e/security/`."
- [ ] Add a section to `docs/adapter-compatibility.md` noting that security checks are adapter-agnostic (apply to server config, not agent adapters).

## 6. Automated Verification
- [ ] Run `cargo test --test test_security_startup` as part of the full test suite and verify the tests are tracked in `target/traceability.json` with `// Covers: RISK-BR-008` annotations.
- [ ] Verify the security tests contribute to E2E coverage by checking `target/coverage/report.json` for `devs-server` crate coverage.
