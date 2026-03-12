# Task: Credential Protection and Redaction Foundation (Sub-Epic: 01_Core gRPC Server and Infrastructure)

## Covered Requirements
- [5_SECURITY_DESIGN-REQ-004], [5_SECURITY_DESIGN-REQ-010], [5_SECURITY_DESIGN-REQ-023], [5_SECURITY_DESIGN-REQ-024], [5_SECURITY_DESIGN-REQ-025], [5_SECURITY_DESIGN-REQ-063], [5_SECURITY_DESIGN-REQ-064]

## Dependencies
- depends_on: [none]
- shared_components: [devs-core]

## 1. Initial Test Written
- [ ] Create unit tests for a new `Redacted<T>` wrapper in `crates/devs-core/src/redacted.rs`.
- [ ] Assert that `Redacted<String>::serialize()` produces the literal string `"[REDACTED]"`.
- [ ] Assert that `format!("{:?}", Redacted<String>)` produces `[REDACTED]`.
- [ ] Implement a test for the `zeroize` crate integration: verify that sensitive strings are zeroed when they go out of scope (if possible to test reliably).

## 2. Task Implementation
- [ ] Implement `Redacted<T>` in `devs-core`.
- [ ] Implement `serde::Serialize` and `std::fmt::Debug` for `Redacted<T>` to always hide the inner value.
- [ ] Add a `.expose()` method that returns a reference to the inner value (mark it as `#[must_use]`).
- [ ] Implement a startup check: if `devs.toml` contains credentials in plain text, log a `WARN` event with `event_type: "security.credential_in_config"`.
- [ ] Use `Redacted<String>` for webhook secrets and any API keys stored in configuration.
- [ ] Implement the zeroization of intermediate TOML buffers after parsing credentials into `Redacted` fields.

## 3. Code Review
- [ ] Confirm that `Redacted<T>` is used consistently for all sensitive fields.
- [ ] Verify that `.expose()` is only called where absolutely necessary (e.g., when invoking an agent or sending a webhook).
- [ ] Ensure that no credentials can accidentally leak into log output.

## 4. Run Automated Tests to Verify
- [ ] `cargo test -p devs-core`

## 5. Update Documentation
- [ ] Update the developer guide to mandate the use of `Redacted<T>` for all new sensitive fields.

## 6. Automated Verification
- [ ] Use a custom script to grep the codebase for `println!` or `log!` calls that might be using sensitive field names without `Redacted`.
