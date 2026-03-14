# Task: Implement BoundedString and EnvKey Validated Types (Sub-Epic: 009_Core Domain Types)

## Covered Requirements
- [2_TAS-REQ-028], [2_TAS-REQ-029]

## Dependencies
- depends_on: []
- shared_components: [devs-core (owner — this task adds types to devs-core)]

## 1. Initial Test Written
- [ ] Create `crates/devs-core/src/types/bounded_string.rs` (or appropriate module path) with `#[cfg(test)] mod tests` containing:
  - **BoundedString construction tests ([2_TAS-REQ-028]):**
    - `test_bounded_string_valid`: `BoundedString::<10>::new("hello")` succeeds; inner value equals `"hello"`.
    - `test_bounded_string_exact_limit`: `BoundedString::<5>::new("hello")` succeeds (5 bytes = limit).
    - `test_bounded_string_over_limit`: `BoundedString::<4>::new("hello")` returns `Err(ValidationError::StringTooLong { max: 4, actual: 5 })`.
    - `test_bounded_string_empty_rejected`: `BoundedString::<10>::new("")` returns `Err(ValidationError::EmptyString)`.
    - `test_bounded_string_utf8_byte_count`: A string with a 3-byte UTF-8 character (e.g., `"é"` = 2 bytes, or `"€"` = 3 bytes) must count UTF-8 bytes, not chars. Specifically: `BoundedString::<2>::new("€")` must fail because `"€".len()` is 3.
    - `test_bounded_string_single_byte_limit`: `BoundedString::<1>::new("a")` succeeds; `BoundedString::<1>::new("ab")` fails.
  - **BoundedString trait tests ([2_TAS-REQ-028]):**
    - `test_bounded_string_deref`: Verify `*bs == "hello"` (Deref<Target = str>).
    - `test_bounded_string_display`: Verify `format!("{}", bs) == "hello"`.
    - `test_bounded_string_eq_hash`: Two `BoundedString` values with the same content are equal and produce the same hash.
    - `test_bounded_string_clone`: Verify Clone works correctly.
    - `test_bounded_string_serialize_deserialize`: Round-trip via `serde_json`: serialize produces `"hello"`, deserialize back succeeds. Deserializing a string exceeding the limit fails.
  - **Annotate all BoundedString tests with `// Covers: 2_TAS-REQ-028`.**
- [ ] Create `crates/devs-core/src/types/env_key.rs` with `#[cfg(test)] mod tests` containing:
  - **EnvKey construction tests ([2_TAS-REQ-029]):**
    - `test_env_key_valid_simple`: `EnvKey::new("MY_VAR")` succeeds.
    - `test_env_key_valid_underscore_prefix`: `EnvKey::new("_HIDDEN")` succeeds.
    - `test_env_key_valid_all_caps_digits`: `EnvKey::new("VAR_123_ABC")` succeeds.
    - `test_env_key_valid_single_char`: `EnvKey::new("A")` succeeds.
    - `test_env_key_invalid_lowercase`: `EnvKey::new("my_var")` returns `Err(ValidationError::InvalidEnvKey)`.
    - `test_env_key_invalid_starts_with_digit`: `EnvKey::new("1VAR")` returns `Err(ValidationError::InvalidEnvKey)`.
    - `test_env_key_invalid_hyphen`: `EnvKey::new("MY-VAR")` returns `Err(ValidationError::InvalidEnvKey)`.
    - `test_env_key_invalid_special_char`: `EnvKey::new("VAR!")` returns `Err(ValidationError::InvalidEnvKey)`.
    - `test_env_key_invalid_empty`: `EnvKey::new("")` returns `Err(ValidationError::InvalidEnvKey)`.
    - `test_env_key_max_length_128`: A key of exactly 128 `A` characters succeeds; 129 characters fails.
  - **Prohibited key tests ([2_TAS-REQ-029], [2_TAS-REQ-269]):**
    - `test_env_key_prohibited_devs_listen`: `EnvKey::new("DEVS_LISTEN")` returns `Err(ValidationError::ProhibitedEnvKey)`.
    - `test_env_key_prohibited_devs_mcp_port`: `EnvKey::new("DEVS_MCP_PORT")` returns `Err(ValidationError::ProhibitedEnvKey)`.
    - `test_env_key_prohibited_devs_discovery_file`: `EnvKey::new("DEVS_DISCOVERY_FILE")` returns `Err(ValidationError::ProhibitedEnvKey)`.
  - **Annotate all EnvKey tests with `// Covers: 2_TAS-REQ-029`.**

## 2. Task Implementation
- [ ] Define `ValidationError` enum in `crates/devs-core/src/error.rs` (or extend if it already exists) with at least these variants:
  - `EmptyString`
  - `StringTooLong { max: usize, actual: usize }`
  - `InvalidEnvKey`
  - `ProhibitedEnvKey`
  - Derive `thiserror::Error`, `Debug`, `Clone`, `PartialEq`.
- [ ] Implement `BoundedString<const N: usize>` in `crates/devs-core/src/types/bounded_string.rs`:
  - Tuple struct wrapping `String`.
  - Constructor: `pub fn new(s: &str) -> Result<Self, ValidationError>` — reject empty, reject if `s.len() > N` (byte length).
  - Implement: `Deref<Target = str>`, `Display`, `AsRef<str>`, `PartialEq`, `Eq`, `Hash`, `Clone`, `Debug`.
  - Implement `Serialize` (as bare string) and `Deserialize` (deserialize string, then validate via `new()`; reject on failure).
- [ ] Implement `EnvKey` in `crates/devs-core/src/types/env_key.rs`:
  - Tuple struct wrapping `String`.
  - Constructor: `pub fn new(s: &str) -> Result<Self, ValidationError>`:
    1. Check against prohibited keys list: `["DEVS_LISTEN", "DEVS_MCP_PORT", "DEVS_DISCOVERY_FILE"]` → `ProhibitedEnvKey`.
    2. Validate regex `^[A-Z_][A-Z0-9_]{0,127}$` (anchored, so total max 128 chars) → `InvalidEnvKey` on mismatch.
  - Use `std::sync::LazyLock` (stable since Rust 1.80) or `once_cell::sync::Lazy` for the compiled regex.
  - Implement: `Deref<Target = str>`, `Display`, `AsRef<str>`, `PartialEq`, `Eq`, `Hash`, `Clone`, `Debug`.
  - Implement `Serialize` / `Deserialize` (same pattern as BoundedString).
- [ ] Create `crates/devs-core/src/types/mod.rs` re-exporting both types and wire them into `lib.rs`.
- [ ] Ensure `crates/devs-core/Cargo.toml` only adds: `thiserror`, `serde` (with `derive`), `serde_json` (dev), `regex`. No tokio, git2, reqwest, or tonic.

## 3. Code Review
- [ ] Verify const generics are used correctly — `BoundedString<N>` must work for any `N: usize` at compile time.
- [ ] Verify EnvKey regex is compiled exactly once (lazy static pattern).
- [ ] Verify prohibited keys check happens before regex check (so `DEVS_LISTEN` returns `ProhibitedEnvKey`, not `InvalidEnvKey`).
- [ ] Verify `devs-core` has zero forbidden dependencies by running `cargo tree -p devs-core` and confirming no tokio/git2/reqwest/tonic.
- [ ] Verify all public items have `///` doc comments.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-core` and confirm all tests pass.
- [ ] Run `cargo clippy -p devs-core -- -D warnings` and confirm zero warnings.

## 5. Update Documentation
- [ ] Add `///` doc comments to `BoundedString`, `EnvKey`, and `ValidationError` referencing their requirement IDs.
- [ ] Add `// Covers: 2_TAS-REQ-028` and `// Covers: 2_TAS-REQ-029` annotations to all relevant test functions.

## 6. Automated Verification
- [ ] Run `cargo test -p devs-core 2>&1 | tail -5` and confirm `test result: ok`.
- [ ] Run `grep -r "Covers: 2_TAS-REQ-028" crates/devs-core/` returns at least 1 match.
- [ ] Run `grep -r "Covers: 2_TAS-REQ-029" crates/devs-core/` returns at least 1 match.
- [ ] Run `cargo tree -p devs-core` and confirm no forbidden crates appear.
