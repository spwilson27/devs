# Task: Implement Atomic `checkpoint.json` Persistence and Null Serialization (Sub-Epic: 029_Foundational Technical Requirements (Part 20))

## Covered Requirements
- [2_TAS-REQ-021A], [2_TAS-REQ-021B]

## Dependencies
- depends_on: [none]
- shared_components: [devs-checkpoint, devs-core]

## 1. Initial Test Written
- [ ] Create a unit test in `devs-checkpoint/src/checkpoint_store.rs` (or similar) that:
    - Defines a mock `Checkpoint` struct matching the schema in `docs/plan/specs/2_tas.md`.
    - Attempts to write a `Checkpoint` to a specified directory.
    - Verifies that a temporary file (e.g., `.checkpoint.json.tmp`) is created during the process.
    - Verifies that the temporary file is renamed to `checkpoint.json` upon completion.
    - Verifies that optional timestamp fields (e.g., `started_at`, `completed_at`) are serialized as literal `null` in the JSON output, not omitted.
    - Verifies that deserializing a JSON object where an optional field is completely absent still results in a `None` value (forward compatibility).

## 2. Task Implementation
- [ ] Define the `Checkpoint` and `StageRunCheckpoint` structs in `devs-checkpoint` using `serde` for serialization.
- [ ] Use `#[serde(serialize_with = ...)]` or similar if necessary to ensure `Option<T>` is serialized as `null` (though `serde_json` typically does this for `Option` if not using `skip_serializing_if`).
- [ ] Implement a `CheckpointStore` that provides a `save(path, checkpoint)` method.
- [ ] Use `std::fs::File::create` for a temporary sibling file (e.g., `.checkpoint.json.tmp`).
- [ ] Write the JSON content to the temporary file and flush it.
- [ ] Use `std::fs::rename()` to atomically move the temporary file to its final destination (`checkpoint.json`).
- [ ] Implement deserialization logic that accepts missing optional fields and treats them as `None`.

## 3. Code Review
- [ ] Ensure that `rename()` is used for atomicity.
- [ ] Verify that the `null` serialization requirement for timestamps is met.
- [ ] Ensure that the schema matches [2_TAS-REQ-021A] exactly, including `schema_version`.
- [ ] Check for proper `Result` types and error handling for I/O operations.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-checkpoint` and ensure all persistence tests pass.

## 5. Update Documentation
- [ ] Update the `devs-checkpoint` README or module documentation with the atomic write strategy.

## 6. Automated Verification
- [ ] Run a small script that inspects the resulting `checkpoint.json` file to confirm the presence of `null` values for unset optional fields.
- [ ] Run `python3 .tools/verify_requirements.py` to ensure traceability.
