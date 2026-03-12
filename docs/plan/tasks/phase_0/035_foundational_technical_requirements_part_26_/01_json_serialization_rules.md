# Task: JSON Serialization Rules and Proto3 Wrapper Mapping (Sub-Epic: 035_Foundational Technical Requirements (Part 26))

## Covered Requirements
- [2_TAS-REQ-086J], [2_TAS-REQ-086K]

## Dependencies
- depends_on: [none]
- shared_components: [devs-core, devs-proto]

## 1. Initial Test Written
- [ ] Create unit tests in `devs-core` for `serde` serialization/deserialization of domain types:
    - Test `Uuid` serialization results in lowercase hyphenated strings.
    - Test `DateTime<Utc>` serialization results in ISO 8601 strings.
    - Test nullable fields (`Option<T>`) serialize to explicit `null` when `None`.
    - Test enums serialize to lowercase strings.
    - Test binary data (`Vec<u8>`) serializes to base64 strings or UTF-8 with replacement as specified.
- [ ] Create integration tests in `devs-proto` (or a dedicated serialization test crate) to verify that Proto3 well-known wrapper types (e.g., `google.protobuf.StringValue`, `google.protobuf.Int32Value`) map to `null` in JSON when they are absent in the message.
    - Test that an absent `StringValue` results in `"field": null` in the JSON output, not the absence of the field or a default value like `""`.

## 2. Task Implementation
- [ ] Implement or configure `serde` attributes for domain types in `devs-core` to adhere to the serialization rules:
    - Use `#[serde(rename_all = "lowercase")]` for enums where applicable.
    - Configure `Uuid` and `DateTime` serialization to match the required formats (lowercase hyphenated and ISO 8601).
    - Ensure `Option` fields are not skipped but serialized as `null` (e.g., using `#[serde(serialize_with = ...)]` or globally configuring the serializer if possible).
- [ ] Configure `prost-helper` or `tonic`'s JSON serialization (if using `serde` on proto-generated types) to ensure Proto3 wrapper types map to `null` when absent.
    - If using `prost-serde`, ensure it is configured to handle `Option` wrappers as `null` in JSON.

## 3. Code Review
- [ ] Verify that all domain types in `devs-core` follow these rules consistently.
- [ ] Check that `devs-proto` generated code correctly handles JSON mapping for well-known types.
- [ ] Ensure that the serialization is deterministic and handles all edge cases mentioned (like binary data).

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-core` to verify domain type serialization.
- [ ] Run `cargo test -p devs-proto` (or the integration test) to verify Proto3 wrapper mapping.

## 5. Update Documentation
- [ ] Document the JSON serialization standards in the `devs-core` README or a dedicated developer guide.
- [ ] Add doc comments to core types explaining their serialization behavior.

## 6. Automated Verification
- [ ] Run `./do lint` to ensure code quality and documentation are up to standard.
- [ ] Run `./do coverage` to ensure serialization logic is fully covered by tests.
