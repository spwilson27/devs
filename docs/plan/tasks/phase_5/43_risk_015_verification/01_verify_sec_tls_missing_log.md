# Task: Verify SEC-TLS-MISSING Log on Non-Loopback Plaintext gRPC (Sub-Epic: 43_Risk 015 Verification)

## Covered Requirements
- [AC-RISK-015-04]

## Dependencies
- depends_on: []
- shared_components: [devs-grpc, devs-core]

## 1. Initial Test Written
- [ ] Create an integration test `tests/security/sec_tls_missing_test.rs` that starts the `devs-server` bound to a non-loopback address (e.g., `0.0.0.0`) without TLS configuration.
- [ ] Use `devs_test_helper` to capture the server's stderr/stdout.
- [ ] Assert that a `WARN` log is emitted containing `check_id: "SEC-TLS-MISSING"` and the detail message: `"plaintext gRPC on non-loopback address; configure [server.tls] to suppress"`.

## 2. Task Implementation
- [ ] Modify `devs-server` (or the core server startup logic in `devs-core`) to inspect the `listen` address at startup.
- [ ] Determine if the address is a non-loopback address (not starting with `127.` or `::1`).
- [ ] Check if TLS is configured (`ServerConfig.tls` is `None`).
- [ ] If both conditions are true, emit a `tracing::warn!` log with the required structured fields (`event_type: "security.misconfiguration"`, `check_id: "SEC-TLS-MISSING"`).
- [ ] Ensure this check does not block the server from starting.

## 3. Code Review
- [ ] Verify that the loopback check is robust for IPv4 and IPv6.
- [ ] Ensure the log message matches the requirement string exactly.
- [ ] Confirm that `tracing` is used correctly for structured logging.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test --test sec_tls_missing_test` and ensure it passes.

## 5. Update Documentation
- [ ] Update `target/traceability.json` by running `./do test` to reflect coverage for `AC-RISK-015-04`.

## 6. Automated Verification
- [ ] Run `./do test` and verify that `AC-RISK-015-04` is no longer listed as an uncovered requirement in the traceability report.
