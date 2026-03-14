# Task: JSON Serialization Rules and Proto3 Wrapper Mapping (Sub-Epic: 035_Foundational Technical Requirements (Part 26))

## Covered Requirements
- [2_TAS-REQ-086J], [2_TAS-REQ-086K]

## Dependencies
- depends_on: []
- shared_components: [devs-core (consumer), devs-proto (consumer)]

## 1. Initial Test Written
- [ ] In `crates/devs-core/src/serialization.rs` (or `crates/devs-core/tests/serialization_rules.rs`), write the following unit tests **before** any implementation:
  - `test_uuid_serializes_as_lowercase_hyphenated`: Create a `uuid::Uuid` from a known value, serialize it with `serde_json::to_value`, assert the result is a JSON string matching `"550e8400-e29b-41d4-a716-446655440000"` (all lowercase, hyphens present).
  - `test_datetime_utc_serializes_as_rfc3339_millis_z`: Create a `chrono::DateTime<Utc>` with known millisecond precision (e.g., `2026-03-10T14:23:05.123Z`), serialize it, assert the JSON string matches `"2026-03-10T14:23:05.123Z"` exactly — must have millisecond precision and `Z` suffix (not `+00:00`).
  - `test_optional_none_serializes_as_null_not_omitted`: Define a test struct with `Option<String>` field annotated to serialize as `null` (not skip). Serialize with value `None`, assert JSON output contains `"field_name": null` (key is present, value is `null`).
  - `test_optional_some_serializes_as_value`: Same struct with `Some("hello")`, assert JSON contains `"field_name": "hello"`.
  - `test_run_status_enum_serializes_lowercase`: Define or use the `RunStatus` enum (variants: `Pending`, `Running`, `Paused`, `Completed`, `Failed`, `Cancelled`). Serialize each variant, assert JSON strings are `"pending"`, `"running"`, `"paused"`, `"completed"`, `"failed"`, `"cancelled"`.
  - `test_stage_status_enum_serializes_lowercase`: Define or use the `StageStatus` enum (variants: `Waiting`, `Eligible`, `Running`, `Completed`, `Failed`, `Cancelled`, `Paused`, `TimedOut`, `Skipped`). Serialize each variant, assert JSON strings are `"waiting"`, `"eligible"`, `"running"`, `"completed"`, `"failed"`, `"cancelled"`, `"paused"`, `"timed_out"`, `"skipped"`.
  - `test_agent_tool_enum_serializes_lowercase_cli_name`: Define or use the `AgentTool` enum (`Claude`, `Gemini`, `Opencode`, `Qwen`, `Copilot`). Assert serialized values are `"claude"`, `"gemini"`, `"opencode"`, `"qwen"`, `"copilot"`.
  - `test_exit_code_serializes_as_json_number`: Serialize an `i32` exit code (e.g., `0`, `-1`, `137`), assert result is a JSON number, not a string.
  - `test_binary_data_base64_serialization`: Define a wrapper type for base64 binary data. Serialize `b"hello"`, assert JSON string is `"aGVsbG8="`.
  - `test_binary_data_utf8_lossy_serialization`: Define a wrapper type for UTF-8-lossy binary data. Serialize bytes containing invalid UTF-8 (`b"hello\xFFworld"`), assert JSON string contains `"hello\u{FFFD}world"` (U+FFFD replacement).
  - `test_hashmap_serializes_as_json_object`: Serialize `HashMap<String, String>` with entries `{"KEY": "value"}`, assert JSON output is `{"KEY":"value"}`.
  - `test_deserialization_roundtrip_all_types`: For each type above, verify `deserialize(serialize(value)) == value`.
- [ ] In `crates/devs-proto/tests/proto3_wrapper_null_mapping.rs`, write tests:
  - `test_absent_int32_value_maps_to_json_null`: Create a proto message struct where an `Option<i32>` wrapper field is `None`. Convert to JSON representation, assert the field is `null`, not `0` or absent.
  - `test_present_int32_value_maps_to_json_number`: Same field set to `Some(42)`, assert JSON has `42`.
  - `test_absent_string_value_maps_to_json_null`: Same for `Option<String>` wrapper, `None` → `null`.
  - `test_absent_uint64_value_maps_to_json_null`: Same for `Option<u64>`, `None` → `null`, not `0`.

## 2. Task Implementation
- [ ] In `crates/devs-core/src/serialization.rs`, create a module defining:
  - A custom `serde` serializer for `DateTime<Utc>` that formats as RFC 3339 with exactly 3 fractional digits and `Z` suffix. Use `chrono::DateTime::format` with `%Y-%m-%dT%H:%M:%S%.3fZ`. Export as `pub mod datetime_rfc3339_millis` with `serialize` and `deserialize` functions for use with `#[serde(with = "datetime_rfc3339_millis")]`.
  - A newtype `Base64Bytes(Vec<u8>)` with custom `Serialize`/`Deserialize` using the `base64` crate (standard encoding, no padding config — use `base64::engine::general_purpose::STANDARD`).
  - A newtype `Utf8LossyBytes(Vec<u8>)` with custom `Serialize` that converts via `String::from_utf8_lossy` and `Deserialize` that reads a string and encodes as UTF-8 bytes.
  - A helper attribute macro or documentation convention: all `Option<T>` fields in serializable structs must NOT use `#[serde(skip_serializing_if = "Option::is_none")]` — the default serde behavior for `Option` already serializes `None` as `null`, so just ensure no skip attributes are added.
- [ ] On all status enums (`RunStatus`, `StageStatus`, `AgentTool`) in `devs-core`, add `#[serde(rename_all = "snake_case")]` (for `TimedOut` → `"timed_out"`) or `#[serde(rename_all = "lowercase")]` as appropriate. Verify each variant name maps correctly — use explicit `#[serde(rename = "...")]` on any variant where the automatic rename doesn't match the spec.
- [ ] In `crates/devs-proto`, ensure that prost-generated types with `Option<T>` wrappers (from proto3 `google.protobuf.Int32Value` etc.) serialize to JSON `null` when `None`. If using `prost-serde` or `pbjson`, configure it accordingly. If manual conversion is needed, implement `From` traits or helper functions that map `None` → `serde_json::Value::Null`.

## 3. Code Review
- [ ] Verify no `#[serde(skip_serializing_if = "Option::is_none")]` exists on any struct field that must serialize as `null` per [2_TAS-REQ-086J].
- [ ] Verify all enum variants produce the exact lowercase/snake_case strings listed in the spec table.
- [ ] Verify `DateTime` serialization always produces exactly 3 fractional digits (not 0, 6, or 9) and `Z` suffix.
- [ ] Verify `Base64Bytes` and `Utf8LossyBytes` are distinct types — no accidental mixing of the two encoding strategies.
- [ ] Verify proto3 wrapper `None` maps to `null`, not to the proto3 default value (e.g., `0` for int, `""` for string).

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-core -- serialization` to verify all serialization rule tests pass.
- [ ] Run `cargo test -p devs-proto -- proto3_wrapper` to verify proto wrapper null mapping tests pass.

## 5. Update Documentation
- [ ] Add doc comments to the `serialization` module explaining the project-wide JSON serialization policy and referencing [2_TAS-REQ-086J] and [2_TAS-REQ-086K].
- [ ] Add doc comments on `Base64Bytes` and `Utf8LossyBytes` explaining when each is used (streaming logs vs. stage output responses).

## 6. Automated Verification
- [ ] Run `./do test` and confirm zero failures.
- [ ] Run `./do lint` and confirm zero warnings.
- [ ] Run `cargo test -p devs-core -- serialization --nocapture 2>&1 | grep -c "test result: ok"` and confirm output is `1` (all tests in the module passed).
