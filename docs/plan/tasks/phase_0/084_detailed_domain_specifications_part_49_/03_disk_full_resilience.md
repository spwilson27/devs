# Task: Checkpoint ENOSPC Resilience — Server Continues on Disk Full (Sub-Epic: 084_Detailed Domain Specifications (Part 49))

## Covered Requirements
- [2_TAS-REQ-497]

## Dependencies
- depends_on: [none]
- shared_components: [devs-checkpoint (consume — CheckpointStore trait and persistence logic)]

## 1. Initial Test Written
- [ ] In `crates/devs-checkpoint/src/tests.rs` (or equivalent), write `test_enospc_does_not_crash_server`:
  1. Create a mock filesystem backend (or use a trait object `CheckpointWriter`) that returns `io::Error::new(io::ErrorKind::StorageFull, "No space left on device")` on write.
  2. Create a valid in-memory `WorkflowRun` and attempt to persist it via `save_checkpoint`.
  3. Assert the method returns an `Err` (not a panic).
  4. Assert the in-memory `WorkflowRun` state is completely unchanged after the failed write.
- [ ] Write `test_enospc_recovery_on_next_transition`:
  1. Use the same mock that fails with ENOSPC on the first call, then succeeds on the second.
  2. Trigger a state transition (e.g., stage completes) after the ENOSPC failure.
  3. Assert the second checkpoint write is attempted and succeeds.
  4. Verify the persisted state reflects both the original state and the new transition.
- [ ] Write `test_enospc_logs_error_not_panic`:
  1. Set up a `tracing` test subscriber.
  2. Trigger an ENOSPC checkpoint failure.
  3. Assert an `ERROR`-level log event was emitted mentioning disk full or ENOSPC.
  4. Assert no panic occurred (test completes normally).
- [ ] Write `test_other_io_errors_also_handled_gracefully`:
  1. Mock a `PermissionDenied` IO error on checkpoint write.
  2. Assert the server similarly does not crash (returns Err, logs error, continues).

## 2. Task Implementation
- [ ] In `devs-checkpoint`, modify `save_checkpoint` to catch `io::Error` results from the underlying file write.
- [ ] On any IO error (including ENOSPC): log `tracing::error!("Checkpoint write failed: {err}. In-memory state preserved; will retry on next state transition.")`, return `Err(CheckpointError::IoFailed(err))`.
- [ ] Ensure the caller (scheduler/server) handles `Err` from `save_checkpoint` by logging and continuing — NOT by unwrapping, panicking, or calling `std::process::exit`.
- [ ] Verify there is no `unwrap()` or `expect()` on checkpoint write results in any call site.
- [ ] Add `// Covers: 2_TAS-REQ-497` annotation to each test.

## 3. Code Review
- [ ] Verify that checkpoint write failures never cause server shutdown or panic.
- [ ] Confirm that in-memory state is the authoritative source — a failed write does not roll back state.
- [ ] Check that the error type distinguishes IO failures from logical errors (e.g., serialization bugs should still panic or be treated differently).
- [ ] Verify all call sites of `save_checkpoint` handle the `Result` without unwrapping.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-checkpoint -- enospc` and verify all disk-full resilience tests pass.

## 5. Update Documentation
- [ ] Add doc comment on `save_checkpoint` explaining that IO failures are non-fatal and the server continues with in-memory state.

## 6. Automated Verification
- [ ] Run `./do test` and confirm zero failures.
- [ ] Grep test files for `// Covers: 2_TAS-REQ-497` to verify traceability annotation is present.
