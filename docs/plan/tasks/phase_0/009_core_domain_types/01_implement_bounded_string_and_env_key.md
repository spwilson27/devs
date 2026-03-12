# Task: Implement BoundedString and EnvKey (Sub-Epic: 009_Core Domain Types)

## Covered Requirements
- [2_TAS-REQ-028], [2_TAS-REQ-029]

## Dependencies
- depends_on: [docs/plan/tasks/phase_0/008_proto_core_foundation/03_setup_devs_core_foundation.md]
- shared_components: [devs-core]

## 1. Initial Test Written
- [ ] Create unit tests in `crates/devs-core/src/types/bounded_string.rs`:
  - Test that `BoundedString::<10>::try_from("short")` succeeds.
  - Test that `BoundedString::<10>::try_from("too long string")` fails with `ValidationError::StringTooLong`.
  - Test that `BoundedString::<10>::try_from("")` fails with `ValidationError::EmptyString`.
  - Test that UTF-8 byte count is used for length (e.g., a 3-byte emoji counts as 3).
- [ ] Create unit tests in `crates/devs-core/src/types/env_key.rs`:
  - Test valid keys: `MY_VAR`, `VAR123`, `_HIDDEN`.
  - Test invalid keys (regex mismatch): `my-var`, `123VAR`, `VAR!`.
  - Test prohibited keys: `DEVS_LISTEN`, `DEVS_MCP_PORT`, `DEVS_DISCOVERY_FILE` fail with `ValidationError::ProhibitedEnvKey`.
  - Test length limit: > 128 characters fails with `ValidationError::InvalidEnvKey` or `ValidationError::StringTooLong`.

## 2. Task Implementation
- [ ] Implement `BoundedString<const N: usize>` as a tuple struct wrapping a `String`.
  - Implement `TryFrom<String>` and `TryFrom<&str>`.
  - Ensure it implements `Deref<Target = str>`, `Display`, `AsRef<str>`, and `Serialize`/`Deserialize`.
- [ ] Implement `EnvKey` as a tuple struct wrapping a `String`.
  - Implement `TryFrom<String>` and `TryFrom<&str>`.
  - Use `lazy_static` or `once_cell` for the regex `[A-Z_][A-Z0-9_]{0,127}`.
  - Add a check against the prohibited keys list.
- [ ] Integrate these types into `crates/devs-core/src/types/mod.rs` and `lib.rs`.
- [ ] Update `ValidationError` in `devs-core` to include `EmptyString`, `StringTooLong(usize)`, and `ProhibitedEnvKey`.

## 3. Code Review
- [ ] Verify that `BoundedString` uses `const generics` correctly.
- [ ] Ensure `EnvKey` validation is performant (compiled regex).
- [ ] Check that `devs-core` remains free of heavy dependencies (e.g. only `thiserror`, `serde`, `regex`).

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-core --lib types` and ensure all tests pass.

## 5. Update Documentation
- [ ] Add doc comments to `BoundedString` and `EnvKey` explaining their constraints and requirement mappings.

## 6. Automated Verification
- [ ] Run `grep -r "2_TAS-REQ-028" crates/devs-core/` and `grep -r "2_TAS-REQ-029" crates/devs-core/` to ensure traceability.
