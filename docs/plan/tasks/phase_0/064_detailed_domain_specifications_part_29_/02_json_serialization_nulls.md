# Task: Implement JSON null for optional fields (Sub-Epic: 064_Detailed Domain Specifications (Part 29))

## Covered Requirements
- [2_TAS-REQ-287]

## Dependencies
- depends_on: [none]
- shared_components: [devs-core]

## 1. Initial Test Written
- [ ] Create a test in `devs-core` that defines a struct with an `Option<T>` field, serializes it to JSON when the field is `None`, and asserts that the field's key is present in the JSON object with a value of `null`.
- [ ] Repeat the test for complex domain types (e.g., `StageRun`, `WorkflowRun`).

## 2. Task Implementation
- [ ] Audit `devs-core` models and ensure that no fields use `#[serde(skip_serializing_if = "Option::is_none")]`.
- [ ] Explicitly configure `serde` (if necessary) to ensure `null` is the default representation for all `Option` types in our public API and checkpoint state.
- [ ] Ensure any custom serializers for optional fields also respect this requirement.

## 3. Code Review
- [ ] Verify that every optional field in the domain model is consistently serialized to `null` when not populated.
- [ ] Confirm that this applies to both gRPC JSON gateway responses (if any) and local state file serialization.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-core` and ensure all serialization tests pass.

## 5. Update Documentation
- [ ] Update internal developer docs to explicitly forbid the use of `skip_serializing_if` for optional fields to maintain consistency with REQ-287.

## 6. Automated Verification
- [ ] Run `./do test` to ensure that all core domain serialization remains compliant with the `null` requirement.
