# Task: write_workflow_definition Must Not Touch Existing Snapshots (Sub-Epic: 54_Risk 024 Verification)

## Covered Requirements
- [RISK-025-BR-003]

## Dependencies
- depends_on: ["02_snapshot_deep_clone_at_submit_time.md", "03_write_once_snapshot_persistence.md"]
- shared_components: [devs-checkpoint, devs-scheduler]

## 1. Initial Test Written

- [ ] In `crates/devs-scheduler/tests/write_workflow_definition_isolation.rs`, write a unit test `test_write_workflow_definition_does_not_touch_snapshot` that:
  1. Creates a `ProjectState` with a registered workflow definition `"workflow-a"` (version 1).
  2. Calls `submit_run("workflow-a")` to produce `run-1`, which writes `workflow_snapshot.json` for `run-1` via the checkpoint store.
  3. Reads and records the content of `workflow_snapshot.json` for `run-1` (call it `snapshot_v1`).
  4. Calls `write_workflow_definition("workflow-a", definition_v2)` where `definition_v2` has a changed `name` or stage list.
  5. Re-reads `workflow_snapshot.json` for `run-1`.
  6. Asserts the file content is **identical** to `snapshot_v1` — byte-for-byte, confirming `write_workflow_definition` did not modify it.
  7. Annotate with `// REQ: RISK-025-BR-003`.

- [ ] Write a test `test_write_workflow_definition_does_not_create_new_snapshot` that:
  1. Calls `write_workflow_definition` for a workflow that has **no active runs** (no `workflow_snapshot.json` files exist for it).
  2. Asserts that no `workflow_snapshot.json` files were created at any path (glob `<store_root>/**/workflow_snapshot.json` and confirm empty).
  3. Annotate with `// REQ: RISK-025-BR-003`.

- [ ] Write a test `test_write_workflow_definition_does_not_read_snapshot` that:
  1. Wraps the checkpoint store's filesystem calls with a spy/mock that records all file paths opened for reading.
  2. Calls `write_workflow_definition`.
  3. Asserts that no path matching `**/workflow_snapshot.json` was opened for reading.
  4. Annotate with `// REQ: RISK-025-BR-003`.

- [ ] Write a test `test_write_workflow_definition_updates_only_live_map` that:
  1. Calls `write_workflow_definition("workflow-a", definition_v2)`.
  2. Calls `get_workflow_definition("workflow-a")` on the `ProjectState`.
  3. Asserts the returned definition equals `definition_v2`.
  4. Annotate with `// REQ: RISK-025-BR-003`.

## 2. Task Implementation

- [ ] Open `crates/devs-scheduler/src/scheduler.rs` and locate the `write_workflow_definition` function (or create it if it does not yet exist with this name).

- [ ] Implement `write_workflow_definition` to:
  1. Acquire the per-project write-lock on the `WorkflowDefinitions` map.
  2. Insert or replace the entry keyed by workflow name.
  3. Release the lock.
  4. Return `Ok(())`.

  ```rust
  /// Updates the live workflow definition map only. Does NOT read, modify, or
  /// overwrite any existing `workflow_snapshot.json`.
  ///
  /// [RISK-025-BR-003]
  pub async fn write_workflow_definition(
      &self,
      project_id: &str,
      name: &str,
      definition: WorkflowDefinition,
  ) -> Result<(), ProjectError> {
      let mut state = self.projects.write().await;
      let project = state.get_mut(project_id).ok_or(ProjectError::NotFound)?;
      // [RISK-025-BR-003] Only the live map is updated; snapshot files are not touched.
      project.workflow_definitions.insert(name.to_string(), definition);
      Ok(())
  }
  ```

- [ ] Confirm there is **no** call to `checkpoint_store.write_workflow_snapshot` or any file I/O to a `workflow_snapshot.json` path within `write_workflow_definition` or any function it calls.

- [ ] Confirm there is **no** `checkpoint_store.read_workflow_snapshot` or equivalent read call within `write_workflow_definition`.

- [ ] Run `cargo clippy -p devs-scheduler -- -D warnings` to ensure the implementation is lint-clean.

## 3. Code Review

- [ ] Search for all call sites of `write_workflow_definition` with:
  ```bash
  grep -rn "write_workflow_definition" crates/
  ```
  Confirm none of the call sites pass a `checkpoint_store` reference or trigger any file I/O.

- [ ] Search for any reference to `workflow_snapshot.json` within the `write_workflow_definition` function body and all functions it transitively calls:
  ```bash
  grep -rn "workflow_snapshot" crates/devs-scheduler/src/
  ```
  Confirm `workflow_snapshot` does not appear in the `write_workflow_definition` code path.

- [ ] Confirm that `WorkflowDefinition` used in the live map and `WorkflowDefinition` embedded in `WorkflowSnapshot` are the **same type** (not separate structs that happen to have the same name) — there must be no implicit coupling between the two usages.

- [ ] Confirm the traceability annotation `// REQ: RISK-025-BR-003` is present in the `write_workflow_definition` function body and in each test.

## 4. Run Automated Tests to Verify

- [ ] Run:
  ```bash
  cargo test -p devs-scheduler write_workflow_definition_isolation
  ```
  All four tests must pass.

- [ ] Run the full test suite:
  ```bash
  ./do test
  ```
  No regressions.

## 5. Update Documentation

- [ ] Add a doc comment to `write_workflow_definition` that explicitly states the invariant:
  ```rust
  /// Updates the in-memory live workflow definitions map for the given project.
  ///
  /// **Isolation guarantee:** This function MUST NOT read, modify, or overwrite
  /// any `workflow_snapshot.json` file. Active run snapshots are immutable after
  /// creation; they reference an owned copy captured at `submit_run` time.
  ///
  /// **Requirement:** [RISK-025-BR-003]
  ```
- [ ] Update the `devs-checkpoint` crate README (or module doc) to document that `workflow_snapshot.json` is write-once and that `write_workflow_definition` never touches it.

## 6. Automated Verification

- [ ] Run `.tools/verify_requirements.py` and confirm `RISK-025-BR-003` appears with `status: covered`.
- [ ] Run `./do coverage` and confirm `crates/devs-scheduler` meets the ≥90% unit coverage gate.
- [ ] Inspect `target/traceability.json` and confirm `"RISK-025-BR-003"` has a non-empty `test_refs` list.
- [ ] Run `./do presubmit` and confirm it exits 0 within the 15-minute timeout.
