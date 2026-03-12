# Task: Implement and Verify Credential Redaction (Sub-Epic: 41_Risk 014 Verification)

## Covered Requirements
- [RISK-015-BR-003]

## Dependencies
- depends_on: [none]
- shared_components: [devs-core]

## 1. Initial Test Written
- [ ] Write a unit test in `devs-core` (or the crate where `Redacted<T>` is defined) that verifies `serde::Serialize` behavior.
- [ ] The test must assert that `serde_json::to_string(&Redacted::new("secret-value"))` returns exactly the literal string `"\"[REDACTED]\""`.
- [ ] Verify that this redaction applies even when the inner type `T` is a complex struct or a number.
- [ ] Ensure that the redaction is exactly 13 characters (including the brackets).

## 2. Task Implementation
- [ ] Implement or update the `Redacted<T>` struct in `devs-core`.
- [ ] Implement `serde::Serialize` for `Redacted<T>` such that it always calls `serializer.serialize_str("[REDACTED]")`.
- [ ] Ensure `Redacted<T>` implements `std::fmt::Debug` and `std::fmt::Display` to also output `"[REDACTED]"` to prevent accidental logging (aligning with [SEC-089]).
- [ ] Apply `Redacted<T>` to sensitive fields in `ServerConfig` (e.g., API keys, tokens) in `devs-config`.

## 3. Code Review
- [ ] Verify that `Redacted<T>` does not provide any public accessor to the inner value that could be accidentally used in serialization.
- [ ] Confirm that `serde::Deserialize` is correctly implemented to allow loading the actual secret into the inner value, but `Serialize` remains hard-redacted.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-core` to verify the serialization logic.
- [ ] Run `cargo test -p devs-config` to ensure config loading still works with `Redacted<T>`.

## 5. Update Documentation
- [ ] Update `GEMINI.md` to reflect that `Redacted<T>` is now enforced for all credential serialization.

## 6. Automated Verification
- [ ] Run `./do test` and verify that `traceability.json` shows [RISK-015-BR-003] as covered.
