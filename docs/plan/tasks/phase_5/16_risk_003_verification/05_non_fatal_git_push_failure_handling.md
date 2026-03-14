# Task: Non-Fatal git2 Push Failure Handling with WARN Logging (Sub-Epic: 16_Risk 003 Verification)

## Covered Requirements
- [RISK-003-BR-004]

## Dependencies
- depends_on: [01_checkpoint_write_failure_handling.md]
- shared_components: [devs-checkpoint]

## 1. Initial Test Written
- [ ] Create a test at `devs-checkpoint/tests/push_failure_tests.rs` that simulates a `git2` push failure.
- [ ] Use a mock git remote or inject a failure into the push operation (e.g., invalid remote URL, network error simulation).
- [ ] Assert that when push fails, a WARN-level log entry is emitted with `event_type: "checkpoint.push_failed"`.
- [ ] Assert that the local `checkpoint.json` file is still correctly committed (local is authoritative).
- [ ] Assert that the server does NOT crash or return an error to the caller.
- [ ] Write a second test that verifies the push is retried on the next successful checkpoint write for the same run.

## 2. Task Implementation
- [ ] Locate the git push logic in `CheckpointStore` (likely in a `push_to_remote` or similar method).
- [ ] Wrap the push operation in a `match` or `if let` that catches `git2::Error`.
- [ ] On push failure, log a WARN-level structured log with `event_type: "checkpoint.push_failed"`.
- [ ] Ensure the local commit still succeeds even when push fails.
- [ ] Implement a "push pending" flag or state that marks the run for retry on next write.
- [ ] On the next successful `write_checkpoint` call for the same run, check the "push pending" flag and retry the push.

## 3. Code Review
- [ ] Verify that the local checkpoint file is always updated successfully regardless of push status.
- [ ] Ensure the WARN log includes sufficient context (run_id, error message, remote name).
- [ ] Check that the retry mechanism does not cause infinite retry loops.
- [ ] Confirm that the "push pending" state is correctly cleared after a successful push.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-checkpoint --test push_failure_tests` and ensure all cases pass.
- [ ] Run the full checkpoint test suite to verify no regressions.

## 5. Update Documentation
- [ ] Document the "push pending" retry mechanism in the checkpoint module's architecture documentation.
- [ ] Add a note that the local checkpoint file is authoritative for crash recovery, not the remote.

## 6. Automated Verification
- [ ] Run `./do test` and verify traceability for `RISK-003-BR-004`.
- [ ] Confirm `target/traceability.json` shows the requirement is covered.
