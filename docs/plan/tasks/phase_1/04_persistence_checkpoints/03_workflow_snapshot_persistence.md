# Task: Implement Immutable Workflow Definition Snapshot Persistence (Sub-Epic: 04_Persistence & Checkpoints)

## Covered Requirements
- [2_TAS-REQ-018], [1_PRD-REQ-009]

## Dependencies
- depends_on: [02_atomic_checkpoint_save.md]
- shared_components: [devs-core (consume), devs-config (consume), devs-checkpoint (own)]

## 1. Initial Test Written
- [ ] In `crates/devs-checkpoint/tests/snapshot_tests.rs`, write `test_snapshot_definition_creates_workflow_snapshot_json` that calls `snapshot_definition` with a `WorkflowDefinition` and asserts `.devs/runs/<run_id>/workflow_snapshot.json` exists in the committed tree.
- [ ] Write `test_snapshot_is_committed_to_git` that calls `snapshot_definition` and asserts a git commit exists with a message containing "snapshot".
- [ ] Write `test_snapshot_is_immutable_after_creation` that calls `snapshot_definition` once, then calls it again with a modified definition for the same run, and asserts the stored snapshot content matches the **first** definition (i.e., the second call is a no-op or returns the existing snapshot ID without overwriting).
- [ ] Write `test_snapshot_returns_snapshot_id` that calls `snapshot_definition` and asserts the returned `String` (snapshot ID) is non-empty and can be used to locate the snapshot file.
- [ ] Write `test_snapshot_roundtrip_preserves_definition` that snapshots a `WorkflowDefinition` with stages, inputs, and branches, then reads back the snapshot JSON and deserializes it, asserting field-level equality with the original definition.
- [ ] Write `test_snapshot_written_before_stage_transitions` — an integration-level test that sets up a run, calls `snapshot_definition`, then verifies the snapshot exists before any `StageRun` has status beyond `Waiting`.

## 2. Task Implementation
- [ ] Implement `snapshot_definition` in `GitCheckpointStore`:
  1. Compute snapshot path: `.devs/runs/<run_id>/workflow_snapshot.json`.
  2. Check if snapshot already exists in the git tree — if yes, return existing snapshot ID without modification (immutability guarantee per 2_TAS-REQ-018).
  3. Serialize `WorkflowDefinition` to JSON.
  4. Write to temp file, then atomic `rename()` to target path.
  5. Stage and commit to the checkpoint branch inside `spawn_blocking`.
  6. Return the commit SHA or a deterministic snapshot ID.
- [ ] Add a `snapshot_exists` helper that checks git tree for the snapshot file without reading the full blob.

## 3. Code Review
- [ ] Verify immutability: once written, `workflow_snapshot.json` is never modified (2_TAS-REQ-018 requirement).
- [ ] Verify the snapshot is written before any stage transitions from `Waiting` to `Eligible` — this is an ordering contract documented in the trait's doc comment.
- [ ] Verify atomic write pattern is used.
- [ ] Verify all git operations are on `spawn_blocking`.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-checkpoint -- snapshot` and confirm all tests pass.

## 5. Update Documentation
- [ ] Add `// Covers: 2_TAS-REQ-018` to `test_snapshot_is_immutable_after_creation` and `test_snapshot_is_committed_to_git`.
- [ ] Add `// Covers: 1_PRD-REQ-009` to `test_snapshot_roundtrip_preserves_definition` and `test_snapshot_written_before_stage_transitions`.

## 6. Automated Verification
- [ ] Run `cargo test -p devs-checkpoint` and verify zero failures.
- [ ] Run `cargo clippy -p devs-checkpoint -- -D warnings` and verify zero warnings.
