# Task: Implement Multi-Run Verification Engine (Sub-Epic: 06_Test Suite Integrity & Flakiness)

## Covered Requirements
- [8_RISKS-REQ-099]

## 1. Initial Test Written
- [ ] Create `tests/test_multi_run_verifier.py`. Write `test_verify_success_3_runs` that mocks the `SandboxRunner` to return a successful exit code 3 times, asserting the `MultiRunVerifier` returns success.
- [ ] Write `test_verify_fails_on_flaky_run` that mocks the `SandboxRunner` to return success on run 1, failure on run 2, and asserts the `MultiRunVerifier` immediately aborts and returns the failure.

## 2. Task Implementation
- [ ] Create `devs/core/multi_run_verifier.py`. Implement the `MultiRunVerifier` class that depends on the `SandboxRunner`.
- [ ] Implement a `verify_test_suite(command: str, project_dir: str)` method that executes the `SandboxRunner` in a loop exactly 3 consecutive times.
- [ ] If any run returns a non-zero exit code, the loop must break immediately, capturing the failed run's output.
- [ ] Return a structured result object indicating whether the test suite passed all 3 runs or failed, including the `stdout` and `stderr` of the failed run.

## 3. Code Review
- [ ] Ensure the loop logic is hardcoded or securely configured to exactly 3 runs, preventing infinite loops or single-run bypasses.
- [ ] Verify that the `SandboxRunner` is instantiated anew or state is cleanly reset between each of the 3 iterations.
- [ ] Ensure the failure object strictly types the error payload.

## 4. Run Automated Tests to Verify
- [ ] Execute `pytest tests/test_multi_run_verifier.py` to confirm the verification logic.
- [ ] Run type checkers `mypy devs/core/multi_run_verifier.py`.

## 5. Update Documentation
- [ ] Update `docs/quality_assurance.md` to reflect the new policy that a single "Green" test result is insufficient and must undergo 3 consecutive clean runs.
- [ ] Document the `MultiRunVerifier` API for the agent orchestration layer.

## 6. Automated Verification
- [ ] Execute an automated bash script that inspects the AST of `devs/core/multi_run_verifier.py` to confirm a loop bound of 3 exists.