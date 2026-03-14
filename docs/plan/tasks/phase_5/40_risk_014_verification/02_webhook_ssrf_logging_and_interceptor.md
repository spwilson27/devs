# Task: Webhook SSRF Logging and Interceptor Verification (Sub-Epic: 40_Risk 014 Verification)

## Covered Requirements
- [RISK-014-BR-004], [AC-RISK-014-02]

## Dependencies
- depends_on: ["01_ssrf_core_unit_tests.md"]
- shared_components: [devs-webhook]

## 1. Initial Test Written
- [ ] Create a unit test `test_webhook_delivery_ssrf_intercept` in `crates/devs-webhook/src/delivery_tests.rs`.
- [ ] This test MUST use a mock `reqwest` interceptor (or equivalent mechanism used in the project) to verify that `check_ssrf()` is called before any network activity.
- [ ] The test MUST mock a blocked SSRF resolution and assert that:
    1. No network request is initiated.
    2. A `WARN` level log message is emitted with the specific fields required by **[RISK-014-BR-004]**.
    3. The delivery is marked as permanently failed.

## 2. Task Implementation
- [ ] Ensure that `WebhookDispatcher` calls `check_ssrf` at the very beginning of the delivery attempt.
- [ ] Update the error handling for `SsrfError` to log a detailed security audit event.
- [ ] The log entry MUST include:
    - `event_type: "webhook.ssrf_blocked"`
    - `url`: The original URL, but with the query string redacted as `?<redacted>`.
    - `resolved_ip`: The IP address(es) that triggered the block.
    - `reason`: A brief explanation of why it was blocked.
- [ ] Redact the URL by replacing everything after the first `?` with `?<redacted>`.

## 3. Code Review
- [ ] Verify that the log level for SSRF blocks is `WARN`.
- [ ] Confirm that `check_ssrf()` is called *every time* a delivery is attempted, ensuring no stale DNS results are used.
- [ ] Ensure that no sensitive information from the query string is leaked into the logs.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-webhook --lib delivery_tests` and ensure all tests pass.

## 5. Update Documentation
- [ ] Mark [RISK-014-BR-004] and [AC-RISK-014-02] as implemented and verified.

## 6. Automated Verification
- [ ] Execute `./do test` to confirm all `devs-webhook` tests are passing.
- [ ] Run `./do lint` and ensure there are no issues with the new logging or redirection logic.
