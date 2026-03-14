# Task: JSON Null Presence for Optional Fields (Sub-Epic: 064_Detailed Domain Specifications (Part 29))

## Covered Requirements
- [2_TAS-REQ-287]

## Dependencies
- depends_on: ["none"]
- shared_components: ["devs-core", "devs-proto"]

## 1. Initial Test Written
- [ ] Write a unit test `test_optional_field_serializes_as_null_when_none` that:
  1. Creates a domain type with an optional field set to `None` (e.g., `started_at: Option<DateTime<Utc>>`).
  2. Serializes it to JSON using `serde_json::to_value`.
  3. Asserts the JSON object contains the key (e.g., `"started_at"`) with value `serde_json::Value::Null`.
  4. Asserts the key is NOT absent from the object.
- [ ] Write a unit test `test_optional_field_serializes_as_value_when_some` that:
  1. Sets the optional field to `Some(value)`.
  2. Serializes and asserts the key is present with the correct non-null value.
- [ ] Write a unit test `test_all_optional_fields_present_in_json` that:
  1. Creates a struct with multiple optional fields, all set to `None`.
  2. Serializes to JSON and asserts every optional field key is present in the output object (value is `null`).
- [ ] Write a round-trip test `test_json_null_deserializes_to_none` that:
  1. Takes JSON with `"field": null` and deserializes it.
  2. Asserts the Rust field is `None`.

## 2. Task Implementation
- [ ] For all domain types that are serialized to JSON (MCP responses, CLI `--json` output, structured stage output), annotate `Option<T>` fields with `#[serde(serialize_with = "serialize_option_as_null")]` or use the simpler `#[serde(default)]` combined with a custom serializer that ensures keys are always present.
- [ ] Alternatively, apply a crate-wide policy: create a serde helper module `crate::serde_helpers` with a function `serialize_option_as_null<T, S>(value: &Option<T>, serializer: S)` that serializes `None` as `null` (not skipped).
- [ ] Audit all structs with `#[serde(skip_serializing_if = "Option::is_none")]` and remove that attribute — this is the primary cause of absent keys. Replace with the null-preserving serializer.

## 3. Code Review
- [ ] Grep the workspace for `skip_serializing_if.*is_none` and confirm zero occurrences on types used in JSON output.
- [ ] Verify the serde helper is tested independently.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test --workspace -- json_null` and confirm all tests pass.

## 5. Update Documentation
- [ ] Add a doc comment on the serde helper module explaining the JSON null policy and referencing [2_TAS-REQ-287].

## 6. Automated Verification
- [ ] Run `cargo test --workspace` and verify exit code 0.
- [ ] Run `grep -r 'skip_serializing_if.*is_none' crates/` and verify no matches in JSON-facing types.
