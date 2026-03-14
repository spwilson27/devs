# Task: Presubmit Background Wall-Clock Timer (Sub-Epic: 19_Risk 004 Verification)

## Covered Requirements
- [RISK-005], [RISK-005-BR-001]

## Dependencies
- depends_on: ["03_presubmit_incremental_timing_logging.md"]
- shared_components: [./do Entrypoint Script]

## 1. Initial Test Written
- [ ] Create (or update) a test in `tests/test_presubmit_timeout.py` (or similar).
- [ ] Write a test that mocks a presubmit step that takes longer than the timeout (e.g., 900s, but use a shorter one for testing like 2s).
- [ ] Verify that the presubmit process is terminated exactly at the timeout.
- [ ] Assert that the process exits non-zero with a "presubmit timeout after 900s" (or configured test timeout) message.
- [ ] Ensure that even if the main process is in a synchronous `subprocess.run` call, the background timer process still triggers the termination.
- [ ] Verify that child processes (e.g., the long-running step) are also terminated (SIGTERM followed by SIGKILL).

## 2. Task Implementation
- [ ] Re-implement the presubmit timer logic in `cmd_presubmit()` to use a background process instead of `signal.alarm`.
- [ ] At the start of `cmd_presubmit()`:
    - Spawn a background Python process using `subprocess.Popen` that:
        - Receives the parent process PID and the timeout (900s) as arguments.
        - Writes its own PID to `target/.presubmit_timer.pid`.
        - Sleeps for the duration.
        - If still running after the sleep:
            - Sends `SIGTERM` to the parent process and its children.
            - Waits 5s.
            - Sends `SIGKILL` to anything remaining.
            - Exits with a timeout message.
- [ ] Ensure the main process correctly handles the `SIGTERM` by cleaning up its own state and exiting non-zero.
- [ ] In the `finally` block of `cmd_presubmit()` (on success OR failure):
    - Read `target/.presubmit_timer.pid` and kill that process if it is still running (using `os.kill(timer_pid, signal.SIGKILL)`).
    - Remove the PID file.
- [ ] Verify that wall-clock time is used (e.g., `time.time()`-based or simply `time.sleep()`).
- [ ] The timeout must be a global 900s for the entire `./do presubmit` run.

## 3. Code Review
- [ ] Verify the "fail-safe" of killing the background timer on successful exit to avoid a leaked timer killing future runs.
- [ ] Ensure the timer fires even if the main process is blocked in a system call (by using a separate process).
- [ ] Check that SIGTERM/SIGKILL handles the entire process group if possible, or at least the main process and its immediate subprocesses.

## 4. Run Automated Tests to Verify
- [ ] Run `./do test` and confirm the presubmit timeout tests pass.
- [ ] Manually run `./do presubmit` with a temporarily lowered timeout (e.g., 5s) and a `sleep 10` step to verify the trigger.

## 5. Update Documentation
- [ ] Update the `do` script help message or comments reflecting the 15-minute background timer.

## 6. Automated Verification
- [ ] Run `./do test` and verify that `[RISK-005]` and `[RISK-005-BR-001]` are marked as verified by the traceability script.
