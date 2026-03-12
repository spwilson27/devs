# Task: SSRF Core Unit Tests (Sub-Epic: 40_Risk 014 Verification)

## Covered Requirements
- [AC-RISK-014-01], [AC-RISK-014-03], [MIT-014]

## Dependencies
- depends_on: [none]
- shared_components: [devs-webhook]

## 1. Initial Test Written
- [ ] In `crates/devs-webhook/src/ssrf.rs` (or a dedicated test file `ssrf_core_tests.rs`), write a unit test `test_check_ssrf_metadata_service`.
- [ ] This test MUST call `check_ssrf` with the URL `http://169.254.169.254/latest/meta-data` and `allow_local = false`.
- [ ] Assert that it returns `Err(SsrfError::BlockedAddress)` (or the specific error variant used in the project).
- [ ] Write a second unit test `test_check_ssrf_mixed_resolution`.
- [ ] This test MUST mock DNS resolution (e.g., by mocking the resolver or using a known hostname if the test environment allows) such that a single hostname resolves to both a public IP (e.g., `1.2.3.4`) and a private IP (e.g., `192.168.1.1`).
- [ ] Call `check_ssrf` with this hostname and verify it returns `Err(SsrfError::BlockedAddress)`.

## 2. Task Implementation
- [ ] Ensure the `check_ssrf` function in `devs-webhook` correctly identifies `169.254.169.254` as a blocked address even when not explicitly in a private-use range (it's link-local).
- [ ] Implement the logic in `check_ssrf` to iterate over ALL IP addresses returned by the DNS resolver.
- [ ] If ANY of the resolved IP addresses fail the `is_blocked()` check, the entire function MUST return an error immediately.
- [ ] Ensure that `is_blocked()` covers all private, reserved, and link-local ranges for both IPv4 and IPv6.

## 3. Code Review
- [ ] Verify that the `check_ssrf` function is `async` and uses the project's preferred DNS resolver (e.g., `trust-dns-resolver`).
- [ ] Confirm that no partial success is allowed: if one IP is valid but another is blocked, the request must be denied.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-webhook --lib ssrf_core_tests` and ensure all tests pass.

## 5. Update Documentation
- [ ] Mark [AC-RISK-014-01] and [AC-RISK-014-03] as verified in the agent's internal progress tracker.

## 6. Automated Verification
- [ ] Run `./do test` to ensure no regressions in the `devs-webhook` crate.
