# Task: Checkpoint Atomic Write Resilience (Sub-Epic: 082_Detailed Domain Specifications (Part 47))

## Covered Requirements
- [2_TAS-REQ-486]

## Dependencies
- depends_on: [01_checkpoint_concurrent_write_safety.md]
- shared_components: [devs-checkpoint]

## 1. Initial Test Written
- [ ] Create a unit test for `CheckpointStore` that mocks the `std::fs` operations (e.g. `rename`, `write`).
- [ ] Simulate a `rename()` failure (e.g. `ENOSPC` or cross-filesystem error).
- [ ] Verify that `CheckpointStore::write_checkpoint` returns an error, but that the state machine (caller) does not panic or exit.
- [ ] Verify that the server's in-memory state is still accessible and reflects the latest transition.
- [ ] Test that the next state transition successfully triggers a retry and that if the filesystem issue is resolved, it succeeds.

## 2. Task Implementation
- [ ] In `devs-checkpoint`, implement the logic for `write_checkpoint` to use a temporary file and a final `rename()` call.
- [ ] If `rename()` fails, log a `CRITICAL` or `ERROR` level message indicating the failure but do not cause the process to exit.
- [ ] In the state machine, catch errors from the `CheckpointStore`. If the write fails, continue running and update the in-memory state.
- [ ] Ensure that a failure in the write step does not leave the checkpoint file in a corrupted state (by using the atomic `rename()` pattern).
- [ ] Implementation must satisfy the requirement that the next state transition will attempt another checkpoint write, thus providing self-healing behavior.

## 3. Code Review
- [ ] Review the error handling to ensure `std::io::Error` is appropriately captured and reported.
- [ ] Verify that the code handles the case where the temp file and target are on different filesystems (by catching the error and logging it, as requested in [2_TAS-REQ-486]).
- [ ] Ensure that the in-memory state is always authoritative even if the disk write lags or fails.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-checkpoint` and ensure all failure simulation tests pass.

## 5. Update Documentation
- [ ] Add the atomic write failure handling behavior to the project README or the `devs-checkpoint` documentation.

## 6. Automated Verification
- [ ] Run `./do verify_requirements.py` to ensure `[2_TAS-REQ-486]` is correctly mapped to the test.
