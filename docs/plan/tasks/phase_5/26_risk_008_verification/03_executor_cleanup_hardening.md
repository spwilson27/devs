# Task: Implement Hardened StageExecutor Cleanup (Sub-Epic: 26_Risk 008 Verification)

## Covered Requirements
- [RISK-008-BR-004]

## Dependencies
- depends_on: []
- shared_components: [devs-executor]

## 1. Initial Test Written
- [ ] Create unit tests in `devs-executor/src/cleanup_tests.rs` that:
    - Mock each type of executor (Tempdir, Docker, RemoteSsh).
    - Trigger `cleanup()` while the cleanup logic itself is mocked to fail (e.g., directory doesn't exist, Docker daemon unavailable).
    - Verifies that `cleanup()` returns successfully (does not propagate errors).
    - Verifies that a `WARN` log is emitted with `event_type: "executor.cleanup_failed"` when cleanup fails.

## 2. Task Implementation
- [ ] Review and modify the `cleanup()` method in `devs-executor/src/lib.rs` (trait definition) and each implementation:
    - `LocalTempDirExecutor`: Ensure `rm -rf` errors are caught and logged as `WARN`.
    - `DockerExecutor`: Ensure `docker rm` errors are caught and logged as `WARN`.
    - `RemoteSshExecutor`: Ensure `rm -rf` on the remote host is executed without propagation of failure if the connection is already lost.
- [ ] Implement error handling for each:
    - Use `tracing::warn!(event_type = "executor.cleanup_failed", %handle, error = %e)` when an error occurs during cleanup.
    - Ensure all code in `cleanup()` is within a block that catches and suppresses errors/panics (e.g., using `std::panic::catch_unwind` if necessary, though `Result` handling is preferred for normal operations).
- [ ] Ensure all tests are annotated with `// Covers: RISK-008-BR-004`.

## 3. Code Review
- [ ] Verify that `cleanup()` is always called in the executor lifecycle (scheduler's responsibility, but executor must be safe).
- [ ] Confirm that `cleanup()` logic never returns a `Result::Err` and never panics as per `RISK-008-BR-004`.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-executor --lib cleanup_tests`.

## 5. Update Documentation
- [ ] None.

## 6. Automated Verification
- [ ] Run `./do test` and check for the presence of `executor.cleanup_failed` in logs when tests trigger intentional cleanup failures.
