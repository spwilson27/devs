# Task: AC-RISK-025-02 Acceptance Test — Write Snapshot for Existing Run Returns AlreadyExists with File Unchanged (Sub-Epic: 55_Risk 025 Verification)

## Covered Requirements
- [AC-RISK-025-02]

## Dependencies
- depends_on: ["02_mit_025_mitigation_integration_test.md"]
- shared_components: [devs-checkpoint]

## 1. Initial Test Written

- [ ] In `crates/devs-checkpoint/tests/ac_risk_025_02_already_exists.rs`, write a unit acceptance test `test_ac_risk_025_02_second_snapshot_write_returns_already_exists` that:
  1. Create a `CheckpointStore` backed by a real `TempDir`.
  2. Construct `SnapshotA`: a `WorkflowSnapshot` with `schema_version: 1`, a valid `captured_at` RFC 3339 timestamp, `run_id: "run-aaa"`, and a `WorkflowDefinition` containing stage `{"name": "original-stage"}`.
  3. Call `store.write_workflow_snapshot(&snapshot_a)`.
  4. Assert the first call returns `Ok(())`.
  5. Read the file at `<store_root>/run-aaa/workflow_snapshot.json` and record its byte content as `original_bytes`.
  6. Construct `SnapshotB`: a different `WorkflowSnapshot` with the **same** `run_id: "run-aaa"` but a modified definition containing stage `{"name": "mutated-stage"}`.
  7. Call `store.write_workflow_snapshot(&snapshot_b)`.
  8. Assert the second call returns `Err(SnapshotError::AlreadyExists { run_id: "run-aaa".to_owned() })`.
  9. Re-read the file and record its byte content as `post_attempt_bytes`.
  10. Assert `original_bytes == post_attempt_bytes` — the file is completely unchanged.
  11. Annotate with `// REQ: AC-RISK-025-02`.

- [ ] Write a second acceptance test `test_ac_risk_025_02_already_exists_does_not_block_other_runs` that:
  1. Writes `SnapshotA` for `run_id: "run-aaa"` (succeeds).
  2. Attempts a second write for `run_id: "run-aaa"` (returns `AlreadyExists`).
  3. Writes `SnapshotC` for a **different** `run_id: "run-bbb"`.
  4. Asserts the write for `"run-bbb"` returns `Ok(())` — `AlreadyExists` for one run does not block other runs.
  5. Reads both snapshot files and confirms `"run-aaa"` still has the original content and `"run-bbb"` has `SnapshotC` content.
  6. Annotate with `// REQ: AC-RISK-025-02`.

- [ ] Write a third acceptance test `test_ac_risk_025_02_already_exists_error_message_contains_run_id` that:
  1. Attempts to write a snapshot for `run_id: "run-ccc"` after one already exists.
  2. Calls `.to_string()` on the returned error.
  3. Asserts the string contains `"run-ccc"` so operators can diagnose from logs.
  4. Annotate with `// REQ: AC-RISK-025-02`.

- [ ] Write a fourth acceptance test `test_ac_risk_025_02_first_write_content_is_canonical` that:
  1. Writes `SnapshotA` for `run_id: "run-ddd"` (first write, succeeds).
  2. Calls `store.load_workflow_snapshot("run-ddd")` to read it back.
  3. Deserializes and asserts every field matches `SnapshotA` exactly (including `schema_version`, `captured_at`, `run_id`, and all stage names).
  4. Attempts a second write for `"run-ddd"` with `SnapshotB` (different definition) — receives `AlreadyExists`.
  5. Calls `store.load_workflow_snapshot("run-ddd")` again.
  6. Asserts the loaded snapshot still matches `SnapshotA` exactly.
  7. Annotate with `// REQ: AC-RISK-025-02`.

## 2. Task Implementation

- [ ] Confirm `CheckpointStore` in `crates/devs-checkpoint/src/store.rs` exposes `load_workflow_snapshot`:
  ```rust
  /// Reads and deserializes the workflow snapshot for the given run_id.
  /// Returns Err(SnapshotError::NotFound) if the file does not exist.
  /// REQ: AC-RISK-025-02
  pub fn load_workflow_snapshot(&self, run_id: &str) -> Result<WorkflowSnapshot, SnapshotError> {
      let path = self.snapshot_path(run_id);
      let file = std::fs::File::open(&path).map_err(|e| {
          if e.kind() == std::io::ErrorKind::NotFound {
              SnapshotError::NotFound { run_id: run_id.to_owned() }
          } else {
              SnapshotError::Io(e)
          }
      })?;
      Ok(serde_json::from_reader(file)?)
  }
  ```

- [ ] Extend `SnapshotError` in `crates/devs-checkpoint/src/error.rs` with a `NotFound` variant (if not already present):
  ```rust
  #[error("no snapshot found for run {run_id}")]
  NotFound { run_id: String },
  ```

- [ ] Confirm `write_workflow_snapshot` uses `OpenOptions::new().write(true).create_new(true)` (not `.create(true).truncate(true)`) so concurrent attempts cannot race to overwrite.

- [ ] Confirm the `AlreadyExists` variant in `SnapshotError` derives `PartialEq` so test assertions using `assert_eq!` work correctly:
  ```rust
  #[derive(Debug, thiserror::Error, PartialEq)]
  pub enum SnapshotError { ... }
  ```

## 3. Code Review

- [ ] Confirm `create_new(true)` is the only `OpenOptions` variant used in `write_workflow_snapshot` — no `create(true)` or `.truncate(true)` variants.
- [ ] Confirm `load_workflow_snapshot` performs no writes and cannot mutate the snapshot file.
- [ ] Confirm all four acceptance tests read the snapshot file directly from disk (not from an in-memory cache) so the test validates the on-disk invariant, not just an in-process variable.
- [ ] Confirm the `AlreadyExists` error carries the `run_id` string and that `Display` for this variant (via `thiserror`) includes the `run_id` in its message.
- [ ] Confirm the `// REQ: AC-RISK-025-02` annotation is present in the `write_workflow_snapshot` function body and in all four acceptance tests.

## 4. Run Automated Tests to Verify

- [ ] Run:
  ```bash
  cargo test -p devs-checkpoint ac_risk_025_02_already_exists
  ```
  All four acceptance tests must pass.

- [ ] Run:
  ```bash
  cargo test -p devs-checkpoint
  ```
  All `devs-checkpoint` tests must pass with no regressions.

- [ ] Run:
  ```bash
  ./do test
  ```
  All workspace tests pass.

## 5. Update Documentation

- [ ] Add or update the doc comment on `SnapshotError::AlreadyExists`:
  ```rust
  /// Returned when `write_workflow_snapshot` is called for a `run_id` that
  /// already has a snapshot on disk. The caller MUST treat this as an
  /// idempotency confirmation — the existing snapshot is correct.
  ///
  /// **Acceptance Criterion:** [AC-RISK-025-02]
  AlreadyExists { run_id: String },
  ```
- [ ] Add a doc comment on `load_workflow_snapshot` explaining it is the canonical read path and that it never modifies the file.

## 6. Automated Verification

- [ ] Run `.tools/verify_requirements.py` and confirm `AC-RISK-025-02` appears with `status: covered`.
- [ ] Run `./do coverage` and confirm `crates/devs-checkpoint` meets the ≥90% unit coverage gate.
- [ ] Inspect `target/traceability.json` and confirm `"AC-RISK-025-02"` has a non-empty `test_refs` list containing all four test names from this task.
- [ ] Run:
  ```bash
  grep -rn "AC-RISK-025-02" crates/devs-checkpoint/
  ```
  Confirm the annotation appears in at least the production source file and all four test functions.
