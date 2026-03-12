# Task: 04_Security Configuration Verification Tests (Sub-Epic: 08_Risk 006 Verification)

## Covered Requirements
- [RISK-BR-008]

## Dependencies
- depends_on: [none]
- shared_components: [devs-core, devs-grpc]

## 1. Initial Test Written
- [ ] Create a new integration test file `tests/e2e/test_security_startup.rs` (or equivalent in the testing framework used).
- [ ] Define test cases for the following misconfigurations:
    - `bind_address = "0.0.0.0"` without TLS enabled.
    - Credentials supplied in the TOML config file instead of environment variables.
    - Insecure file permissions on `~/.config/devs/` (e.g. world-readable).
    - Webhook targets without HTTPS.
- [ ] The tests must use a `TestServer` instance that allows capturing and asserting on log output.

## 2. Task Implementation
- [ ] In the server startup sequence (`src/server.rs` or `src/config.rs`), implement security validation checks.
- [ ] For each insecure condition identified, emit a `tracing::warn!` (or equivalent) log message with a specific, machine-readable string (e.g., `[SEC-WARN-BIND-INSECURE]`).
- [ ] Ensure that the server *continues* to start (unless it's a fatal error) but the test suite is configured to treat these specific warnings as failures for the security verification tests.
- [ ] Update the test runner logic (in `./do test` or `tests/common/`) to fail the test step if any of these security-related `WARN` logs are emitted during the security integration tests.

## 3. Code Review
- [ ] Verify that security checks are comprehensive and follow the rules in `RISK-BR-008`.
- [ ] Ensure the log messages are consistent and easy to grep/assert on.
- [ ] Verify that the test suite correctly isolates these tests so that *intentional* misconfigurations for testing don't break other integration tests.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test --test test_security_startup` and ensure it passes (by correctly failing on misconfiguration and passing when misconfiguration is expected/caught).
- [ ] Verify that `./do test` exits non-zero if a security check fails.

## 5. Update Documentation
- [ ] Update `docs/plan/summaries/5_security_design.md` to reference these automated startup checks.

## 6. Automated Verification
- [ ] Run the security integration tests as part of the full suite and confirm that they are tracked and reported in the traceability matrix.
