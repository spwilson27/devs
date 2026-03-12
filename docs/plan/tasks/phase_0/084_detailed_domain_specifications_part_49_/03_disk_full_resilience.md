# Task: Disk Full Resilience Acceptance (Sub-Epic: 084_Detailed Domain Specifications (Part 49))

## Covered Requirements
- [2_TAS-REQ-497]

## Dependencies
- depends_on: [none]
- shared_components: [devs-checkpoint]

## 1. Initial Test Written
- [ ] Create a unit test in `devs-checkpoint` that mocks the filesystem to return `ENOSPC` (No space left on device) when writing `checkpoint.json`.
- [ ] Verify that the server (or the state persistence layer) catches this error and continues running.
- [ ] Assert that the in-memory state of the `WorkflowRun` remains unchanged and correct despite the failed write.
- [ ] Verify that subsequent state transitions in the same run continue to trigger new checkpoint write attempts.
- [ ] Mock a successful write after a failed one and ensure the full state is persisted correctly.

## 2. Task Implementation
- [ ] Modify `devs-checkpoint`'s `CheckpointStore` to handle `IO Error` with `ErrorKind::StorageFull` or `ENOSPC`.
- [ ] Ensure that this error is logged as an `ERROR` but does not trigger a panic or a server exit.
- [ ] Implement a retry strategy where the store doesn't block future writes if a previous write failed due to disk space.
- [ ] Ensure that in-memory state management (likely in `devs-core` or the server process) does not rollback or crash on persistence failure.

## 3. Code Review
- [ ] Confirm that no data loss occurs (the in-memory state is always authoritative until successfully checkpointed).
- [ ] Verify that error handling for `ENOSPC` is specific and doesn't swallow other critical IO errors (like permission denied).
- [ ] Check that the log message correctly identifies the disk full condition.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-checkpoint`.
- [ ] Run an E2E test that simulates a workflow run where one stage's checkpoint fails due to a mock disk full error.

## 5. Update Documentation
- [ ] Add a section to the technical architecture documentation (`2_tas.md`) explaining the in-memory authoritative state and its persistence resilience.
- [ ] Update `MEMORY.md` with the disk full resilience guarantee.

## 6. Automated Verification
- [ ] Run `./do verify_requirements` to ensure `2_TAS-REQ-497` is fulfilled.
