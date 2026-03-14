# Task: Implement Webhook SSRF Mitigation Business Rules (Sub-Epic: 39_Risk 013 Verification)

## Covered Requirements
- [RISK-014], [RISK-014-BR-001], [RISK-014-BR-002], [RISK-014-BR-003]

## Dependencies
- depends_on: []
- shared_components: [devs-webhook (Consumer)]

## 1. Initial Test Written
- [ ] Create a unit test suite in `crates/devs-webhook/src/ssrf_test.rs` for `check_ssrf`.
- [ ] The test MUST verify **[RISK-014-BR-001]** by mocking a delivery attempt and ensuring `check_ssrf()` is the first call made after DNS resolution.
- [ ] The test MUST verify **[RISK-014-BR-002]** by:
    1.  Defining a hostname that resolves to both a public IP (`1.2.3.4`) and a private IP (`192.168.1.1`).
    2.  Calling the SSRF check on this set of addresses.
    3.  Asserting that it returns a terminal error (`SsrfError::BlockedAddress`) because at least one address is blocked.
- [ ] The test MUST verify **[RISK-014-BR-003]** by:
    1.  Mocking a DNS resolution failure (e.g., `io::ErrorKind::TimedOut`).
    2.  Verifying that the webhook delivery logic treats this as a standard retryable failure, NOT as an SSRF violation.
    3.  Confirming that it does NOT result in a permanent block.

## 2. Task Implementation
- [ ] Implement or update `check_ssrf(resolved_ips: &[IpAddr]) -> Result<(), SsrfError>` in the `devs-webhook` crate.
- [ ] In `WebhookDispatcher`, update the delivery loop to perform DNS resolution before each attempt.
- [ ] Immediately after resolution, iterate through ALL resolved IP addresses and call the SSRF blocklist check on each one.
- [ ] If ANY IP address is in a private or reserved range (loopback, private-use, link-local, multicast, etc.), immediately abort the delivery with a terminal `WebhookError::SsrfBlocked`.
- [ ] Ensure that a DNS resolution failure (e.g., from `trust-dns-resolver` or `std::net::ToSocketAddrs`) is caught and wrapped in a retryable error type.
- [ ] Log all SSRF-blocked attempts with a clear `WARN` message for security auditing.

## 3. Code Review
- [ ] Confirm that the SSRF blocklist is exhaustive (covers IPv4 and IPv6 private/reserved ranges).
- [ ] Verify that `check_ssrf()` is called *every time* a delivery is attempted, not just once at the start, to protect against DNS rebinding.
- [ ] Ensure that no HTTP request is initiated (even the headers) before the SSRF check passes.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-webhook --lib ssrf_test` and ensure all scenarios pass.
- [ ] Verify that the E2E tests for webhooks still pass without regressions.

## 5. Update Documentation
- [ ] Update `docs/plan/requirements/8_risks_mitigation.md` to mark [RISK-014], [RISK-014-BR-001], [RISK-014-BR-002], [RISK-014-BR-003] as implemented and verified.
- [ ] Add a note to `devs-webhook/README.md` explaining the SSRF protection mechanism.

## 6. Automated Verification
- [ ] Create a local mock server and configure a webhook to point to `http://localhost:<port>`.
- [ ] Verify that the SSRF check blocks this delivery if local addresses are in the blocklist.
- [ ] Temporarily add a unit test that mocks `check_ssrf()` returning an error and confirm that the delivery is aborted immediately without any network activity.
