# Task: Implement Robust Presubmit Timeout (Sub-Epic: 076_Detailed Domain Specifications (Part 41))

## Covered Requirements
- [2_TAS-REQ-459]

## Dependencies
- depends_on: [none]
- shared_components: [./do Entrypoint Script]

## 1. Initial Test Written
- [ ] Create a new test `tests/test_presubmit_timeout.py`.
- [ ] Mock the subprocess execution of `./do presubmit`.
- [ ] Write a test where a subcommand (e.g., `test`) is replaced with an infinite-sleep command.
- [ ] Verify that:
    - `./do presubmit` exits non-zero within a short margin of the configured timeout (e.g., if set to 15m, it exits by 16m).
    - All child processes spawned by `./do presubmit` are terminated correctly.

## 2. Task Implementation
- [ ] Update the `./do` script's `PRESUBMIT_TIMEOUT_SECONDS` to `15 * 60` (900 seconds) to match `1_PRD-BR-001`.
- [ ] In `cmd_presubmit`, replace the simple `signal.alarm` with a more robust timeout mechanism that works across all supported platforms (Linux, macOS, Windows) and ensures process group termination:
    - Use `subprocess.Popen` with a timeout loop or `threading.Timer` to monitor the entire presubmit run.
    - On timeout, use `os.killpg` (on Unix) or similar mechanisms to kill the entire process group.
    - Ensure it exits non-zero and prints a clear timeout message.
- [ ] Ensure the timeout applies to the *total* wall-clock time of all checks combined (setup, format, lint, test, coverage, ci).

## 3. Code Review
- [ ] Verify platform compatibility (Windows support is required).
- [ ] Ensure that even if a child process is stuck, the main `./do presubmit` process can exit and clean up.

## 4. Run Automated Tests to Verify
- [ ] Run `python3 tests/test_presubmit_timeout.py`.
- [ ] Temporarily set the timeout to 5 seconds in `./do` and run `./do presubmit` with a command that takes 10 seconds. Verify failure.

## 5. Update Documentation
- [ ] No documentation update required beyond task confirmation.

## 6. Automated Verification
- [ ] Run `./do presubmit` with a mock slow command and verify it exits with a timeout error and non-zero code.
