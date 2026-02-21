# Task: Implement Flaky Test Detection (Sub-Epic: 31_4_USER_FEATURES)

## Covered Requirements
- [4_USER_FEATURES-REQ-040]

## 1. Initial Test Written
- [ ] Write a test `test_flaky_detection.ts` mocking the test runner execution history within the `VerificationNode`.
- [ ] Simulate a scenario where a test suite exits with `0` (pass) during the implementation turn, but exits with `1` (fail) during the Reviewer's clean sandbox turn.
- [ ] Assert that the orchestrator flags the task as `FLAKY_POTENTIAL`.
- [ ] Assert that the orchestrator immediately triggers a retry loop executing the test suite exactly 3 additional times.

## 2. Task Implementation
- [ ] Modify the `SandboxProvider` or test execution utility to track the historical exit codes of the current test suite.
- [ ] Implement logic in the `ReviewNode` to detect when a previously passing test fails upon review.
- [ ] When detected, emit a `FLAKY_POTENTIAL` status event.
- [ ] Automatically run the test command 3 more times sequentially.
- [ ] If the results are inconsistent across the 3 runs (e.g., Pass, Fail, Pass), flag the task as `FAILED_FLAKY_TEST` and return execution to the `DeveloperAgent` with instructions to fix race conditions or non-deterministic logic.

## 3. Code Review
- [ ] Verify the 3x execution loop correctly isolates state between runs to ensure the flakiness isn't caused by residual test data.
- [ ] Ensure the `FLAKY_POTENTIAL` state correctly surfaces to the UI/CLI so the user understands the delay.
- [ ] Check that hard timeouts are respected during the multiple executions.

## 4. Run Automated Tests to Verify
- [ ] Execute `npm test -- flaky_test_detector` to validate the state transitions and execution counting.
- [ ] Validate that a consistently failing test in review (Fail, Fail, Fail) is marked as a standard failure rather than a flaky test.

## 5. Update Documentation
- [ ] Update the `TAS` documentation covering the `Binary Gate Protocol` to include the `FLAKY_POTENTIAL` and `FAILED_FLAKY_TEST` exit gates.
- [ ] Add the UI event types to the CLI/VSCode event schemas.

## 6. Automated Verification
- [ ] Run a mock task using a script that randomly passes or fails based on `Math.random()`. Assert that the orchestrator detects the inconsistency, executes the 3x verification, and correctly transitions the state to `FAILED_FLAKY_TEST`.
