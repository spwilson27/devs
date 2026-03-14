# Task: SSRF Protection Validation (Sub-Epic: 10_Phase 2 Acceptance Verification)

## Covered Requirements
- [AC-ROAD-P2-006]

## Dependencies
- depends_on: []
- shared_components: [devs-webhook (consumer)]

## 1. Initial Test Written
- [ ] Create `crates/devs-webhook/tests/ac_p2_006_ssrf_protection.rs` with unit tests for the `check_ssrf` function:
  1. `test_blocks_private_ipv4_192_168`: `check_ssrf("http://192.168.1.1/hook", false)` returns `Err`.
  2. `test_blocks_private_ipv4_10`: `check_ssrf("http://10.0.0.1/hook", false)` returns `Err`.
  3. `test_blocks_loopback_ipv4`: `check_ssrf("http://127.0.0.1/hook", false)` returns `Err`.
  4. `test_blocks_loopback_ipv6`: `check_ssrf("http://[::1]/hook", false)` returns `Err`.
  5. `test_allows_public_ip`: `check_ssrf("http://93.184.216.34/hook", false)` returns `Ok(())` (example.com's IP — use a known public IP or mock DNS resolution).
  6. `test_allow_local_flag`: `check_ssrf("http://127.0.0.1/hook", true)` returns `Ok(())` when `allow_local=true`.
- [ ] The error returned must clearly indicate the URL was rejected due to SSRF protection (e.g., error message contains "private" or "blocked" or "ssrf").
- [ ] Add `// Covers: AC-ROAD-P2-006` annotation to all test functions.

## 2. Task Implementation
- [ ] Implement `check_ssrf(url: &str, allow_local: bool) -> Result<(), SsrfError>` in `devs-webhook` (or a shared security module).
- [ ] Parse the URL to extract the host. If the host is an IP literal, check it directly. If it's a hostname, resolve it to IP addresses and check all resolved addresses.
- [ ] Block RFC 1918 ranges (`10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`), loopback (`127.0.0.0/8`, `::1`), link-local (`169.254.0.0/16`, `fe80::/10`), and other non-routable ranges.
- [ ] When `allow_local` is `true`, skip the private/loopback checks (useful for development/testing).
- [ ] Integrate `check_ssrf` into the webhook dispatcher's delivery path so that webhook target URLs are validated before HTTP requests are sent.

## 3. Code Review
- [ ] Verify that DNS resolution results are checked (DNS rebinding protection) — a hostname like `evil.com` that resolves to `127.0.0.1` must be blocked.
- [ ] Confirm the function handles both IPv4 and IPv6 addresses.
- [ ] Ensure the `allow_local` flag is only set in test/development contexts, never in production webhook config by default.

## 4. Run Automated Tests to Verify
- [ ] Execute `cargo test -p devs-webhook --test ac_p2_006_ssrf_protection -- --nocapture`

## 5. Update Documentation
- [ ] Add `// Covers: AC-ROAD-P2-006` to all SSRF test functions.

## 6. Automated Verification
- [ ] Run `./do test` and confirm `target/traceability.json` includes `AC-ROAD-P2-006`.
