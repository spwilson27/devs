# Task: AC-RISK-025-03 Concurrency Test — Concurrent submit_run + write_workflow_definition Produces Distinct Correct Snapshots (Sub-Epic: 55_Risk 025 Verification)

## Covered Requirements
- [AC-RISK-025-03]

## Dependencies
- depends_on: [01_toctou_mutex_atomicity_enforcement.md, 04_snapshot_already_exists_acceptance_test.md]
- shared_components: [devs-scheduler, devs-checkpoint, devs-core]

## 1. Initial Test Written

- [ ] In `crates/devs-scheduler/tests/ac_risk_025_03_concurrent_submit_write.rs`, write a unit concurrency test `test_ac_risk_025_03_concurrent_submit_run_and_write_definition_distinct_snapshots` that:

  **Setup:**
  1. Create a `SchedulerState` with a real filesystem-backed `CheckpointStore` in a `TempDir`.
  2. Register project `"proj-beta"`.
  3. Register workflow `"wf-concurrent"` with `DefinitionV1` containing a single stage `{"name": "concurrent-stage-v1", "prompt": "v1"}`.

  **Concurrent execution using `tokio::join!`:**
  4. Define two async closures (or futures):
     - `future_submit`: calls `scheduler.submit_run(project: "proj-beta", workflow: "wf-concurrent", run_name: "concurrent-run-001")`.
     - `future_write`: calls `scheduler.write_workflow_definition(project: "proj-beta", workflow: "wf-concurrent", DefinitionV2)` where `DefinitionV2` contains `{"name": "concurrent-stage-v2", "prompt": "v2"}`.
  5. Execute them together:
     ```rust
     let (submit_result, write_result) = tokio::join!(future_submit, future_write);
     ```
  6. Assert `submit_result` is `Ok(run_id_1)`.
  7. Assert `write_result` is `Ok(())`.
  8. Annotate with `// REQ: AC-RISK-025-03`.

  **Snapshot verification:**
  9. Read `workflow_snapshot.json` for `run_id_1` from the `TempDir`.
  10. Deserialize the snapshot.
  11. Assert `snapshot.run_id == run_id_1`.
  12. Assert `snapshot.schema_version == 1`.
  13. Assert `snapshot.definition.stages[0].name` is either `"concurrent-stage-v1"` OR `"concurrent-stage-v2"` — both are valid because the snapshot captures the definition at the exact moment `submit_run` acquired the per-project mutex, which may be either before or after `write_workflow_definition` ran.
  14. Assert the snapshot is **internally consistent**: the `captured_at` timestamp is a valid RFC 3339 value, the `run_id` matches, and all required fields are present.
  15. Annotate with `// REQ: AC-RISK-025-03`.

- [ ] Write a stronger deterministic variant `test_ac_risk_025_03_submit_before_write_captures_v1_snapshot` that:
  1. Uses a `tokio::sync::Barrier` (or channel) to guarantee `submit_run` acquires the mutex **before** `write_workflow_definition` starts:
     - `future_submit` acquires the lock → notifies barrier → writes snapshot → releases lock.
     - `future_write` waits on barrier before calling `write_workflow_definition`.
  2. After both futures complete, reads the snapshot file.
  3. Asserts `snapshot.definition.stages[0].name == "concurrent-stage-v1"` (submit happened first, so V1 was captured).
  4. Reads the live workflow map (via `scheduler.get_workflow_definition("proj-beta", "wf-concurrent")`) and asserts it returns `DefinitionV2`.
  5. Confirms snapshot (V1) and live definition (V2) are different — the mitigation held.
  6. Annotate with `// REQ: AC-RISK-025-03`.

- [ ] Write a third test `test_ac_risk_025_03_write_before_submit_captures_v2_snapshot` that:
  1. Uses a barrier to guarantee `write_workflow_definition` completes **before** `submit_run` acquires the lock.
  2. After both futures complete, reads the snapshot file.
  3. Asserts `snapshot.definition.stages[0].name == "concurrent-stage-v2"` (submit happened after write, so V2 was captured).
  4. Confirms snapshot (V2) and live definition (V2) match — correct consistent capture.
  5. Annotate with `// REQ: AC-RISK-025-03`.

- [ ] Write a stress test `test_ac_risk_025_03_high_concurrency_no_corrupt_snapshots` that:
  1. Registers 5 different run names (`"run-001"` through `"run-005"`).
  2. Spawns 5 `submit_run` futures and 5 `write_workflow_definition` futures with alternating `DefinitionV1`/`DefinitionV2` mutations, all under `futures::future::join_all`.
  3. After all complete, reads all 5 `workflow_snapshot.json` files.
  4. Asserts all 5 are valid (deserializable), each has a distinct `run_id`, each has `schema_version: 1`, and none are empty or partially written.
  5. Annotate with `// REQ: AC-RISK-025-03`.

## 2. Task Implementation

- [ ] Confirm `scheduler.write_workflow_definition` does **not** hold the per-project mutex while updating the live map — it should use the scheduler's `RwLock<SchedulerState>` write lock, not the per-project `Mutex`. This ensures `submit_run` and `write_workflow_definition` can race (which is the scenario under test) without deadlocking.

- [ ] If a `get_workflow_definition` method on `Scheduler` does not exist (needed for test step 4 in the deterministic variant), add it:
  ```rust
  /// Returns the current live WorkflowDefinition for (project_id, workflow_name).
  /// REQ: AC-RISK-025-03
  pub async fn get_workflow_definition(
      &self,
      project_id: &ProjectId,
      workflow_name: &str,
  ) -> Option<WorkflowDefinition> {
      self.state.read().await
          .live_workflows
          .get(project_id)?
          .get(workflow_name)
          .cloned()
  }
  ```

- [ ] In `crates/devs-scheduler/src/scheduler.rs`, add the `// REQ: AC-RISK-025-03` annotation to the comment block in `submit_run` that explains why the per-project mutex is held:
  ```rust
  // [AC-RISK-025-03] The per-project Mutex serializes submit_run calls relative
  // to each other. write_workflow_definition uses the RwLock on SchedulerState —
  // a different lock — so the two operations CAN race, but snapshot capture is
  // always internally consistent because it occurs under the per-project Mutex.
  // REQ: AC-RISK-025-03
  ```

- [ ] In `Cargo.toml` for `devs-scheduler`'s `[dev-dependencies]`, ensure `futures = "0.3"` is listed so `futures::future::join_all` is available in the stress test.

## 3. Code Review

- [ ] Confirm `write_workflow_definition` and `submit_run` use **different** locks:
  - `submit_run` acquires `per_project_mutex` (a `tokio::sync::Mutex` per project).
  - `write_workflow_definition` acquires the scheduler's top-level `RwLock<SchedulerState>` write lock.
  - If they used the same lock, the `tokio::join!` test would deadlock.
- [ ] Confirm the barrier-based tests use `tokio::sync::Barrier` (not `std::sync::Barrier`) to avoid blocking the async executor.
- [ ] Confirm the stress test (`join_all`) does not spawn OS threads — all futures run on the Tokio runtime to accurately test async mutex contention.
- [ ] Confirm that none of the test futures use `unwrap()` on intermediate results without first capturing the value for diagnostic output.
- [ ] Confirm the `// REQ: AC-RISK-025-03` annotation appears in the production code comment in `submit_run` AND in every test function in this module.

## 4. Run Automated Tests to Verify

- [ ] Run:
  ```bash
  cargo test -p devs-scheduler ac_risk_025_03_concurrent_submit_write
  ```
  All four concurrency tests must pass without flaking across at least 10 sequential runs:
  ```bash
  for i in $(seq 1 10); do cargo test -p devs-scheduler ac_risk_025_03_concurrent_submit_write --quiet || exit 1; done
  ```

- [ ] Run:
  ```bash
  ./do test
  ```
  No regressions.

- [ ] Run under `RUST_LOG=debug` to confirm no lock-order warnings or deadlock diagnostics appear in test output:
  ```bash
  RUST_LOG=debug cargo test -p devs-scheduler ac_risk_025_03
  ```

## 5. Update Documentation

- [ ] Add a section `### Concurrent Behaviour` to the `submit_run` function's doc comment in `scheduler.rs` explaining that:
  - `write_workflow_definition` uses a different lock than `submit_run`.
  - This is intentional so concurrent calls can race.
  - The snapshot captures the definition under the per-project mutex, giving a consistent point-in-time view.
  - Cite `AC-RISK-025-03`.
- [ ] Update `crates/devs-scheduler/README.md` with a section `## Concurrency Model` that references `AC-RISK-025-03` and links to the test file `tests/ac_risk_025_03_concurrent_submit_write.rs`.

## 6. Automated Verification

- [ ] Run `.tools/verify_requirements.py` and confirm `AC-RISK-025-03` appears with `status: covered`.
- [ ] Run `./do coverage` and confirm `crates/devs-scheduler` meets the ≥90% unit coverage gate.
- [ ] Inspect `target/traceability.json` and confirm `"AC-RISK-025-03"` has a non-empty `test_refs` list containing at least:
  - `test_ac_risk_025_03_concurrent_submit_run_and_write_definition_distinct_snapshots`
  - `test_ac_risk_025_03_submit_before_write_captures_v1_snapshot`
  - `test_ac_risk_025_03_write_before_submit_captures_v2_snapshot`
  - `test_ac_risk_025_03_high_concurrency_no_corrupt_snapshots`
- [ ] Run `cargo clippy -p devs-scheduler -- -D warnings` and confirm zero new warnings.
