# Task: UTF-8 JSON Persistent Data Format Validation (Sub-Epic: 060_Detailed Domain Specifications (Part 25))

## Covered Requirements
- [2_TAS-REQ-259]

## Dependencies
- depends_on: []
- shared_components: ["devs-core", "devs-checkpoint"]

## 1. Initial Test Written
- [ ] In `devs-core` (or the crate that defines persistent domain types), create a test module `tests/json_format_test.rs` (or `mod json_format` within an existing test file) with these tests:
  - **Test 1 — Serialization produces valid UTF-8**: Serialize a representative domain type (e.g., a `WorkflowRunState` or a struct containing `BoundedString` with multi-byte UTF-8 characters like `"名前"`, `"émoji 🎉"`) to JSON via `serde_json::to_string`. Assert the output is valid UTF-8 by calling `std::str::from_utf8(bytes).is_ok()`.
    ```rust
    #[test]
    fn test_serialization_is_utf8() {
        let obj = TestPersistentType::new("名前-émoji-🎉");
        let json = serde_json::to_string(&obj).unwrap();
        assert!(std::str::from_utf8(json.as_bytes()).is_ok());
    }
    ```
  - **Test 2 — Deserialization is field-order independent**: Construct two JSON strings representing the same object but with fields in different orders. Deserialize both and assert they produce equal Rust values.
    ```rust
    #[test]
    fn test_deserialize_field_order_independent() {
        let json_a = r#"{"name":"test","status":"pending","id":"abc"}"#;
        let json_b = r#"{"id":"abc","name":"test","status":"pending"}"#;
        let a: MyType = serde_json::from_str(json_a).unwrap();
        let b: MyType = serde_json::from_str(json_b).unwrap();
        assert_eq!(a, b);
    }
    ```
  - **Test 3 — Round-trip preserves data**: Serialize a domain type to JSON, deserialize back, and assert equality with the original.
    ```rust
    #[test]
    fn test_json_round_trip() {
        let original = TestPersistentType::sample();
        let json = serde_json::to_string(&original).unwrap();
        let restored: TestPersistentType = serde_json::from_str(&json).unwrap();
        assert_eq!(original, restored);
    }
    ```
  - **Test 4 — Bytes output is valid UTF-8 JSON**: Serialize to `serde_json::to_vec`, assert every byte sequence is valid UTF-8, and assert the first non-whitespace byte is `{` or `[` (valid JSON document).
  - **Test 5 — Unknown fields are tolerated**: Deserialize a JSON string with an extra unknown field not in the struct. Assert deserialization succeeds (requires `#[serde(deny_unknown_fields)]` is NOT used, or if it is, this test documents the decision).
  - **Test 6 — Empty string fields round-trip**: Serialize a type with empty string fields, deserialize, and assert the empty strings are preserved (not converted to `null`).

## 2. Task Implementation
- [ ] Audit all persistent domain types in `devs-core` (and `devs-checkpoint` if it defines its own types) to ensure they derive `Serialize, Deserialize` from `serde`.
- [ ] Ensure all persistent types also derive `PartialEq, Debug` for test assertions.
- [ ] Verify that no custom `Deserialize` impl depends on field ordering — standard `serde_json` derived deserializers are order-independent by default, so this is mainly a check that no manual impls break this invariant.
- [ ] If any type uses `#[serde(deny_unknown_fields)]`, document the decision and update Test 5 to expect failure with a clear comment explaining why.
- [ ] Add a compile-time or doc-level assertion that `serde_json` is the only JSON serializer used for persistent files (no `simd-json`, `json5`, or manual string building).
- [ ] Create a helper function for atomic JSON file writes that enforces UTF-8:
  ```rust
  pub fn write_json_atomic<T: Serialize>(path: &Path, value: &T) -> Result<()> {
      let json = serde_json::to_string_pretty(value)?;
      debug_assert!(std::str::from_utf8(json.as_bytes()).is_ok());
      let tmp = path.with_extension("tmp");
      std::fs::write(&tmp, json.as_bytes())?;
      std::fs::rename(&tmp, path)?;
      Ok(())
  }
  ```

## 3. Code Review
- [ ] Confirm no persistent type uses `#[serde(rename_all = "...")]` inconsistently — if used, it must be uniform across all persistent types or explicitly documented per-type.
- [ ] Confirm no `Vec<u8>` or raw byte fields exist in persistent types that could produce non-UTF-8 JSON (bytes must be base64-encoded or hex-encoded if present).
- [ ] Confirm the atomic write helper writes to a `.tmp` sibling and renames, matching the pattern specified in [2_TAS-REQ-021A].

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-core` (or the relevant crate) and confirm all JSON format tests pass.
- [ ] Run `./do lint` to verify doc comments and formatting.

## 5. Update Documentation
- [ ] Add `// Covers: 2_TAS-REQ-259` annotation on each test function and on the `write_json_atomic` helper.
- [ ] Add a doc comment on `write_json_atomic` stating: "All persistent files use UTF-8 encoded JSON. Field ordering is not guaranteed by serialization but is accepted by deserialization regardless of order."

## 6. Automated Verification
- [ ] Run `cargo test -p devs-core -- json_format` and verify exit code 0.
- [ ] Run `cargo test -p devs-core 2>&1 | grep 'test result: ok'` — must match at least once.
