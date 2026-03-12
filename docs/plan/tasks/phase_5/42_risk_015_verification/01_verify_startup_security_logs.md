# Task: Verify Startup Security Logs (Non-Loopback) (Sub-Epic: 42_Risk 015 Verification)

## Covered Requirements
- [AC-RISK-015-01], [MIT-015]

## Dependencies
- depends_on: [none]
- shared_components: [devs-server, devs-config]

## 1. Initial Test Written
- [ ] Write an E2E test in `tests/e2e_security_logs.rs` that uses `assert_cmd` (or a similar process runner) to start the `devs-server` with a temporary configuration file where `server.listen` is set to `"0.0.0.0:7890"`.
- [ ] The test must capture the standard error/stdout of the process and assert that a structured `WARN` log is emitted with `event_type: "security.misconfiguration"` and `check_id: "SEC-BIND-ADDR"` within 1 second of startup.
- [ ] Ensure the test cleans up by killing the server process immediately after the assertion passes.

## 2. Task Implementation
- [ ] Ensure `devs-server` properly initializes its `tracing` subscriber to output structured logs (JSON) when configured (e.g., via `DEVS_LOG_FORMAT=json`).
- [ ] Verify that the `server.listen` check implemented in Phase 41 (Task 02) is correctly triggered for `"0.0.0.0:7890"`.
- [ ] Ensure the log level is exactly `WARN` and the fields match the requirement.

## 3. Code Review
- [ ] Confirm that the server does NOT block if the bind address is non-loopback; it should log the warning and continue starting.
- [ ] Verify that the log message is correctly formatted as structured data (if using JSON output).

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test --test e2e_security_logs` and verify the test passes.

## 5. Update Documentation
- [ ] None required beyond the automated test evidence.

## 6. Automated Verification
- [ ] Run `./do test` and verify that `traceability.json` shows [AC-RISK-015-01] as covered.
