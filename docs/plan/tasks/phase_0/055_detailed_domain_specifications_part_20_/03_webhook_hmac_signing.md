# Task: Webhook HMAC-SHA256 Signing (Sub-Epic: 055_Detailed Domain Specifications (Part 20))

## Covered Requirements
- [2_TAS-REQ-148]

## Dependencies
- depends_on: [02_webhook_payload_schema.md]
- shared_components: [devs-core]

## 1. Initial Test Written
- [ ] In `devs-core/src/webhook/signing.rs`, create a unit test `test_webhook_signing` that:
    - Given a known `secret` and `raw_body_bytes`, computes the HMAC-SHA256 digest.
    - Asserts that the digest matches a pre-calculated lowercase hex string.
    - Verifies that a change in one bit of the `raw_body_bytes` results in a completely different digest.
    - Asserts that `WebhookSigner::sign(secret, body)` correctly formats the `X-Devs-Signature-256` header value as `sha256=<hex>`.

## 2. Task Implementation
- [ ] In `devs-core/src/webhook/signing.rs`, implement the signing logic using a library like `hmac` and `sha2`:
    ```rust
    pub fn compute_webhook_signature(secret: &str, body: &[u8]) -> String {
        // HMAC-SHA256(key=secret.as_bytes(), message=body)
        // returns lowercase hex string
    }
    ```
- [ ] Implement `WebhookSigner` struct or trait that can be used by the dispatcher in later phases to sign requests.
- [ ] Define a constant `const X_DEVS_SIGNATURE_256: &str = "X-Devs-Signature-256";`.
- [ ] Implement the warning logic to log `WARN: webhook secret stored as plaintext in projects.toml for project <name>` when a secret is detected (as per **[2_TAS-REQ-148]**). This should probably be a static method or a hook for the registry loader.

## 3. Code Review
- [ ] Verify that the signature format is `sha256=<lowercase-hex-encoded-digest>`.
- [ ] Check that `secret` is UTF-8 encoded correctly for key bytes.
- [ ] Ensure that a constant-time comparison helper is provided for recipients (if we implement a receiver mock later, but for now focus on the sender side).

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-core`.
- [ ] Cross-check signature results with an external HMAC-SHA256 generator.

## 5. Update Documentation
- [ ] Add doc comments to `compute_webhook_signature` explaining the algorithm and header format.

## 6. Automated Verification
- [ ] Run `./do presubmit`.
- [ ] Verify traceability annotations: `// Covers: [2_TAS-REQ-148]` in `devs-core/src/webhook/signing.rs`.
