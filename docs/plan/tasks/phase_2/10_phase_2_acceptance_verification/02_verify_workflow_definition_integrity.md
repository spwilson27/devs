# Task: Verify Workflow Definition Integrity (Sub-Epic: 10_Phase 2 Acceptance Verification)

## Covered Requirements
- [AC-ROAD-P2-003], [AC-ROAD-P2-004]

## Dependencies
- depends_on: [none]
- shared_components: [devs-config, devs-checkpoint]

## 1. Initial Test Written
- [ ] Create a unit test in `crates/devs-config/src/workflow_verification.rs` that attempts to load a workflow with a cycle `A -> B -> A`.
- [ ] The test must assert that `WorkflowDefinition::validate()` returns an error containing `"cycle": ["A", "B", "A"]`.
- [ ] Create a second test in `crates/devs-checkpoint/tests/snapshot_integrity.rs` that calls `write_workflow_definition` (the snapshotting logic) for an existing run.
- [ ] The test must assert that the mtime (modified time) of an existing `workflow_snapshot.json` in `.devs/runs/` remains unchanged after the call (write-once guarantee).

## 2. Task Implementation
- [ ] Implement cycle detection using a standard topological sort algorithm (e.g., Kahn's or DFS-based) in `WorkflowDefinition::validate()`.
- [ ] Update `devs-checkpoint` snapshot logic to return `Err(SnapshotError::AlreadyExists)` if the snapshot file is already present.
- [ ] Ensure that `submit_run` and `write_workflow_definition` use this validation and snapshotting logic consistently.

## 3. Code Review
- [ ] Verify that the cycle detection algorithm correctly identifies all nodes in the cycle path.
- [ ] Ensure the snapshot logic uses atomic writes but respects the write-once invariant by checking for existence before opening the file for write.

## 4. Run Automated Tests to Verify
- [ ] Execute `cargo test -p devs-config workflow_verification`
- [ ] Execute `cargo test -p devs-checkpoint snapshot_integrity`
- [ ] Ensure both tests pass and correctly handle cycles and snapshots.

## 5. Update Documentation
- [ ] Document the cycle detection error format in `docs/plan/phases/phase_2.md`.

## 6. Automated Verification
- [ ] Run `./do test` and verify that `target/traceability.json` shows [AC-ROAD-P2-003] and [AC-ROAD-P2-004] as passing.
