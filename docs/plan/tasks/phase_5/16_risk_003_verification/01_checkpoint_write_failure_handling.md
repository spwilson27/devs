# Task: Disk-Full Resilience and Push Failure Recovery during Checkpoint Writes (Sub-Epic: 16_Risk 003 Verification)

## Covered Requirements
- [RISK-003-BR-003], [RISK-003-BR-004], [MIT-003], [AC-RISK-003-01]

## Dependencies
- depends_on: []
- shared_components: [devs-checkpoint]

## 1. Initial Test Written
- [ ] Create an integration test in `devs-checkpoint/tests/write_failure_tests.rs` that uses a mock `CheckpointStore`.
- [ ] Implement a mock `CheckpointStore` that can be configured to return `io::ErrorKind::StorageFull` during write operations.
- [ ] Assert that when `StorageFull` is returned, the server emits a structured `ERROR` log with `event_type: "checkpoint.write_failed"` and the correct `run_id`.
- [ ] Assert that the server continues to process other active runs after a checkpoint write failure.
- [ ] Implement a test case where a `git2` push operation fails.
- [ ] Assert that a push failure results in a structured `WARN` log with `event_type: "checkpoint.push_failed"`.
- [ ] Assert that the failed push is retried during the next successful checkpoint write for the same run.

## 2. Task Implementation
- [ ] Modify `CheckpointStore::write_checkpoint` in `devs-checkpoint` to catch `io::Error` with `ErrorKind::StorageFull`.
- [ ] Implement the structured logging logic for `event_type: "checkpoint.write_failed"` when `ENOSPC` is encountered.
- [ ] Ensure that the error is handled gracefully and does not cause a panic or server exit.
- [ ] Update the git push logic in `CheckpointStore` to treat `git2::Error` as non-fatal during push operations.
- [ ] Implement the structured logging for `event_type: "checkpoint.push_failed"` on push errors.
- [ ] Implement a retry mechanism that flags a run for "push pending" state so that the next successful write attempt triggers another push.

## 3. Code Review
- [ ] Verify that the `ERROR` log for write failure includes the mandatory `run_id` field.
- [ ] Verify that `git2` push failures do not prevent the local `checkpoint.json` from being correctly updated (local is authoritative).
- [ ] Ensure that no attempt is made to free disk space or perform other "recovery" actions beyond logging.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-checkpoint --test write_failure_tests` and ensure all cases pass.

## 5. Update Documentation
- [ ] Update `devs-checkpoint` README to document the authoritative nature of the local checkpoint file over the remote state branch.
- [ ] Record the implementation of this risk mitigation in the agent "memory".

## 6. Automated Verification
- [ ] Run `./do test` to ensure the new tests are counted toward traceability and all existing tests pass.
- [ ] Verify that `target/traceability.json` confirms coverage for `RISK-003-BR-003`, `RISK-003-BR-004`, and `AC-RISK-003-01`.
