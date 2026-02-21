# Task: Implement Test Hallucination Verification (Sub-Epic: 31_4_USER_FEATURES)

## Covered Requirements
- [4_USER_FEATURES-REQ-038]

## 1. Initial Test Written
- [ ] Write a test `test_hallucination_verification.ts` that mocks a `ReviewNode` execution.
- [ ] Provide an implementation of a test file that contains tautological assertions (e.g., `expect(true).toBe(true)` or `assert 1 == 1`).
- [ ] Assert that the `ReviewerAgent` flags this task as `FAILED_HALLUCINATED_TEST` rather than accepting the green exit code.

## 2. Task Implementation
- [ ] Enhance the `ReviewerAgent`'s prompt and logic to perform a "Logic Verification" turn before running or accepting test results.
- [ ] Implement a lightweight AST parser or an LLM-based verification step within the `ReviewNode` that analyzes the *content* of the test files added in the `TestNode`.
- [ ] Configure the system to reject tests that do not invoke the actual source files modified in the implementation, or that only contain meaningless assertions.
- [ ] Route rejected tasks back to the `DeveloperAgent` with the observation: "Test hallucination detected. The test must invoke the implemented functions and assert meaningful outcomes."

## 3. Code Review
- [ ] Validate that the hallucination check runs *before* declaring a task successful.
- [ ] Ensure the check does not produce false positives on valid framework setup logic.
- [ ] Verify that the `ReviewerAgent` explicitly logs the rationale for rejecting the test.

## 4. Run Automated Tests to Verify
- [ ] Run `npm test -- reviewer_hallucination_check` to verify the agent correctly identifies tautological tests and meaningless assertions.
- [ ] Verify the agent correctly passes legitimate tests that mock dependencies and assert functional logic.

## 5. Update Documentation
- [ ] Document the `FAILED_HALLUCINATED_TEST` state in the LangGraph state machine definitions.
- [ ] Update the `ReviewerAgent` profile in `docs/agents.md` to detail its AST/Logic verification responsibilities.

## 6. Automated Verification
- [ ] Run a script that provides a mocked `DeveloperAgent` outputting a fake test `console.log('done'); process.exit(0);`. Assert the `ReviewNode` fails the task and returns a hallucination error to the agent loop.
