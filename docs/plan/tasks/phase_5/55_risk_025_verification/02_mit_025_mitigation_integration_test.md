# Task: MIT-025 Mitigation Integration Test — Full Snapshot Immutability Invariant (Sub-Epic: 55_Risk 025 Verification)

## Covered Requirements
- [MIT-025]

## Dependencies
- depends_on: ["01_toctou_mutex_atomicity_enforcement.md"]
- shared_components: [devs-scheduler, devs-checkpoint, devs-core]

## 1. Initial Test Written

- [ ] In `crates/devs-scheduler/tests/mit_025_mitigation.rs`, write an integration test `test_mit_025_full_snapshot_immutability_invariant` that exercises all three mitigation pillars from the spec in a single scenario:

  **Pillar 1 — Deep-clone at submit time:**
  1. Construct a `SchedulerState` with a real filesystem-backed `CheckpointStore` in a `tempdir`.
  2. Register workflow `"wf-a"` with a known definition `DefinitionV1` (e.g., a single stage `"stage-1"` with prompt `"hello"`).
  3. Call `submit_run` for `project-alpha` using `"wf-a"`. Capture the returned `WorkflowRun` as `run_a`.
  4. Assert that `run_a.definition_snapshot` is a value-equal copy of `DefinitionV1` and that it does NOT share any heap allocation with the live workflow map entry (verified by modifying the live map entry in-place and confirming `run_a.definition_snapshot` is unchanged — use `Arc::ptr_eq` if `WorkflowDefinition` stages use `Arc<Stage>`; otherwise mutate a field on the live entry and assert the snapshot field is still `"stage-1"`).
  5. Annotate with `// REQ: MIT-025`.

  **Pillar 2 — Write-once persist:**
  6. Read `workflow_snapshot.json` from the `tempdir` for `run_a.run_id`.
  7. Deserialize and assert the snapshot's `definition.stages[0].name == "stage-1"`.
  8. Attempt a second call to `CheckpointStore::write_workflow_snapshot` for the same `run_id` with a modified definition.
  9. Assert the second call returns `Err(SnapshotError::AlreadyExists)`.
  10. Re-read the file and confirm it still contains `"stage-1"` (unchanged).
  11. Annotate with `// REQ: MIT-025`.

  **Pillar 3 — Per-project mutex serialisation:**
  12. Spawn 10 `tokio::task`s, each calling `submit_run` for `project-alpha` with a unique `run_name`.
  13. Use `tokio::join!` / `futures::future::join_all` to run all concurrently.
  14. Assert all 10 calls return `Ok(run_id)`.
  15. Assert all 10 `workflow_snapshot.json` files exist on disk with valid content.
  16. Assert no two runs share the same `run_id` and no snapshot file is corrupt.
  17. Annotate with `// REQ: MIT-025`.

- [ ] Write a focused regression test `test_mit_025_live_map_update_does_not_corrupt_existing_snapshot` that:
  1. Submits a run and verifies its snapshot contains `DefinitionV1`.
  2. Calls `write_workflow_definition("wf-a", DefinitionV2)` on the live map (where `DefinitionV2` has a different stage name `"stage-2"`).
  3. Reads the persisted `workflow_snapshot.json` for the original run.
  4. Asserts the file still contains `"stage-1"` (not `"stage-2"`).
  5. Annotate with `// REQ: MIT-025`.

## 2. Task Implementation

- [ ] Confirm that `devs-scheduler` exposes a `write_workflow_definition` function (or method on `SchedulerState`) that is distinct from `submit_run`. If it does not yet exist, implement a stub:
  ```rust
  /// Updates the live workflow definition in the WorkflowDefinitions map.
  /// [MIT-025] Does NOT touch any existing workflow_snapshot.json files.
  /// REQ: MIT-025, RISK-025-BR-003
  pub async fn write_workflow_definition(
      &self,
      project_id: &ProjectId,
      workflow_name: &str,
      new_def: WorkflowDefinition,
  ) -> Result<(), WriteDefinitionError> {
      let mut state = self.state.write().await;
      state.live_workflows
          .entry(project_id.clone())
          .or_default()
          .insert(workflow_name.to_owned(), new_def);
      Ok(())
  }
  ```

- [ ] Ensure `WorkflowDefinition` derives `Clone` in `crates/devs-core/src/types.rs` so the deep-clone in `submit_run` is possible. Confirm none of its fields use `Arc<T>` for mutable shared state (only value types or `Arc<str>` for immutable strings are permitted).

- [ ] In `crates/devs-scheduler/src/scheduler.rs`, add a module-level doc comment (or update the existing one) summarising the three MIT-025 mitigation pillars with inline requirement annotations:
  ```rust
  //! # Snapshot Immutability (MIT-025)
  //!
  //! [MIT-025] Three-pillar mitigation against RISK-025:
  //! 1. **Deep-clone at submit** — `definition_snapshot` is an owned copy captured
  //!    under the per-project Mutex before any await. No Arc into the live map.
  //! 2. **Write-once persist** — `CheckpointStore::write_workflow_snapshot` uses
  //!    `OpenOptions::create_new(true)`; returns `Err(AlreadyExists)` on collision.
  //! 3. **Atomic name-check + snapshot write** — both happen inside a single
  //!    `tokio::sync::Mutex` guard acquisition (RISK-025-BR-004).
  ```

- [ ] In `crates/devs-checkpoint/src/store.rs`, confirm the `snapshot_path` helper returns `<store_root>/<run_id>/workflow_snapshot.json` and that the parent directory is created if it does not exist before attempting `create_new(true)`.

## 3. Code Review

- [ ] Confirm that `WorkflowDefinition::clone()` performs a true deep copy and that no `Arc<Mutex<T>>` fields link the cloned value back to the live workflow map.
- [ ] Confirm the integration test uses a real filesystem `tempdir`, not a mock, so that write-once semantics are tested against actual OS file creation primitives.
- [ ] Confirm the concurrent 10-task test does not use `unwrap()` — every `submit_run` result must be individually matched and any unexpected `Err` must fail the test with a diagnostic message.
- [ ] Confirm the doc comment in `scheduler.rs` uses `// REQ: MIT-025` annotations visible to `.tools/verify_requirements.py`.
- [ ] Confirm `write_workflow_definition` is annotated with `// REQ: MIT-025` and `// REQ: RISK-025-BR-003`.

## 4. Run Automated Tests to Verify

- [ ] Run:
  ```bash
  cargo test -p devs-scheduler mit_025_mitigation
  ```
  All tests in the `mit_025_mitigation` module must pass.

- [ ] Run:
  ```bash
  ./do test
  ```
  No regressions across the workspace.

## 5. Update Documentation

- [ ] Add a section `## MIT-025 Mitigation` to `crates/devs-scheduler/README.md` (creating it if absent) listing the three pillars, citing the relevant requirement IDs (`MIT-025`, `RISK-025-BR-001`, `RISK-025-BR-002`, `RISK-025-BR-003`, `RISK-025-BR-004`).
- [ ] Update the `WorkflowSnapshot` struct doc comment in `crates/devs-checkpoint/src/types.rs` to state that `schema_version` is always `1` and cite `MIT-025`.

## 6. Automated Verification

- [ ] Run `.tools/verify_requirements.py` and confirm `MIT-025` appears with `status: covered`.
- [ ] Run `./do coverage` and confirm both `crates/devs-scheduler` and `crates/devs-checkpoint` meet the ≥90% unit coverage gate.
- [ ] Inspect `target/traceability.json` and confirm `"MIT-025"` has a non-empty `test_refs` list containing at least `test_mit_025_full_snapshot_immutability_invariant` and `test_mit_025_live_map_update_does_not_corrupt_existing_snapshot`.
- [ ] Run `cargo audit --deny warnings` and confirm no new advisories are introduced by any new dependencies.
