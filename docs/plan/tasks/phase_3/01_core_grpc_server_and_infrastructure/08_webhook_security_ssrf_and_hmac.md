# Task: Webhook Security (SSRF and HMAC) (Sub-Epic: 01_Core gRPC Server and Infrastructure)

## Covered Requirements
- [5_SECURITY_DESIGN-REQ-009], [5_SECURITY_DESIGN-REQ-021], [5_SECURITY_DESIGN-REQ-035], [5_SECURITY_DESIGN-REQ-036], [5_SECURITY_DESIGN-REQ-037], [5_SECURITY_DESIGN-REQ-068]

## Dependencies
- depends_on: [05_credential_protection_and_redaction.md]
- shared_components: [devs-webhook]

## 1. Initial Test Written
- [ ] Write a test in `crates/devs-webhook/src/ssrf.rs` that resolves various hostnames (including loopback and RFC-1918) and verifies they are blocked.
- [ ] Create a test for HMAC-SHA256 signing: provide a secret and a payload, and verify the resulting `X-Devs-Signature-256` header matches a known-good digest.
- [ ] Test that non-HTTPS webhooks (to non-loopback URLs) log a `WARN`.

## 2. Task Implementation
- [ ] Implement the `WebhookDispatcher` in `devs-webhook`.
- [ ] Add an SSRF check that resolves hostnames to IPs and rejects loopback/private ranges (checked on every delivery attempt).
- [ ] Implement HMAC-SHA256 signing using the configured `secret`. Use constant-time comparison if applicable.
- [ ] Enforce HTTPS for non-loopback webhook targets; log a `WARN` for HTTP targets.
- [ ] Enforce a 2048-character limit on webhook URLs.
- [ ] Reject non-HTTP/HTTPS schemes (e.g., `file://`) at configuration time.

## 3. Code Review
- [ ] Verify that the SSRF check is performed *after* DNS resolution.
- [ ] Ensure that the webhook secret is never logged or included in the payload.
- [ ] Check that the HMAC signature is computed over the raw request body bytes.

## 4. Run Automated Tests to Verify
- [ ] `cargo test -p devs-webhook`

## 5. Update Documentation
- [ ] Document the webhook security requirements (signing and SSRF) in the project configuration guide.

## 6. Automated Verification
- [ ] Use a mock DNS server in tests to verify that DNS rebinding attacks are blocked.
