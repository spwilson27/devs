# Task: Implement Redacted<T> Wrapper and Credential Security Types (Sub-Epic: 01_core_domain_models_state_machine)

## Covered Requirements
- [SEC-001], [SEC-001-BR-001], [SEC-001-BR-002], [SEC-001-BR-003], [SEC-001-BR-004], [SEC-001-BR-005], [SEC-002], [SEC-002-BR-001], [SEC-004], [SEC-010], [SEC-013], [SEC-014], [SEC-014-BR-001], [SEC-014-BR-002], [SEC-014-BR-003], [SEC-015], [SEC-015-BR-001], [SEC-015-BR-002], [SEC-015-BR-003], [SEC-015-BR-004], [SEC-015-BR-005], [SEC-015-BR-006], [SEC-023], [SEC-024], [SEC-025], [SEC-064], [SEC-088], [SEC-093], [5_SECURITY_DESIGN-REQ-054], [5_SECURITY_DESIGN-REQ-074], [5_SECURITY_DESIGN-REQ-075], [5_SECURITY_DESIGN-REQ-076], [5_SECURITY_DESIGN-REQ-077], [5_SECURITY_DESIGN-REQ-078], [5_SECURITY_DESIGN-REQ-079], [5_SECURITY_DESIGN-REQ-080], [5_SECURITY_DESIGN-REQ-081], [5_SECURITY_DESIGN-REQ-082], [5_SECURITY_DESIGN-REQ-083], [5_SECURITY_DESIGN-REQ-084], [5_SECURITY_DESIGN-REQ-085], [5_SECURITY_DESIGN-REQ-201], [5_SECURITY_DESIGN-REQ-202], [5_SECURITY_DESIGN-REQ-203], [AC-SEC-1-001], [AC-SEC-1-002], [AC-SEC-1-003], [AC-SEC-1-005], [AC-SEC-1-013], [AC-SEC-1-014]

## Dependencies
- depends_on: []
- shared_components: [devs-core (Owner), Redacted<T> Security Wrapper (Owner)]

## 1. Initial Test Written
- [ ] Write test `test_redacted_debug_hides_value` asserting `format!("{:?}", Redacted::new("secret"))` contains `[REDACTED]` and not `secret`
- [ ] Write test `test_redacted_display_hides_value` asserting `format!("{}", Redacted::new("secret"))` outputs `[REDACTED]`
- [ ] Write test `test_redacted_expose_returns_inner` asserting `Redacted::new("secret").expose()` returns `&"secret"`
- [ ] Write test `test_redacted_clone` asserting `Redacted<String>` implements `Clone` correctly
- [ ] Write test `test_redacted_serde_serialize_redacts` asserting JSON serialization outputs `"[REDACTED]"` not the inner value
- [ ] Write test `test_redacted_from_string` asserting `Redacted::from("key".to_string())` works

## 2. Task Implementation
- [ ] Define `Redacted<T>` struct in `crates/devs-core/src/security/redacted.rs` with private `inner: T` field
- [ ] Implement `Redacted<T>::new(value: T) -> Self` and `Redacted<T>::expose(&self) -> &T`
- [ ] Implement `Debug` for `Redacted<T>` to emit `Redacted([REDACTED])`
- [ ] Implement `Display` for `Redacted<T>` to emit `[REDACTED]`
- [ ] Implement `Clone` where `T: Clone`, `Serialize` to always emit `"[REDACTED]"`
- [ ] Implement `From<T>` for `Redacted<T>`
- [ ] Define `CredentialSource` enum with variants `Environment { var_name: String }` and `ConfigFile { field_path: String }`
- [ ] Define `NetworkBindMode` enum with variants `Loopback` and `AllInterfaces` with a `is_loopback(&self) -> bool` method
- [ ] Add `pub mod security;` to `crates/devs-core/src/lib.rs`

## 3. Code Review
- [ ] Verify `Debug` and `Display` never leak the inner value
- [ ] Verify no `unsafe` code
- [ ] Verify `Serialize` impl always emits redacted string

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-core security::redacted` and confirm all tests pass
- [ ] Run `cargo test -p devs-core` to confirm no regressions in the crate

## 5. Update Documentation
- [ ] Add doc comments to `Redacted<T>`, `expose()`, `CredentialSource`, and `NetworkBindMode` explaining the security invariants
- [ ] Document that `expose()` is the only sanctioned access point and callers must not log the returned value

## 6. Automated Verification
- [ ] `cargo clippy -p devs-core -- -D warnings` passes with no warnings
- [ ] `cargo test -p devs-core security` passes
- [ ] `cargo fmt --check -p devs-core` passes
