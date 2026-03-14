# Task: Atomic Checkpoint Write Failure Handling (Sub-Epic: 082_Detailed Domain Specifications (Part 47))

## Covered Requirements
- [2_TAS-REQ-486]

## Dependencies
- depends_on: ["01_concurrent_checkpoint_write_safety.md"]
- shared_components: [devs-checkpoint (consumer)]

## 1. Initial Test Written
- [ ] In `crates/devs-checkpoint/tests/atomic_write_failure.rs`, create a test `test_rename_failure_logs_error_and_continues` that:
  1. Sets up a checkpoint write scenario where the `rename()` syscall will fail (e.g., by making the target directory read-only on Unix, or by mocking the filesystem layer).
  2. Invokes `save_checkpoint()`.
  3. Asserts that an `ERROR`-level log message is emitted matching the pattern `"checkpoint write failed: <OS error>"`.
  4. Asserts the function returns `Ok(())` (does not propagate the error as fatal).
  5. Asserts the in-memory state remains authoritative and unchanged.
- [ ] Create a test `test_rename_failure_cleans_up_tmp_file` that:
  1. Triggers a rename failure during checkpoint write.
  2. Asserts that the `.tmp` file is deleted (or at least a delete attempt is made).
  3. Verifies no orphan `.tmp` files remain in the checkpoint directory.
- [ ] Create a test `test_checkpoint_retry_on_next_transition` that:
  1. Triggers a rename failure on the first checkpoint write.
  2. Applies another state transition (triggering a second checkpoint write).
  3. Asserts the second write succeeds and the checkpoint file now reflects both transitions.

## 2. Task Implementation
- [ ] In the `save_checkpoint` function, wrap the `std::fs::rename()` call in error handling that:
  1. On `Err(e)`: logs `tracing::error!("checkpoint write failed: {e}")`.
  2. Attempts `std::fs::remove_file(&tmp_path)` and ignores any error from the cleanup.
  3. Returns `Ok(())` so the caller continues running with in-memory state as authoritative.
- [ ] Ensure the next call to `save_checkpoint` (triggered by any subsequent state transition) will attempt a fresh write, effectively retrying.
- [ ] Do NOT add explicit retry loops or timers — the retry happens naturally on the next transition.

## 3. Code Review
- [ ] Verify the error path never panics or propagates a fatal error for rename failures.
- [ ] Verify `.tmp` cleanup is best-effort (ignore errors from `remove_file`).
- [ ] Verify logging uses `tracing::error!` at ERROR level with the OS error message included.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-checkpoint atomic_write_failure` and confirm all tests pass.

## 5. Update Documentation
- [ ] Add `// Covers: 2_TAS-REQ-486` annotation to each test function.

## 6. Automated Verification
- [ ] Run `cargo test -p devs-checkpoint atomic_write_failure -- --nocapture 2>&1 | grep -E "test result:.*passed"` and verify 0 failures.
