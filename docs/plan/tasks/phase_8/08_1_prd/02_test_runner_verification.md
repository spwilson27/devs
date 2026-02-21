# Task: Implement Test Runner and VerificationNode (Green Phase) (Sub-Epic: 08_1_PRD)

## Covered Requirements
- [1_PRD-REQ-IMP-002]

## 1. Initial Test Written
- [ ] Write tests that verify VerificationNode.run_tests(sandbox_dir, runner_command) and VerificationNode.apply_green_impl behave correctly:
  - run_tests must return {passed: boolean, exit_code: number, stdout: string, stderr: string}.
  - When run against the red test produced by TestNode, run_tests returns passed:false and exit_code != 0.
  - After applying a minimal green implementation (apply_green_impl writes minimal production file inside sandbox), rerunning run_tests returns passed:true and exit_code == 0.
  - Tests should operate entirely in a temporary sandbox and must not mutate the outer repo state.

## 2. Task Implementation
- [ ] Implement VerificationNode with the following methods:
  - run_tests(sandbox_dir, runner_command, timeout_ms=30000): spawn subprocess with cwd=sandbox_dir, capture stdout/stderr, enforce timeout, return structured result.
  - apply_green_impl(sandbox_dir, implementation_snippet, target_path, language): create minimal production file to satisfy the failing test.
  - Ensure the runner invocation is executed safely (no shell=True with unvalidated input) and allow configurable timeout and resource limits.

## 3. Code Review
- [ ] Verify:
  - No shell-injection vulnerabilities in runner invocation.
  - Timeouts and max-output size configured and tested.
  - Tests cover flaky outputs and ensure deterministic parsing of results.
  - Implementation is mockable for unit tests.

## 4. Run Automated Tests to Verify
- [ ] Execute the verification tests: they should first assert failure on red test and then success after apply_green_impl; assert exit codes and passed boolean change accordingly.

## 5. Update Documentation
- [ ] Document VerificationNode API and its return schema in docs/tdd.md and add an example of using apply_green_impl to convert a failing test to passing.

## 6. Automated Verification
- [ ] Add scripts/ci_verify_tdd_cycle.(sh|py) that orchestrates: create sandbox -> TestNode.create_red_test -> VerificationNode.run_tests (assert fail) -> VerificationNode.apply_green_impl -> VerificationNode.run_tests (assert pass); exit 0 only on full cycle success.
