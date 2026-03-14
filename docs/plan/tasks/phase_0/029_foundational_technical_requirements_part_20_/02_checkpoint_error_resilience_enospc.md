# Task: Checkpoint Write Error Resilience (ENOSPC / Disk-Full) (Sub-Epic: 029_Foundational Technical Requirements (Part 20))

## Covered Requirements
- [2_TAS-REQ-021C]

## Dependencies
- depends_on: ["01_checkpoint_persistence_atomic_null.md"]
- shared_components: [devs-checkpoint (consumer)]

## 1. Initial Test Written
- [ ] **Test: `test_save_failure_preserves_existing_checkpoint`** — In a tempdir, write a valid `checkpoint.json` with known content. Inject a write failure (see implementation notes below). Call `CheckpointStore::save()` with a new checkpoint. Assert that `checkpoint.json` still contains the original content byte-for-byte. Assert the `.checkpoint.json.tmp` file does not remain on disk (cleaned up on failure).
- [ ] **Test: `test_save_failure_returns_error_not_panic`** — Inject a write failure. Call `CheckpointStore::save()`. Assert the return value is `Err(CheckpointError::Io(_))`. Assert no panic occurred (the test completing is sufficient proof).
- [ ] **Test: `test_save_failure_logs_error`** — Use `tracing-test` (or `tracing_subscriber::fmt::TestWriter`) to capture log output. Inject a write failure. Call `CheckpointStore::save()`. Assert that the captured logs contain an `ERROR`-level entry mentioning the file path and the nature of the I/O error (e.g., "No space left on device" or the injected error message).
- [ ] To enable failure injection: introduce a `trait FileSystem` with `write(path, bytes)` and `rename(from, to)` methods. Provide a `RealFileSystem` impl and a `MockFileSystem` impl for tests. `CheckpointStore` takes a generic or trait-object `FileSystem`. The mock can be configured to return `io::Error::new(io::ErrorKind::StorageFull, "disk full")` on `write()`.

## 2. Task Implementation
- [ ] Define `trait FileSystem: Send + Sync` in `devs-checkpoint` with methods: `fn write(&self, path: &Path, data: &[u8]) -> io::Result<()>` and `fn rename(&self, from: &Path, to: &Path) -> io::Result<()>`.
- [ ] Implement `struct RealFileSystem;` that delegates to `std::fs::write` and `std::fs::rename`.
- [ ] Refactor `CheckpointStore` to accept `Arc<dyn FileSystem>` (or be generic over `F: FileSystem`).
- [ ] In `CheckpointStore::save()`, wrap the write+rename in error handling:
  1. Attempt `fs.write(tmp_path, bytes)`. On error: log at `ERROR` with `tracing::error!("checkpoint write failed: path={}, error={}", tmp_path.display(), e)`, attempt to delete the `.tmp` file (best-effort), return `Err`.
  2. Attempt `fs.rename(tmp_path, final_path)`. On error: log at `ERROR`, attempt to delete `.tmp` (best-effort), return `Err`.
  3. In both error cases, the existing `checkpoint.json` is never touched — atomicity guarantees this since `rename` is the only operation that modifies the final file.
- [ ] Implement `MockFileSystem` in `#[cfg(test)]` module with a configurable `fail_on_write: AtomicBool` field.

## 3. Code Review
- [ ] Verify that on any I/O error, the existing `checkpoint.json` is provably untouched (the atomic rename pattern guarantees this — confirm no code path writes directly to `checkpoint.json`).
- [ ] Verify `ERROR`-level log includes both the file path and the error description.
- [ ] Verify no `unwrap()` or `expect()` in the error handling path that could cause a panic.
- [ ] Verify the `.tmp` file cleanup is best-effort (ignores errors from `fs::remove_file`).
- [ ] Verify the `FileSystem` trait is minimal and does not over-abstract.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-checkpoint -- test_save_failure` and ensure all 3 failure tests pass.
- [ ] Run `cargo test -p devs-checkpoint` to confirm no regressions in the atomic write tests from task 01.

## 5. Update Documentation
- [ ] Add `// Covers: 2_TAS-REQ-021C` comment above the error handling branch in `save()`.
- [ ] Add doc comment on `save()` explaining that checkpoint write failures are non-fatal and logged at ERROR level.

## 6. Automated Verification
- [ ] Run `cargo test -p devs-checkpoint 2>&1 | grep -E "test result:"` and confirm `0 failed`.
- [ ] Confirm `cargo clippy -p devs-checkpoint -- -D warnings` passes cleanly.
