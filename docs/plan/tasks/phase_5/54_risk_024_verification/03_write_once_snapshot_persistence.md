# Task: Write-Once Snapshot Persistence with AlreadyExists Idempotency (Sub-Epic: 54_Risk 024 Verification)

## Covered Requirements
- [RISK-025-BR-002]

## Dependencies
- depends_on: [02_snapshot_deep_clone_at_submit_time.md]
- shared_components: [devs-checkpoint]

## 1. Initial Test Written

- [ ] In `crates/devs-checkpoint/tests/write_once_snapshot.rs`, write a unit test `test_write_snapshot_once_succeeds` that:
  1. Creates a temporary directory acting as the checkpoint store root.
  2. Constructs a valid `WorkflowSnapshot` struct containing a `run_id`, `captured_at` (RFC 3339), `schema_version: 1`, and a `WorkflowDefinition`.
  3. Calls `CheckpointStore::write_workflow_snapshot(&snapshot)` for the first time.
  4. Asserts that the call returns `Ok(())`.
  5. Reads the written file and confirms the JSON content matches the struct.
  6. Annotate with `// REQ: RISK-025-BR-002`.

- [ ] Write a unit test `test_write_snapshot_twice_returns_already_exists` that:
  1. Writes the same snapshot once (first call: `Ok(())`).
  2. Calls `write_workflow_snapshot` again for the **same** `run_id`.
  3. Asserts that the return value is `Err(SnapshotError::AlreadyExists)`.
  4. Reads the file again and confirms it is **unchanged** (same content as after the first write).
  5. Annotate with `// REQ: RISK-025-BR-002`.

- [ ] Write a unit test `test_already_exists_is_not_a_submission_failure` that:
  1. Simulates the caller side (`submit_run` equivalent): calls `write_workflow_snapshot`, receives `Err(SnapshotError::AlreadyExists)`, and asserts that the caller code treats this as `Ok(())` — i.e., the `WorkflowRun` submission proceeds without returning an error to the gRPC layer.
  2. Annotate with `// REQ: RISK-025-BR-002`.

- [ ] Write a unit test `test_write_snapshot_different_run_ids_independent` that:
  1. Writes snapshots for two different `run_id` values.
  2. Asserts both writes return `Ok(())` (no cross-contamination between run IDs).
  3. Annotate with `// REQ: RISK-025-BR-002`.

## 2. Task Implementation

- [ ] Open (or create) `crates/devs-checkpoint/src/error.rs`. Define the error type:
  ```rust
  #[derive(Debug, thiserror::Error)]
  pub enum SnapshotError {
      #[error("snapshot already exists for run {run_id}")]
      AlreadyExists { run_id: String },
      #[error("io error: {0}")]
      Io(#[from] std::io::Error),
      #[error("serialization error: {0}")]
      Serialize(#[from] serde_json::Error),
  }
  ```

- [ ] Open `crates/devs-checkpoint/src/store.rs`. Implement (or update) `CheckpointStore::write_workflow_snapshot`:
  ```rust
  /// [RISK-025-BR-002] Write-once: returns Err(SnapshotError::AlreadyExists) if the
  /// snapshot file already exists for this run_id. The caller MUST treat AlreadyExists
  /// as idempotency confirmation, not an error.
  pub fn write_workflow_snapshot(&self, snapshot: &WorkflowSnapshot) -> Result<(), SnapshotError> {
      let path = self.snapshot_path(&snapshot.run_id);
      // Use OpenOptions with create_new=true to atomically enforce write-once semantics.
      match std::fs::OpenOptions::new()
          .write(true)
          .create_new(true)  // fails if file exists — no TOCTOU
          .open(&path)
      {
          Ok(file) => {
              serde_json::to_writer_pretty(file, snapshot)?;
              Ok(())
          }
          Err(e) if e.kind() == std::io::ErrorKind::AlreadyExists => {
              Err(SnapshotError::AlreadyExists { run_id: snapshot.run_id.clone() })
          }
          Err(e) => Err(SnapshotError::Io(e)),
      }
  }
  ```
  Note: `create_new(true)` on `OpenOptions` is atomic on all supported platforms (Linux, macOS, Windows) — no explicit lock is needed.

- [ ] In the caller (`submit_run` in `crates/devs-scheduler/src/scheduler.rs`), update the snapshot write call site:
  ```rust
  match checkpoint_store.write_workflow_snapshot(&snapshot) {
      Ok(()) => { /* snapshot written */ }
      Err(SnapshotError::AlreadyExists { .. }) => {
          // [RISK-025-BR-002] Idempotency: snapshot already correct, proceed normally.
      }
      Err(e) => return Err(SubmitError::SnapshotFailed(e)),
  }
  ```

- [ ] Define `WorkflowSnapshot` struct in `crates/devs-checkpoint/src/types.rs`:
  ```rust
  #[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
  pub struct WorkflowSnapshot {
      pub schema_version: u32,
      pub captured_at: chrono::DateTime<chrono::Utc>,
      pub run_id: String,
      pub definition: WorkflowDefinition,
  }
  ```
  Ensure `schema_version` is always set to `1` by the constructor.

- [ ] Implement `CheckpointStore::snapshot_path(run_id: &str) -> PathBuf` returning `<store_root>/<run_id>/workflow_snapshot.json`.

## 3. Code Review

- [ ] Confirm `create_new(true)` is used (not `create(true)`) — `create(true)` would silently overwrite the file.
- [ ] Confirm the `AlreadyExists` variant carries the `run_id` so error messages are diagnosable.
- [ ] Confirm the caller treats `AlreadyExists` as a non-fatal idempotency signal and does NOT propagate it as an error to the gRPC response.
- [ ] Confirm no `write_workflow_snapshot` call site uses `unwrap()` or `expect()` on the result — all call sites must explicitly handle `AlreadyExists`.
- [ ] Confirm `schema_version` is hardcoded to `1` in the `WorkflowSnapshot` constructor (not a caller-supplied value) to prevent version drift.
- [ ] Confirm the traceability annotation `// REQ: RISK-025-BR-002` is present in both the production code and each test.

## 4. Run Automated Tests to Verify

- [ ] Run:
  ```bash
  cargo test -p devs-checkpoint write_once_snapshot
  ```
  All four tests must pass.

- [ ] Run the full test suite:
  ```bash
  ./do test
  ```
  No regressions.

## 5. Update Documentation

- [ ] Add a doc comment to `SnapshotError::AlreadyExists`:
  ```rust
  /// The caller MUST treat this variant as an idempotency confirmation:
  /// the existing snapshot is correct and the submission should proceed.
  ///
  /// **Requirement:** [RISK-025-BR-002]
  AlreadyExists { run_id: String },
  ```
- [ ] Add a module-level doc comment to `crates/devs-checkpoint/src/store.rs` documenting the write-once invariant.

## 6. Automated Verification

- [ ] Run `.tools/verify_requirements.py` and confirm `RISK-025-BR-002` appears with `status: covered`.
- [ ] Run `./do coverage` and confirm `crates/devs-checkpoint` meets the ≥90% unit coverage gate.
- [ ] Inspect `target/traceability.json` and confirm `"RISK-025-BR-002"` has a non-empty `test_refs` list.
