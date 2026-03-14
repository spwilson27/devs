# Task: CLI Submit Input Parameter Parsing (Sub-Epic: 053_Detailed Domain Specifications (Part 18))

## Covered Requirements
- [2_TAS-REQ-137]

## Dependencies
- depends_on: [none]
- shared_components: [devs-core (consumer — uses error types)]

## 1. Initial Test Written
- [ ] Create module `crates/devs-core/src/input_parsing.rs` and register it in `lib.rs`.
- [ ] Define `InputParseError` enum with variants:
  - `MissingEquals { raw: String }` — input string has no `=` character.
  - `DuplicateKey { key: String }` — same key appears more than once.
- [ ] Write these unit tests (all fail-first):
  - `test_simple_key_value`: Input `["key=value"]`. Assert `Ok(HashMap)` with `{"key": "value"}`.
  - `test_split_on_first_equals_only`: Input `["key=value=more=stuff"]`. Assert `{"key": "value=more=stuff"}`.
  - `test_empty_value`: Input `["key="]`. Assert `{"key": ""}` — empty string value is valid.
  - `test_missing_equals_rejected`: Input `["key_only"]`. Assert `Err(InputParseError::MissingEquals)`.
  - `test_duplicate_keys_rejected`: Input `["k=v1", "k=v2"]`. Assert `Err(InputParseError::DuplicateKey { key: "k" })`.
  - `test_multiple_valid_inputs`: Input `["a=1", "b=2", "c=3"]`. Assert all three present in result map.
  - `test_empty_input_list`: Input `[]`. Assert `Ok(empty HashMap)`.
  - `test_equals_sign_in_key_position`: Input `["=value"]`. Assert `{"": "value"}` or decide to reject empty keys — document the decision. (REQ-137 doesn't explicitly forbid empty keys; if rejected, add a variant `EmptyKey`.)
- [ ] Tag each test with `// Covers: 2_TAS-REQ-137`.

## 2. Task Implementation
- [ ] Implement `pub fn parse_input_parameters(raw: &[String]) -> Result<HashMap<String, String>, InputParseError>`:
  1. Create an empty `HashMap<String, String>`.
  2. For each string in `raw`:
     a. Find the index of the first `'='` character. If none found, return `Err(MissingEquals { raw: s.clone() })`.
     b. Split at that index: `key = &s[..idx]`, `value = &s[idx+1..]`.
     c. If `key` is already in the map, return `Err(DuplicateKey { key: key.to_string() })`.
     d. Insert `(key.to_string(), value.to_string())`.
  3. Return `Ok(map)`.
- [ ] Derive `Debug, Clone, PartialEq` on `InputParseError`.
- [ ] Implement `Display` and `Error` for `InputParseError`.
- [ ] Add doc comment `/// Covers: 2_TAS-REQ-137` on the function.
- [ ] Note: This function does NOT perform type coercion — REQ-137 explicitly states "Values are passed as strings; the server performs type coercion."

## 3. Code Review
- [ ] Verify split is on the FIRST `=` only (not `splitn` with wrong count, not `split('=').collect()`).
- [ ] Verify duplicate detection happens eagerly (fail on first duplicate, not after collecting all).
- [ ] Verify the function returns `HashMap<String, String>` (not `BTreeMap` or `Vec<(String, String)>`).
- [ ] No `unwrap()` or `panic!()` outside tests.
- [ ] All public items have doc comments.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-core -- input_parsing` and ensure all 8 test cases pass.
- [ ] Run `cargo clippy -p devs-core -- -D warnings` with zero warnings.

## 5. Update Documentation
- [ ] Add `pub mod input_parsing;` to `crates/devs-core/src/lib.rs` if not already present.
- [ ] Module-level doc comment explaining the CLI `--input key=value` parsing contract.

## 6. Automated Verification
- [ ] Run `./do lint` — must pass.
- [ ] Run `./do test` — must pass; verify `input_parsing` tests appear in output.
- [ ] Grep for `// Covers: 2_TAS-REQ-137` to confirm traceability.
