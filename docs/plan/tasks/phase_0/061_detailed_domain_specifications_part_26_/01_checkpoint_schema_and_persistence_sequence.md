# Task: Implement Checkpoint Schema Versioning and Core Persistence Sequence (Sub-Epic: 061_Detailed Domain Specifications (Part 26))

## Covered Requirements
- [2_TAS-REQ-261], [2_TAS-REQ-268]

## Dependencies
- depends_on: [none]
- shared_components: [devs-core, devs-checkpoint]

## 1. Initial Test Written
- [ ] In `devs-checkpoint/src/lib.rs` (or a dedicated test file), write a unit test that attempts to deserialize a `checkpoint.json` with `schema_version` not equal to 1. Verify that it returns a specific schema migration error.
- [ ] In `devs-core/src/state.rs`, write a unit test for the state mutation process. Use a mock for the persistence layer and the event broadcaster. Verify that the sequence of calls is: 1. Mutation applied, 2. Persisted to disk, 3. Event broadcasted. The test must fail if the order is different.

## 2. Task Implementation
- [ ] In `devs-core`, update the `WorkflowRun` or `Checkpoint` struct to include a `schema_version` field. Add a custom `serde` deserializer or a validation step that enforces `schema_version == 1`.
- [ ] In `devs-checkpoint`, implement the deserialization logic for `checkpoint.json` that checks the `schema_version` and returns `Error::SchemaMigrationRequired` (or similar) if it's not 1.
- [ ] In `devs-core/src/state.rs`, implement the authoritative state mutation logic (e.g., in `ServerState::apply_transition`). Ensure it follows the Mutation -> Persist -> Broadcast sequence as specified.
- [ ] Ensure all public items are documented with doc comments.

## 3. Code Review
- [ ] Verify that `schema_version` is an integer and strictly enforced to be 1.
- [ ] Verify that the event broadcast *never* happens before the state is successfully (or attempted to be) persisted to disk.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-core -p devs-checkpoint` and ensure the new tests pass.

## 5. Update Documentation
- [ ] Update `devs-checkpoint` documentation to reflect the schema versioning requirement.

## 6. Automated Verification
- [ ] Run `./do test` and verify that the tests are correctly annotated with `// Covers: 2_TAS-REQ-261` and `// Covers: 2_TAS-REQ-268`.
