# Task: Verify Hard Timeout and Termination Sequence (Sub-Epic: 20_Risk 005 Verification)

## Covered Requirements
- [AC-RISK-005-02], [MIT-005]

## Dependencies
- depends_on: [02_verify_timer_cleanup_and_isolation.md]
- shared_components: [./do Entrypoint Script]

## 1. Initial Test Written
- [ ] Create a new E2E test in `tests/test_presubmit_timeout.py` that invokes `./do presubmit`.
- [ ] Mock a presubmit step that hangs indefinitely (e.g., a "sleep infinity" step).
- [ ] For the purposes of testing, the timeout should be configurable via environment variables (e.g., `PRESUBMIT_TEST_TIMEOUT=10s` instead of the hardcoded 900s).
- [ ] Verify that the presubmit process is terminated exactly at the specified timeout.
- [ ] Assert that `./do presubmit` exits with a non-zero code.
- [ ] Verify that the termination sequence is followed: SIGTERM followed by a 5-second grace period, then SIGKILL.
- [ ] Check that all child processes spawned by `./do presubmit` are also terminated within the 905s (test timeout + 5s) window.

## 2. Task Implementation
- [ ] Implement the 900-second hard timeout logic in the background timer process.
- [ ] Ensure the timer triggers the termination sequence on the main process and its subprocesses.
- [ ] Implement the 5-second grace period between SIGTERM and SIGKILL.
- [ ] Verify that wall-clock time is used, not CPU time, as per `[RISK-005-BR-001]` (though that is not explicitly my task, it is part of the `MIT-005` mitigation I'm verifying).

## 3. Code Review
- [ ] Verify that the termination logic correctly identifies all child processes.
- [ ] Ensure that on Windows, taskkill or equivalent is used to handle the process tree if necessary.
- [ ] Check that the non-zero exit code is consistent for all timeout events.

## 4. Run Automated Tests to Verify
- [ ] Run `pytest tests/test_presubmit_timeout.py`.
- [ ] Verify that all assertions pass.

## 5. Update Documentation
- [ ] Update documentation to explicitly mention the 15-minute hard timeout and the 5-second SIGKILL grace period.

## 6. Automated Verification
- [ ] Run `.tools/verify_requirements.py` to ensure `[AC-RISK-005-02]` and `[MIT-005]` are covered by the new tests.
