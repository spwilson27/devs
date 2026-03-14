# Task: Workflow Snapshot Immutability Verification (Sub-Epic: 10_Phase 2 Acceptance Verification)

## Covered Requirements
- [AC-ROAD-P2-004]

## Dependencies
- depends_on: []
- shared_components: [devs-scheduler (consumer), devs-checkpoint (consumer)]

## 1. Initial Test Written
- [ ] Create `crates/devs-scheduler/tests/ac_p2_004_snapshot_immutability.rs` with a `#[tokio::test]`:
  1. Initialize a temp git repo and checkpoint store.
  2. Define workflow `W` and submit a run. This creates `.devs/runs/<run_id>/workflow_snapshot.json`.
  3. Record the `mtime` (modification time) of `workflow_snapshot.json` using `std::fs::metadata().modified()`.
  4. Call `write_workflow_definition` to update workflow `W` with different stage definitions.
  5. Re-read the `mtime` of the **existing** `workflow_snapshot.json` for the in-flight run.
  6. Assert the mtime has NOT changed — the snapshot file was not modified.
- [ ] Add a second test that submits a NEW run after `write_workflow_definition` and verifies the new run's snapshot reflects the updated definition while the old run's snapshot remains unchanged.
- [ ] Add `// Covers: AC-ROAD-P2-004` annotation.

## 2. Task Implementation
- [ ] Verify that `snapshot_definition` in `devs-checkpoint` writes the file only at run creation time and never overwrites an existing snapshot file.
- [ ] Ensure `write_workflow_definition` (or equivalent config update path) does NOT iterate over or modify files in `.devs/runs/*/`.
- [ ] If snapshot files are written via `CheckpointStore::save_checkpoint`, ensure the snapshot portion is skipped if the file already exists.

## 3. Code Review
- [ ] Confirm that `workflow_snapshot.json` files are write-once: the code path that creates them checks for existence before writing.
- [ ] Verify no code path in the scheduler or checkpoint store performs "update snapshot" operations.

## 4. Run Automated Tests to Verify
- [ ] Execute `cargo test -p devs-scheduler --test ac_p2_004_snapshot_immutability -- --nocapture`

## 5. Update Documentation
- [ ] Add `// Covers: AC-ROAD-P2-004` to all relevant tests.

## 6. Automated Verification
- [ ] Run `./do test` and confirm `target/traceability.json` includes `AC-ROAD-P2-004`.
