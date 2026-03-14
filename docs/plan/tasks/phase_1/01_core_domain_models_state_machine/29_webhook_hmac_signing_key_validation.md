# Task: Implement Webhook HMAC Signing Key Validation (Sub-Epic: 01_core_domain_models_state_machine)

## Covered Requirements
- [SEC-054], [5_SECURITY_DESIGN-REQ-054]

## Dependencies
- depends_on: ["11_redacted_wrapper_credential_security.md", "15_webhook_ssrf_security.md"]
- shared_components: [devs-core (Owner), Redacted<T> Security Wrapper (Consumer), devs-config (Consumer)]

## 1. Initial Test Written
- [ ] Write test `test_webhook_signing_config_key_length_validation` asserting `WebhookSigningConfig::new(secret: &[u8])` returns `Err(KeyTooShort)` when secret is less than 32 bytes
- [ ] Write test `test_webhook_signing_config_accepts_32_byte_key` asserting a 32-byte secret is accepted
- [ ] Write test `test_webhook_signing_config_accepts_longer_key` asserting secrets longer than 32 bytes (e.g., 64 bytes) are accepted
- [ ] Write test `test_webhook_hmac_sha256_sign` asserting `WebhookSigner::sign(payload: &[u8], secret: &Redacted<Vec<u8>>)` produces a valid HMAC-SHA256 signature
- [ ] Write test `test_webhook_hmac_signature_deterministic` asserting the same payload and secret produce identical signatures
- [ ] Write test `test_webhook_hmac_signature_different_payloads` asserting different payloads produce different signatures
- [ ] Write test `test_webhook_hmac_signature_different_secrets` asserting the same payload with different secrets produces different signatures
- [ ] Write test `test_webhook_signing_config_serialization_redacts_secret` asserting JSON serialization of `WebhookSigningConfig` outputs `[REDACTED]` for the secret field
- [ ] Write test `test_hmac_algorithm_enum_sha256_only` asserting `HmacAlgorithm` enum has `Sha256` variant at MVP (no SHA-1, SHA-384, SHA-512 variants exposed in config)
- [ ] Write test `test_webhook_config_validation_error_message` asserting the error message for short keys includes the minimum required length (32 bytes)

## 2. Task Implementation
- [ ] Define `HmacAlgorithm` enum in `crates/devs-core/src/security/webhook.rs` with `Sha256` variant (MVP; extensible for post-MVP algorithms)
- [ ] Define `WebhookSigningConfig` struct with fields:
  - `secret: Redacted<Vec<u8>>` — the HMAC key wrapped in `Redacted<T>`
  - `algorithm: HmacAlgorithm` — defaults to `Sha256`
- [ ] Implement `WebhookSigningConfig::new(secret: Vec<u8>) -> Result<Self, WebhookKeyError>` that:
  1. Validates `secret.len() >= 32` bytes
  2. Wraps the secret in `Redacted<Vec<u8>>`
  3. Returns `Err(WebhookKeyError::KeyTooShort { min_bytes: 32, actual_bytes: usize })` if validation fails
- [ ] Define `WebhookKeyError` enum with `KeyTooShort { min_bytes: usize, actual_bytes: usize }` variant
- [ ] Implement `Display` and `std::error::Error` for `WebhookKeyError`
- [ ] Define `WebhookSigner` struct with `sign(payload: &[u8], secret: &Redacted<Vec<u8>>) -> Vec<u8>` method using `hmac::Hmac::<sha2::Sha256>` from RustCrypto
- [ ] Implement `WebhookSigner::verify(payload: &[u8], signature: &[u8], secret: &Redacted<Vec<u8>>) -> Result<(), VerificationError>` for signature verification
- [ ] Define `VerificationError` enum with `InvalidSignature` variant
- [ ] Implement `serde::Serialize` for `WebhookSigningConfig` that always serializes `secret` as `"[REDACTED]"`
- [ ] Implement `serde::Deserialize` for `WebhookSigningConfig` that validates key length during deserialization
- [ ] Add dependency on `hmac` and `sha2` crates from RustCrypto ecosystem to `devs-core/Cargo.toml`
- [ ] Add `pub use webhook::{WebhookSigningConfig, WebhookSigner, HmacAlgorithm, WebhookKeyError};` to `crates/devs-core/src/security/mod.rs`

## 3. Code Review
- [ ] Verify HMAC key validation rejects all keys shorter than 32 bytes with clear error message
- [ ] Verify the `hmac` and `sha2` crates from RustCrypto are used (not `ring` or other alternatives at MVP)
- [ ] Verify `Redacted<T>` wrapper is used for the secret field and serialization always redacts
- [ ] Verify no `unsafe` code is used
- [ ] Verify signature verification uses constant-time comparison (via `hmac` crate's built-in verification)

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-core security::webhook::hmac` and confirm all HMAC signing tests pass
- [ ] Run `cargo test -p devs-core security::webhook` and confirm all webhook security tests pass
- [ ] Run `cargo test -p devs-core` to confirm no regressions in the crate
- [ ] Run `cargo clippy -p devs-core -- -D warnings` and confirm no warnings

## 5. Update Documentation
- [ ] Add module-level doc comment to `crates/devs-core/src/security/webhook.rs` explaining the HMAC signing requirements per SEC-054
- [ ] Add doc comments to `WebhookSigningConfig::new` documenting the 32-byte minimum key length requirement
- [ ] Add doc comments to `WebhookSigner::sign` and `verify` explaining the HMAC-SHA256 algorithm used
- [ ] Document `WebhookKeyError::KeyTooShort` with the security rationale for 256-bit minimum key length

## 6. Automated Verification
- [ ] Confirm `cargo test -p devs-core` passes with zero failures
- [ ] Confirm `cargo doc -p devs-core --no-deps` generates documentation without errors
- [ ] Verify `hmac` and `sha2` crates appear in `cargo tree -p devs-core` output
- [ ] Run `grep -r "SEC-054" crates/devs-core/src/` and confirm the requirement ID appears in a doc comment or test annotation
