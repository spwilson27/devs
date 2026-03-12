# Task: AC-RISK-025-04 Acceptance Test — write_workflow_definition Does Not Mutate Snapshots of Active Runs (Sub-Epic: 56_Risk 025 Verification)

## Covered Requirements
- [AC-RISK-025-04]

## Dependencies
- depends_on: [none]
- shared_components: [devs-scheduler, devs-checkpoint, devs-core]

## 1. Initial Test Written

- [ ] In `crates/devs-scheduler/tests/ac_risk_025_04_two_active_runs_snapshot_isolation.rs`, write an integration test `test_ac_risk_025_04_write_definition_does_not_mutate_active_run_snapshots` that:

  **Setup:**
  1. Create a `SchedulerState` with a real filesystem-backed `CheckpointStore` in a `TempDir` (do not use mocks — this must exercise the actual persist path).
  2. Register project `"proj-gamma"`.
  3. Register workflow `"wf-shared"` with `DefinitionV1` containing a single stage `{"name": "stage-v1", "prompt": "original-prompt-v1"}`. Record the definition as `definition_v1`.

  **Submit two runs before any mutation:**
  4. Call `scheduler_state.submit_run("proj-gamma", "wf-shared", "run-001", &[])` and capture the returned `WorkflowRun` as `run_a`.
  5. Assert `run_a.definition_snapshot.stages[0].name == "stage-v1"`.
  6. Call `scheduler_state.submit_run("proj-gamma", "wf-shared", "run-002", &[])` and capture the returned `WorkflowRun` as `run_b`.
  7. Assert `run_b.definition_snapshot.stages[0].name == "stage-v1"`.
  8. Assert `run_a.run_id != run_b.run_id`.

  **Mutate the live workflow definition:**
  9. Construct `DefinitionV2` — same workflow name `"wf-shared"` but with stage `{"name": "stage-v2", "prompt": "mutated-prompt-v2"}`.
  10. Call `scheduler_state.write_workflow_definition("proj-gamma", "wf-shared", definition_v2)`. Assert it returns `Ok(())`.

  **Verify snapshots are unchanged after mutation:**
  11. Read the persisted snapshot file at `<store_root>/proj-gamma/run-001/workflow_snapshot.json` from the filesystem and deserialize it as `PersistedSnapshotA`.
  12. Assert `persisted_snapshot_a.definition.stages[0].name == "stage-v1"`.
  13. Read `<store_root>/proj-gamma/run-002/workflow_snapshot.json` and deserialize as `PersistedSnapshotB`.
  14. Assert `persisted_snapshot_b.definition.stages[0].name == "stage-v1"`.

  **Verify in-memory run structs are also unchanged:**
  15. Retrieve the in-memory `WorkflowRun` for `run-001` and `run-002` from `SchedulerState` (via a `get_run` accessor).
  16. Assert both `definition_snapshot.stages[0].name == "stage-v1"` for both in-memory structs.

  **Verify live definition is updated:**
  17. Call `scheduler_state.get_workflow_definition("proj-gamma", "wf-shared")`.
  18. Assert the live definition's `stages[0].name == "stage-v2"` — confirming the update was applied to the live map only.

  **Run-completion verification:**
  19. Drive both `run_a` and `run_b` to completion by calling `scheduler_state.complete_stage(run_a.run_id, "stage-v1", StageOutcome::Success)` and similarly for `run_b`.
  20. Assert both runs transition to `WorkflowRunStatus::Completed`.
  21. Read the persisted snapshot files again and re-assert `stages[0].name == "stage-v1"` for both — confirming no post-completion overwrite occurred.
  22. Annotate the entire test with `// REQ: AC-RISK-025-04` and `// Covers: RISK-025`.

- [ ] Write a second, focused unit test `test_ac_risk_025_04_write_definition_returns_ok_with_active_runs` in the same file that:
  1. Sets up two `Active` runs (via mocked `RunStatus`).
  2. Calls `write_workflow_definition` and asserts `Ok(())` is returned (i.e., active runs do not cause the write to fail or block).
  3. Annotate with `// REQ: AC-RISK-025-04`.

## 2. Task Implementation

- [ ] In `crates/devs-scheduler/src/state.rs` (or equivalent `SchedulerState` implementation file), locate the `write_workflow_definition` method. Verify it:
  - Acquires the per-project mutex (same lock used by `submit_run`).
  - Updates only the `live_workflow_map` entry for the given `(project_id, workflow_name)`.
  - Does NOT iterate over, read, or modify any `WorkflowRun::definition_snapshot` field.
  - Does NOT call `CheckpointStore::write_workflow_snapshot` or any method that touches the snapshot file for any existing run.
  - Returns `Ok(())` regardless of whether active runs exist for the workflow.

- [ ] If the implementation currently violates any of the above (e.g., iterates over active runs to update their snapshots), refactor it to comply. The refactor must be confined to `write_workflow_definition` and must not change the signature or public API.

- [ ] In `crates/devs-scheduler/src/state.rs`, add a `get_run` accessor method (if not already present) with signature:
  ```rust
  pub fn get_run(&self, run_id: &RunId) -> Option<WorkflowRun>
  ```
  This is required by the test in step 15.

- [ ] Ensure `WorkflowRun::definition_snapshot` is typed as an owned `WorkflowDefinition` value (not `Arc<WorkflowDefinition>` or any other reference type) so that in-memory mutation of the live workflow map cannot alias into an existing run's snapshot. If currently `Arc<WorkflowDefinition>`, change it to a deep-cloned owned value at `submit_run` time and update all call sites.

## 3. Code Review

- [ ] Confirm the per-project mutex acquisition pattern in `write_workflow_definition` is a single `lock().await` acquisition that holds for the entire duration of the write — no intermediate drops or re-acquisitions.
- [ ] Confirm there are zero calls to `CheckpointStore` methods inside `write_workflow_definition`.
- [ ] Confirm `WorkflowRun::definition_snapshot` has type `WorkflowDefinition` (not `Arc<_>` or `&_`).
- [ ] Confirm the test uses a real `TempDir`-backed `CheckpointStore`, not an in-memory stub, for the filesystem-read assertions in steps 11–14.
- [ ] Confirm all `// REQ:` and `// Covers:` annotations are present on the test functions.

## 4. Run Automated Tests to Verify

- [ ] Run: `cargo test -p devs-scheduler ac_risk_025_04 -- --nocapture`
- [ ] Assert: all tests in `ac_risk_025_04_two_active_runs_snapshot_isolation.rs` pass (green).
- [ ] Run: `./do test` and confirm the full test suite passes with no regressions.

## 5. Update Documentation

- [ ] Add a doc comment above `write_workflow_definition` in `crates/devs-scheduler/src/state.rs` stating:
  > Updates the live workflow definition map only. Does NOT modify or overwrite any existing `workflow_snapshot.json` for any run. See `[RISK-025-BR-003]` and `[AC-RISK-025-04]`.
- [ ] Add a doc comment above `WorkflowRun::definition_snapshot` stating:
  > Owned deep clone of `WorkflowDefinition` at submit time. Must not be mutated after `submit_run` returns. See `[RISK-025-BR-001]`.

## 6. Automated Verification

- [ ] Run `.tools/verify_requirements.py` and confirm `AC-RISK-025-04` appears in the `covered_requirements` array in `target/traceability.json` with at least one test mapping.
- [ ] Run `./do coverage` and confirm `crates/devs-scheduler/src/state.rs` line coverage includes the `write_workflow_definition` body (≥90% unit, ≥80% aggregate E2E).
- [ ] Confirm `target/traceability.json` has `risk_matrix_violations: []` (no new violations introduced).
