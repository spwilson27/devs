# Task: Persistent Data Format Validation (Sub-Epic: 060_Detailed Domain Specifications (Part 25))

## Covered Requirements
- [2_TAS-REQ-259]

## Dependencies
- depends_on: [none]
- shared_components: ["devs-checkpoint"]

## 1. Initial Test Written
- [ ] Create a unit test for JSON serialization and deserialization in `devs-core` that:
  - Verifies all generated JSON is valid UTF-8.
  - Verifies that a `WorkflowRun` or `StageRun` can be deserialized from a JSON object where the fields are ordered differently than the serialized output.
  - Verifies that no non-UTF-8 sequences are emitted during serialization (e.g., when handling `BoundedString` containing complex UTF-8).

## 2. Task Implementation
- [ ] Ensure that `serde` and `serde_json` are correctly configured for all persistent domain types in `devs-core`.
- [ ] Implement a `validate_persistence_format` helper that checks the output of any serializer against a normative UTF-8 validator.
- [ ] Verify that the `devs-checkpoint` crate uses this format correctly when writing to the `.devs/` directory.
- [ ] Implement an integration test that manually reorders fields in a `checkpoint.json` and asserts that the server can still load it correctly.

## 3. Code Review
- [ ] Confirm that no nightly features or nightly-only crate features are used for JSON serialization (per [2_TAS-REQ-003]).
- [ ] Ensure that no custom deserializers are used that accidentally depend on field ordering.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test` and confirm the serialization and order-independence tests pass.
- [ ] Run `./do lint` and ensure doc comments are present for all serialization-related types.

## 5. Update Documentation
- [ ] Update `MEMORY.md` to reflect that the persistent data format has been validated and the order-independence property is verified.

## 6. Automated Verification
- [ ] Execute `cargo test --test serialization_robustness` (or whatever the test name is) and check that it passes.
