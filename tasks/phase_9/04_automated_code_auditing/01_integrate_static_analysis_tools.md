# Task: Integrate Static Analysis Tools into TDD Loop (Sub-Epic: 04_Automated Code Auditing)

## Covered Requirements
- [TAS-033], [1_PRD-REQ-MET-006]

## 1. Initial Test Written
- [ ] Create a new unit test suite in `tests/orchestrator/StaticAnalysis.test.ts`.
- [ ] Write a test that simulates a Developer Agent committing code with missing semicolons, unused variables, and formatting violations.
- [ ] The test must assert that the new `StaticAnalyzer` service triggers a `FAILED_LINT` error and blocks the TDD cycle from proceeding to the "Green" state.
- [ ] Write a second test asserting that code matching the project's Prettier and ESLint rules passes the `StaticAnalyzer` successfully.

## 2. Task Implementation
- [ ] Create a `StaticAnalyzer` class in `@devs/core` (or the equivalent code validation module).
- [ ] Configure `StaticAnalyzer` to wrap calls to the sandbox's shell execution of `npm run lint` and `npm run format:check`.
- [ ] Modify the TDD loop orchestrator (`DeveloperAgent` workflow) to run the `StaticAnalyzer` after every implementation step and before running the unit tests.
- [ ] If `StaticAnalyzer` detects errors or warnings, parse the stdout/stderr, append it to the task failure context, and return the agent to the `Action` phase to fix the linting errors.

## 3. Code Review
- [ ] Ensure that the `StaticAnalyzer` does not leak raw file paths from the sandbox environment to the main context.
- [ ] Verify that ESLint and Prettier errors are correctly summarized so they don't consume the entire context window.
- [ ] Ensure there are zero linting/typing errors in your own newly created files.

## 4. Run Automated Tests to Verify
- [ ] Run `npm run test` and filter for `StaticAnalysis.test.ts`. Ensure both the failing and passing conditions work deterministically.

## 5. Update Documentation
- [ ] Update the `.agent.md` documentation for the TDD loop to mention that static analysis is now a mandatory step before tests are executed.

## 6. Automated Verification
- [ ] Run `npm run test -- StaticAnalysis.test.ts` and ensure the exit code is 0. Check the test output to verify the `StaticAnalyzer` correctly parses ESLint output.