# Task: Verify Presubmit Background Timer Lifecycle (Sub-Epic: 20_Risk 005 Verification)

## Covered Requirements
- [RISK-005-BR-003]

## Dependencies
- depends_on: [none]
- shared_components: [./do Entrypoint Script]

## 1. Initial Test Written
- [ ] Create a new E2E test in `tests/test_presubmit_timer.py` that invokes `./do presubmit`.
- [ ] The test should monitor the presence and contents of `target/.presubmit_timer.pid` during the run.
- [ ] Verify that a valid PID exists in `target/.presubmit_timer.pid` while `./do presubmit` is running.
- [ ] Verify that after a successful `./do presubmit` run, the background timer process is explicitly killed and the PID file is removed.
- [ ] Create a test case where a previous run leaked a `.presubmit_timer.pid` (e.g., by manually creating the file before running `./do presubmit`).
- [ ] Verify that the new `./do presubmit` run identifies the stale PID and does NOT terminate prematurely due to it.
- [ ] Assert that a new background timer is spawned and it works as expected.

## 2. Task Implementation
- [ ] Update `./do presubmit` logic to explicitly kill the background timer on successful completion (e.g., in a `finally` block).
- [ ] Ensure `target/.presubmit_timer.pid` is deleted after the timer process is killed.
- [ ] Implement logic to handle stale PID files at startup of `./do presubmit` by either killing the process if it exists (and belongs to a `devs` timer) or simply overwriting the file with the new PID.
- [ ] Verify the "background timer process" is separate from the main process (e.g., using `subprocess.Popen`).

## 3. Code Review
- [ ] Verify that `os.kill` (or equivalent) is used correctly on all platforms (Unix and Windows).
- [ ] Ensure no race condition exists between spawning the timer and writing its PID file.
- [ ] Check for potential leaks: if `./do presubmit` crashes, the next run MUST clean up the stale timer.

## 4. Run Automated Tests to Verify
- [ ] Run `pytest tests/test_presubmit_timer.py`.
- [ ] Verify that all assertions pass.

## 5. Update Documentation
- [ ] Update `devs` developer guide with details about the background timer lifecycle.

## 6. Automated Verification
- [ ] Run `.tools/verify_requirements.py` to ensure `[RISK-005-BR-003]` is covered by the new tests.
