# Task: Robust Error Handling for Checkpoint Writes (ENOSPC) (Sub-Epic: 029_Foundational Technical Requirements (Part 20))

## Covered Requirements
- [2_TAS-REQ-021C]

## Dependencies
- depends_on: [01_checkpoint_persistence_atomic_null.md]
- shared_components: [devs-checkpoint]

## 1. Initial Test Written
- [ ] Create a unit test that mocks `CheckpointStore` dependency or uses an injected `FileSystem` trait to simulate a write failure with `io::ErrorKind::StorageFull`.
- [ ] If using a mock filesystem is not feasible, use a wrapper around `CheckpointStore` that can be configured to fail a specific step (e.g., `rename()` or `write()`) with `ENOSPC`.
- [ ] The test should verify that:
    - If a previous `checkpoint.json` exists, it remains unchanged after a failed write attempt.
    - A log entry with level `ERROR` is emitted describing the write failure.
    - The `save()` method returns an error but the application (in this test context, the caller) does not panic.

## 2. Task Implementation
- [ ] Refactor `CheckpointStore::save()` to catch I/O errors and log them.
- [ ] Use the `tracing` or `log` crate (as configured in `devs-core` or workspace) to emit `ERROR` logs.
- [ ] Ensure that the temporary file is cleaned up if the `rename()` fails, or at least it doesn't leave the system in an inconsistent state.
- [ ] Ensure the server (the logic calling `save()`) is designed to continue execution after this failure.

## 3. Code Review
- [ ] Verify that the `ERROR` log message includes useful context (path, error reason).
- [ ] Ensure that the previous checkpoint file is truly untouched.
- [ ] Confirm no `panic!()` occurs during the error handling path.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-checkpoint` and specifically the ENOSPC simulation tests.

## 5. Update Documentation
- [ ] Document the error resilience behavior in `docs/plan/specs/2_tas.md` or a module-level README in `devs-checkpoint`.

## 6. Automated Verification
- [ ] Run `python3 .tools/verify_requirements.py` to ensure traceability.
- [ ] Verify that `cargo test` output shows the expected `ERROR` log during the failure test case (using a capture mechanism if possible).
