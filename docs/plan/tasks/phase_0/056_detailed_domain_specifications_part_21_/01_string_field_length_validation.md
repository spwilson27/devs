# Task: String Field Length Limit Enforcement via BoundedString (Sub-Epic: 056_Detailed Domain Specifications (Part 21))

## Covered Requirements
- [2_TAS-REQ-153]

## Dependencies
- depends_on: none
- shared_components: [devs-core (Owner — BoundedString type)]

## 1. Initial Test Written
- [ ] In `crates/devs-core/src/bounded_string.rs` (or equivalent module), write unit tests for `BoundedString<MIN, MAX>`:
  - `test_bounded_string_valid` — constructing with a string of length between MIN and MAX succeeds.
  - `test_bounded_string_too_short` — constructing with a string shorter than MIN returns `Err(ValidationError::TooShort { min: MIN, actual: len })`.
  - `test_bounded_string_too_long` — constructing with a string longer than MAX returns `Err(ValidationError::TooLong { max: MAX, actual: len })`.
  - `test_bounded_string_empty_when_min_zero` — MIN=0 allows empty strings.
  - `test_bounded_string_exact_min` — string of exactly MIN length succeeds.
  - `test_bounded_string_exact_max` — string of exactly MAX length succeeds.
  - `test_bounded_string_deref` — `BoundedString` derefs to `&str`.
  - `test_bounded_string_serde_roundtrip` — serializes to the inner string and deserializes back, rejecting out-of-bounds values during deserialization.
  - `test_bounded_string_display` — `Display` impl outputs the inner string.
- [ ] Each test must include `// Covers: 2_TAS-REQ-153` annotation.

## 2. Task Implementation
- [ ] Define `ValidationError` enum in `devs-core` with variants `TooShort { min: usize, actual: usize }` and `TooLong { max: usize, actual: usize }` (plus any existing variants).
- [ ] Implement `BoundedString<const MIN: usize, const MAX: usize>` as a newtype over `String`:
  - `pub fn new(value: impl Into<String>) -> Result<Self, ValidationError>` — validates length at construction.
  - `impl Deref<Target = str>` for ergonomic read access.
  - `impl Display` forwarding to inner string.
  - `impl Serialize` / `impl Deserialize` with validation in the `Deserialize` impl (reject invalid lengths).
  - `impl Debug` showing the inner value.
- [ ] Define common type aliases used across the project, e.g.:
  - `pub type WorkflowName = BoundedString<1, 128>;`
  - `pub type StageName = BoundedString<1, 128>;`
  - `pub type RunName = BoundedString<1, 256>;`
  - `pub type PoolName = BoundedString<1, 64>;`

## 3. Code Review
- [ ] Verify that invalid values can never be constructed — no `pub` field access, no `Default` that bypasses validation.
- [ ] Verify `ValidationError` is the only error type returned (not `anyhow` — devs-core is a library crate).
- [ ] Confirm no `unsafe` code.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-core --lib` and confirm all `bounded_string` tests pass.

## 5. Update Documentation
- [ ] Add doc comments to `BoundedString`, `ValidationError`, and all type aliases explaining their invariants and limits.

## 6. Automated Verification
- [ ] Run `./do test` and confirm zero failures.
- [ ] Run `./do lint` and confirm no warnings or errors.
