# Task: Implement Snapshot Immutability (Sub-Epic: 013_Foundational Technical Requirements (Part 4))

## Covered Requirements
- [2_TAS-BR-016], [2_TAS-REQ-477]

## Dependencies
- depends_on: [none]
- shared_components: [devs-core]

## 1. Initial Test Written
- [ ] Write a unit test in `devs-core/src/run.rs` (or equivalent) that initializes a `WorkflowRun` with a `None` snapshot.
- [ ] Verify that setting the snapshot for the first time succeeds.
- [ ] Verify that attempting to set or update the snapshot a second time returns an `ImmutableSnapshotError` (or similar custom error type).
- [ ] Ensure the test covers both programmatic updates and deserialization attempts that might overwrite an existing snapshot.

## 2. Task Implementation
- [ ] Define `WorkflowRun` struct in `devs-core`.
- [ ] Implement a `set_snapshot` method on `WorkflowRun` that checks if the snapshot is already `Some`.
- [ ] If `Some`, return `Err(WorkflowError::ImmutableSnapshotError)`.
- [ ] Use `serde(skip_if = "Option::is_some")` or a custom deserializer if needed to enforce this during state restoration from JSON.
- [ ] Ensure the field is private or only mutable via this controlled method.

## 3. Code Review
- [ ] Verify that the `definition_snapshot` field is correctly typed as `Option<WorkflowDefinition>`.
- [ ] Confirm that no public fields allow direct mutation of the snapshot.
- [ ] Ensure the error message specifically mentions the prohibition of updating snapshots after run start.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-core` to ensure the immutability logic is correct.
- [ ] Run `./do test` to verify traceability annotations.

## 5. Update Documentation
- [ ] Update `GEMINI.md` or internal docs if new error patterns were established for immutability.

## 6. Automated Verification
- [ ] Run `cargo clippy -p devs-core` to ensure no accidental mutability is exposed.
