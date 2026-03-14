# Task: MCP Serialization Policy — All Fields Present, Typed Nulls (Sub-Epic: 010_Foundational Technical Requirements (Part 1))

## Covered Requirements
- [2_PRD-BR-001], [2_PRD-BR-002]

## Dependencies
- depends_on: [none]
- shared_components: [devs-core (consumer — uses domain types once available; initial policy module can be scaffolded independently)]

## 1. Initial Test Written
- [ ] Create `devs-core/tests/mcp_serialization_policy.rs` (integration test file).
- [ ] **Test: `test_optional_fields_serialize_as_null_not_absent`** — Define a struct `SampleMcpEntity` with fields: `name: String`, `completed_at: Option<String>`, `exit_code: Option<i32>`, `tags: Vec<String>`, `nested: Option<NestedEntity>`. Derive `Serialize, Deserialize`. Create an instance where all `Option` fields are `None` and `tags` is empty. Serialize to JSON via `serde_json::to_value`. Assert that the resulting `serde_json::Value` object contains keys `"completed_at"`, `"exit_code"`, and `"nested"` with `Value::Null` — they must NOT be absent from the map. This directly enforces [2_PRD-BR-002].
- [ ] **Test: `test_all_domain_fields_present_in_serialized_output`** — For each field declared on `SampleMcpEntity`, assert that the serialized JSON map contains a key matching that field name. Use `serde_json::to_value` and check `.as_object().unwrap().contains_key(field_name)` for every field. This enforces [2_PRD-BR-001] at the serialization layer.
- [ ] **Test: `test_nested_optional_fields_are_typed_null`** — Create a `SampleMcpEntity` where `nested` is `Some(NestedEntity { detail: None })`. Serialize and verify `nested.detail` is present as `null` in the JSON, not omitted.
- [ ] **Test: `test_skip_serializing_if_is_forbidden`** — Write a compile-time or grep-based test: scan all `.rs` files under `devs-core/src/` for the string `skip_serializing_if`. Assert zero matches. This prevents future regressions where a developer adds `#[serde(skip_serializing_if = "Option::is_none")]` to an MCP-exposed type.
- [ ] All tests must include `// Covers: 2_PRD-BR-001` or `// Covers: 2_PRD-BR-002` annotations as appropriate.

## 2. Task Implementation
- [ ] Ensure `devs-core` has `serde` and `serde_json` as dependencies (serde with `derive` feature).
- [ ] In `devs-core/src/mcp_policy.rs`, define a marker trait `McpExposed` (empty trait) that all MCP-serializable domain types must implement. Add a doc comment explaining that types implementing this trait MUST NOT use `skip_serializing_if` on any field.
- [ ] Provide a test helper function `assert_mcp_fields_present<T: Serialize>(entity: &T, expected_fields: &[&str])` that serializes the entity and checks every expected field is present in the JSON output. Place this in `devs-core/src/mcp_policy.rs` behind `#[cfg(test)]` or in a `test_support` module.
- [ ] Add `pub mod mcp_policy;` to `devs-core/src/lib.rs`.
- [ ] Do NOT add `#[serde(skip_serializing_if = ...)]` to any struct. The default serde behavior serializes `None` as `null`, which is exactly what [2_PRD-BR-002] requires.

## 3. Code Review
- [ ] Verify that no `skip_serializing_if` attribute exists anywhere in `devs-core`.
- [ ] Confirm that the `McpExposed` trait is documented with the serialization policy rationale.
- [ ] Ensure the test helper is reusable by downstream crates (Phase 3: devs-mcp, devs-grpc) when they define their own MCP-exposed types.
- [ ] Verify the approach works for both flat and nested struct hierarchies.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-core --test mcp_serialization_policy` and confirm all tests pass.
- [ ] Run `cargo test -p devs-core` to confirm no regressions in existing tests.

## 5. Update Documentation
- [ ] Add a doc comment on the `mcp_policy` module explaining the Glass-Box serialization rule: all fields always present, `None` → `null`, never absent.

## 6. Automated Verification
- [ ] Run `grep -r 'skip_serializing_if' devs-core/src/` and confirm zero matches.
- [ ] Run `cargo test -p devs-core --test mcp_serialization_policy -- --nocapture` and verify all `Covers:` annotations appear in test names or output.
