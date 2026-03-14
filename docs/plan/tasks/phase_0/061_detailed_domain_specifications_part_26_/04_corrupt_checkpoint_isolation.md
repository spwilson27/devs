# Task: Corrupt Checkpoint Isolation on Server Startup (Sub-Epic: 061_Detailed Domain Specifications (Part 26))

## Covered Requirements
- [2_TAS-REQ-270]

## Dependencies
- depends_on: [01_checkpoint_schema_version_enforcement.md]
- shared_components: [devs-checkpoint (consumer)]

## 1. Initial Test Written
- [ ] In `crates/devs-checkpoint/src/store.rs` (or `crates/devs-checkpoint/tests/resilience.rs`), write tests for the checkpoint loading path. All tests annotated with `// Covers: 2_TAS-REQ-270`.
- [ ] Write test `test_load_checkpoints_skips_corrupt_file`:
  ```rust
  // Covers: 2_TAS-REQ-270
  #[test]
  fn test_load_checkpoints_skips_corrupt_file() {
      let dir = tempdir().unwrap();
      let runs_dir = dir.path().join(".devs/runs");
      std::fs::create_dir_all(&runs_dir).unwrap();
      // Write a corrupt checkpoint
      let corrupt_run = runs_dir.join("run-aaa");
      std::fs::create_dir_all(&corrupt_run).unwrap();
      std::fs::write(corrupt_run.join("checkpoint.json"), b"NOT JSON").unwrap();
      // Write a valid checkpoint
      let valid_run = runs_dir.join("run-bbb");
      std::fs::create_dir_all(&valid_run).unwrap();
      std::fs::write(valid_run.join("checkpoint.json"),
          r#"{"schema_version":1,"written_at":"2025-01-01T00:00:00Z","run":{"run_id":"bbb","slug":"run-bbb","state":"Running"}}"#.as_bytes()
      ).unwrap();
      let store = CheckpointStore::new(dir.path());
      let result = store.load_all_runs();
      assert!(result.is_ok());
      let (runs, errors) = result.unwrap();
      assert_eq!(runs.len(), 1);
      assert_eq!(runs[0].run_id(), "bbb");
      assert_eq!(errors.len(), 1); // one corrupt file reported
  }
  ```
- [ ] Write test `test_load_checkpoints_all_corrupt_returns_empty`: All checkpoint files are corrupt. Assert `load_all_runs()` returns `Ok((vec![], errors))` with errors populated — NOT an `Err`.
- [ ] Write test `test_load_checkpoints_empty_directory`: No run subdirectories. Assert `Ok((vec![], vec![]))`.
- [ ] Write test `test_load_checkpoints_wrong_schema_version_treated_as_unrecoverable`: A checkpoint with `"schema_version": 99` should appear in the errors list with `CheckpointError::SchemaMigrationRequired`, not crash the loader.
- [ ] Write test `test_load_checkpoints_truncated_json`: A checkpoint file with truncated JSON (e.g., `{"schema_ver`). Assert it appears in errors, other valid runs still load.

## 2. Task Implementation
- [ ] In `CheckpointStore`, implement `load_all_runs(&self) -> Result<(Vec<RecoveredRun>, Vec<UnrecoverableRun>), io::Error>`:
  - Iterate over subdirectories of `.devs/runs/`.
  - For each subdirectory, attempt to read and parse `checkpoint.json` via `CheckpointEnvelope::from_json`.
  - On success: add to the `runs` vec.
  - On failure (any error — parse, schema version, IO): create an `UnrecoverableRun { run_dir: PathBuf, error: String }` and add to `errors` vec. Log at `ERROR` level.
  - The outer `Result` only fails for directory-level IO errors (e.g., `.devs/runs/` itself is unreadable), NOT for individual file failures.
- [ ] Define `RecoveredRun` struct holding the parsed run state.
- [ ] Define `UnrecoverableRun` struct with `run_dir: PathBuf` and `error: String`.
- [ ] Use `tracing::error!` (not `eprintln!`) for logging corrupt checkpoint warnings.
- [ ] Add doc comments citing [2_TAS-REQ-270]: "A single corrupt checkpoint file MUST NOT prevent the server from starting."

## 3. Code Review
- [ ] Verify the function signature returns `(Vec, Vec)` not `Result<Vec>` — the corrupt files are reported, not propagated as hard errors.
- [ ] Verify each corrupt file is individually caught — no early return or `?` on individual file reads.
- [ ] Verify `tracing::error!` includes the file path and the parse error message for debuggability.
- [ ] Verify no `unwrap()` or `expect()` on individual checkpoint parse results.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-checkpoint -- load_checkpoints` and confirm all 5 tests pass.

## 5. Update Documentation
- [ ] Add doc comments on `load_all_runs` explaining the resilience contract and the `UnrecoverableRun` return type.

## 6. Automated Verification
- [ ] Run `./do test` and confirm the traceability scanner finds `// Covers: 2_TAS-REQ-270` annotations.
- [ ] Run `cargo clippy -p devs-checkpoint -- -D warnings` and confirm zero warnings.
