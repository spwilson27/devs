# Task: MCP Serialization Standard & Policy Tests (Sub-Epic: 010_Foundational Technical Requirements (Part 1))

## Covered Requirements
- [2_PRD-BR-001], [2_PRD-BR-002]

## Dependencies
- depends_on: [docs/plan/tasks/phase_0/008_proto_core_foundation/03_setup_devs_core_foundation.md]
- shared_components: [devs-core]

## 1. Initial Test Written
- [ ] Create a test in `devs-core/tests/mcp_serialization_policy.rs` that:
    - Defines a dummy domain struct with various field types (including `Option<T>`, `Vec<T>`, and nested structs).
    - Serializes an instance with `None` values using `serde_json`.
    - Asserts that the resulting JSON string contains the field names for `None` values with a `null` value (e.g., `"field": null`) rather than the field being omitted.
    - Uses reflection or a custom macro to iterate over all fields of a struct and verify their presence in the serialized output.

## 2. Task Implementation
- [ ] Configure `devs-core` to use `serde` with the `derive` feature.
- [ ] Establish a project-wide `serde` configuration (via a common attribute or a custom wrapper) that enforces `#[serde(skip_serializing_if = "Option::is_none")]` is **NEVER** used for MCP-exposed entities.
- [ ] Implement a `McpEntity` marker trait in `devs-core` that identifies structs intended for MCP exposure.
- [ ] Provide a helper function `assert_mcp_compliance<T: McpEntity + Serialize>(entity: T)` that performs the field-presence and typed-null assertions.

## 3. Code Review
- [ ] Verify that the serialization policy correctly handles nested structures and collections.
- [ ] Ensure that the `McpEntity` trait is easy to apply to new domain types as they are developed.
- [ ] Check that the policy adheres to the "Glass-Box" philosophy where no internal state is hidden.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-core --test mcp_serialization_policy`.

## 5. Update Documentation
- [ ] Update `devs-core/README.md` to document the MCP serialization policy and the mandatory use of the `McpEntity` trait for public domain entities.

## 6. Automated Verification
- [ ] Verify that any struct in `devs-core` implementing `McpEntity` passes the compliance check.
