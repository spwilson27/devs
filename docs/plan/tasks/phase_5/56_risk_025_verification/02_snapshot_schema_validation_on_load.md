# Task: AC-RISK-025-05 Acceptance Test — Snapshot Schema Validation on Load Marks Run Unrecoverable on Missing Fields (Sub-Epic: 56_Risk 025 Verification)

## Covered Requirements
- [AC-RISK-025-05]

## Dependencies
- depends_on: []
- shared_components: [devs-checkpoint, devs-core, devs-scheduler]

## 1. Initial Test Written

- [ ] In `crates/devs-checkpoint/tests/ac_risk_025_05_snapshot_schema_validation.rs`, write a suite of unit acceptance tests covering every required field validation:

  **Test 1 — Valid snapshot loads successfully:**
  ```rust
  #[test]
  fn test_ac_risk_025_05_valid_snapshot_loads_ok() {
      // Write a valid snapshot.json with all four required fields present
      // Assert load_workflow_snapshot returns Ok(snapshot)
      // REQ: AC-RISK-025-05
  }
  ```
  - Construct a valid JSON string with:
    - `"schema_version": 1`
    - `"captured_at": "2026-03-12T00:00:00Z"` (valid RFC 3339)
    - `"run_id": "550e8400-e29b-41d4-a716-446655440000"` (valid UUID4)
    - `"definition": { "name": "wf-x", "stages": [] }`
  - Write it to `<TempDir>/run-valid/workflow_snapshot.json`.
  - Call `CheckpointStore::load_workflow_snapshot("run-valid")`.
  - Assert returns `Ok(_)`.

  **Test 2 — Missing `schema_version` causes `SnapshotValidationError`:**
  ```rust
  #[test]
  fn test_ac_risk_025_05_missing_schema_version_returns_error() { ... }
  ```
  - Write JSON omitting `"schema_version"`.
  - Assert `load_workflow_snapshot` returns `Err(SnapshotError::ValidationError { field: "schema_version", .. })`.
  - Annotate: `// REQ: AC-RISK-025-05`.

  **Test 3 — Wrong `schema_version` value causes error:**
  ```rust
  #[test]
  fn test_ac_risk_025_05_wrong_schema_version_returns_error() { ... }
  ```
  - Write JSON with `"schema_version": 2` (any value != 1).
  - Assert `load_workflow_snapshot` returns `Err(SnapshotError::ValidationError { field: "schema_version", .. })`.
  - Annotate: `// REQ: AC-RISK-025-05`.

  **Test 4 — Missing `captured_at` causes error:**
  - Omit `"captured_at"`.
  - Assert `Err(SnapshotError::ValidationError { field: "captured_at", .. })`.

  **Test 5 — Invalid `captured_at` (not RFC 3339) causes error:**
  - Set `"captured_at": "not-a-date"`.
  - Assert `Err(SnapshotError::ValidationError { field: "captured_at", .. })`.

  **Test 6 — Missing `run_id` causes error:**
  - Omit `"run_id"`.
  - Assert `Err(SnapshotError::ValidationError { field: "run_id", .. })`.

  **Test 7 — Invalid `run_id` (not UUID4 format) causes error:**
  - Set `"run_id": "not-a-uuid"`.
  - Assert `Err(SnapshotError::ValidationError { field: "run_id", .. })`.

  **Test 8 — Missing `definition` causes error:**
  - Omit `"definition"`.
  - Assert `Err(SnapshotError::ValidationError { field: "definition", .. })`.

  **Test 9 — Invalid `definition` (not a valid `WorkflowDefinition` object) causes error:**
  - Set `"definition": "not-an-object"`.
  - Assert `Err(SnapshotError::ValidationError { field: "definition", .. })`.

- [ ] In `crates/devs-scheduler/tests/ac_risk_025_05_unrecoverable_on_bad_snapshot.rs`, write an integration test `test_ac_risk_025_05_corrupted_snapshot_marks_run_unrecoverable` that:

  **Setup:**
  1. Start a `SchedulerState` with a real `CheckpointStore` backed by a `TempDir`.
  2. Register project `"proj-delta"` and workflow `"wf-delta"`.
  3. Call `submit_run` to create `run-001`. Confirm it starts normally.

  **Corrupt the snapshot:**
  4. Directly write a malformed JSON (missing `"captured_at"`) to `<store_root>/proj-delta/run-001/workflow_snapshot.json`, overwriting the valid snapshot.

  **Trigger server restart / recovery path:**
  5. Construct a new `SchedulerState` (simulating a server restart) pointing at the same `TempDir`.
  6. Call `scheduler_state.recover_runs("proj-delta")` (or equivalent recovery entry-point).

  **Assert the run is marked Unrecoverable:**
  7. Retrieve the recovered run for `run-001` from the restarted scheduler state.
  8. Assert `run.status == WorkflowRunStatus::Unrecoverable`.
  9. Assert the error details (accessible via `run.error` or equivalent field) mention the specific missing field.
  10. Annotate: `// REQ: AC-RISK-025-05`, `// Covers: RISK-025`.

  **Assert other runs are unaffected:**
  11. Call `submit_run` for a second run `"run-002"` on the restarted state.
  12. Assert `run-002` starts normally (the corruption of `run-001`'s snapshot does not block new submissions).

## 2. Task Implementation

- [ ] In `crates/devs-checkpoint/src/snapshot.rs` (create if absent), implement `WorkflowSnapshot` struct:
  ```rust
  pub struct WorkflowSnapshot {
      pub schema_version: u32,          // Must be exactly 1
      pub captured_at: DateTime<Utc>,   // RFC 3339 on serialize/deserialize
      pub run_id: RunId,                // UUID4
      pub definition: WorkflowDefinition,
  }
  ```

- [ ] Implement `CheckpointStore::load_workflow_snapshot(run_id: &str) -> Result<WorkflowSnapshot, SnapshotError>` with the following validation logic:
  1. Read the file at `<store_root>/<run_id>/workflow_snapshot.json`. Return `Err(SnapshotError::NotFound)` if absent.
  2. Deserialize the raw JSON into a `serde_json::Value` first (do not deserialize directly into `WorkflowSnapshot` until after field-level validation passes).
  3. Check `value["schema_version"]` exists and equals `1` (integer). If not, return `Err(SnapshotError::ValidationError { field: "schema_version".to_owned(), reason: "<details>" })`.
  4. Check `value["captured_at"]` exists and is a string parseable as RFC 3339. If not, return `Err(SnapshotError::ValidationError { field: "captured_at".to_owned(), .. })`.
  5. Check `value["run_id"]` exists and is a string parseable as a valid UUID (v4 format). If not, return `Err(SnapshotError::ValidationError { field: "run_id".to_owned(), .. })`.
  6. Check `value["definition"]` exists and is a JSON object. Attempt to deserialize it into `WorkflowDefinition`. If deserialization fails, return `Err(SnapshotError::ValidationError { field: "definition".to_owned(), .. })`.
  7. On all validations passing, construct and return the `WorkflowSnapshot`.

- [ ] Add `SnapshotError` variants to `crates/devs-checkpoint/src/error.rs` (or equivalent):
  ```rust
  pub enum SnapshotError {
      NotFound { run_id: String },
      AlreadyExists { run_id: String },
      ValidationError { field: String, reason: String },
      Io(std::io::Error),
  }
  ```

- [ ] In `crates/devs-scheduler/src/recovery.rs` (create if absent), implement `recover_runs(project_id: &str)` that:
  1. Scans the checkpoint directory for all run-id subdirectories under `<store_root>/<project_id>/`.
  2. For each run directory, calls `CheckpointStore::load_workflow_snapshot(run_id)`.
  3. If `load_workflow_snapshot` returns `Err(SnapshotError::ValidationError { .. })`, marks the run as `WorkflowRunStatus::Unrecoverable` with the error details stored in `WorkflowRun::error`.
  4. If the snapshot loads successfully, proceeds with normal checkpoint-based run reconstruction.

- [ ] Register `recover_runs` as part of the server startup sequence in `crates/devs-server/src/main.rs` (or equivalent startup module).

## 3. Code Review

- [ ] Confirm `load_workflow_snapshot` performs field-level validation before attempting full deserialization into `WorkflowSnapshot` — this prevents panics from malformed but JSON-syntactically-valid files.
- [ ] Confirm `SnapshotError::ValidationError` exposes both `field` and `reason` so that the run error message is actionable.
- [ ] Confirm the recovery loop in `recover_runs` does not `unwrap()` or `expect()` on snapshot loads — errors must be handled gracefully and result in `Unrecoverable` status, not a panic.
- [ ] Confirm that marking a run `Unrecoverable` does not prevent other runs in the same project from being recovered.
- [ ] Confirm the `captured_at` field uses `chrono::DateTime<Utc>` with the `serde` feature's `rfc3339` serializer/deserializer.
- [ ] Confirm UUID4 validation uses the `uuid` crate's `Uuid::parse_str` and checks `uuid.get_version() == Some(uuid::Version::Random)`.

## 4. Run Automated Tests to Verify

- [ ] Run: `cargo test -p devs-checkpoint ac_risk_025_05 -- --nocapture`
- [ ] Assert: all 9 schema validation tests pass.
- [ ] Run: `cargo test -p devs-scheduler ac_risk_025_05_unrecoverable -- --nocapture`
- [ ] Assert: the integration test for `Unrecoverable` marking passes.
- [ ] Run: `./do test` and confirm the full test suite passes with no regressions.

## 5. Update Documentation

- [ ] Add doc comments to `WorkflowSnapshot` fields:
  ```rust
  /// Schema version of the snapshot format. Must be exactly `1`.
  /// See [AC-RISK-025-05].
  pub schema_version: u32,

  /// RFC 3339 timestamp at which the snapshot was captured (at `submit_run` time).
  /// See [AC-RISK-025-05].
  pub captured_at: DateTime<Utc>,

  /// UUID4 run identifier this snapshot belongs to.
  /// See [AC-RISK-025-05].
  pub run_id: RunId,

  /// Full owned copy of the workflow definition at submit time.
  /// See [RISK-025-BR-001], [AC-RISK-025-05].
  pub definition: WorkflowDefinition,
  ```
- [ ] Add a doc comment to `recover_runs`:
  > Scans checkpoint state for a project and reconstructs in-flight runs. Any run whose `workflow_snapshot.json` fails schema validation (missing or invalid fields per `[AC-RISK-025-05]`) is marked `WorkflowRunStatus::Unrecoverable`.

## 6. Automated Verification

- [ ] Run `.tools/verify_requirements.py` and confirm `AC-RISK-025-05` appears in `target/traceability.json` under `covered_requirements` with at least one test mapping.
- [ ] Run `./do coverage` and confirm `crates/devs-checkpoint/src/snapshot.rs` achieves ≥90% unit test line coverage.
- [ ] Confirm `target/traceability.json` has `risk_matrix_violations: []`.
- [ ] Confirm `./do lint` exits 0 (no new lint errors introduced by the `chrono` or `uuid` imports).
