# Task: Implement Memory Safety and Code Quality Enforcement (Sub-Epic: 01_core_domain_models_state_machine)

## Covered Requirements
- [SEC-MEM-001], [SEC-MEM-002], [SEC-MEM-003], [SEC-MEM-004], [SEC-MEM-005], [SEC-MEM-006], [SEC-MEM-007], [SEC-MEM-008], [SEC-MEM-009], [SEC-MEM-010], [5_SECURITY_DESIGN-REQ-307], [5_SECURITY_DESIGN-REQ-308], [5_SECURITY_DESIGN-REQ-309], [5_SECURITY_DESIGN-REQ-310], [5_SECURITY_DESIGN-REQ-311], [5_SECURITY_DESIGN-REQ-312], [5_SECURITY_DESIGN-REQ-313], [5_SECURITY_DESIGN-REQ-314], [5_SECURITY_DESIGN-REQ-315], [5_SECURITY_DESIGN-REQ-316]

## Dependencies
- depends_on: []
- shared_components: [devs-core (Owner)]

## 1. Initial Test Written
- [ ] Write test `test_no_unsafe_code_attribute_present` asserting `#![deny(unsafe_code)]` is set in each crate's `lib.rs`
- [ ] Write test `test_bounded_string_max_length` asserting `BoundedString<1, 256>` rejects strings longer than 256 bytes
- [ ] Write test `test_bounded_string_min_length` asserting `BoundedString<1, 256>` rejects empty strings
- [ ] Write test `test_bounded_string_valid` asserting `BoundedString<1, 256>` accepts "hello"
- [ ] Write test `test_bounded_string_serde_deserialization_validates` asserting deserializing an oversized string from JSON returns an error
- [ ] Write test `test_bounded_vec_max_items` asserting `BoundedVec<T, 256>` rejects vectors with more than 256 items

## 2. Task Implementation
- [ ] Add `#![deny(unsafe_code)]` to `crates/devs-core/src/lib.rs` if not already present
- [ ] Define `BoundedString<const MIN: usize, const MAX: usize>` in `crates/devs-core/src/types/bounded.rs` wrapping `String` with validation on construction and deserialization
- [ ] Implement `BoundedString::new(s: String) -> Result<Self, BoundedError>` checking byte length against MIN..=MAX
- [ ] Implement `serde::Deserialize` for `BoundedString` that validates during deserialization
- [ ] Implement `Deref<Target=str>` for ergonomic access
- [ ] Define `BoundedVec<T, const MAX: usize>` with similar validation on construction
- [ ] Define `BoundedError` enum with `TooShort { min, actual }`, `TooLong { max, actual }`

## 3. Code Review
- [ ] Verify `#![deny(unsafe_code)]` is workspace-wide (check all crate roots)
- [ ] Verify bounded types validate at all construction points (new, deserialize, from)
- [ ] Verify no `unsafe` blocks exist in implementation

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-core -- bounded` and confirm all bounded type tests pass
- [ ] Run `cargo test -p devs-core -- unsafe` and confirm the unsafe attribute test passes
- [ ] Run `cargo clippy --workspace -- -D warnings` and confirm no warnings

## 5. Update Documentation
- [ ] Add module-level doc comment to `bounded.rs` explaining the purpose and usage of `BoundedString` and `BoundedVec`
- [ ] Document the `BoundedError` variants with examples of what triggers each

## 6. Automated Verification
- [ ] `cargo test -p devs-core` passes with no failures
- [ ] `cargo clippy --workspace -- -D unsafe_code` exits 0
- [ ] No `unsafe` keyword appears in `crates/devs-core/src/` (grep check in CI)
