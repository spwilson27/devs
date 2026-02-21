# Task: Implement Regression Blame Identification (Sub-Epic: 09_Root Cause Analysis (RCA) & Debugging)

## Covered Requirements
- [8_RISKS-REQ-086]

## 1. Initial Test Written
- [ ] Create a unit test suite in `tests/core/analysis/RegressionBlamer.test.ts`.
- [ ] Mock an SQLite database memory state containing a linear history of 5 tasks and their associated Git commit hashes.
- [ ] Mock a test failure payload.
- [ ] Write a test asserting that `RegressionBlamer.identifyTask(testFailurePayload, dbContext)` correctly bisects or traverses the history to identify the exact task ID that introduced the regression.

## 2. Task Implementation
- [ ] Implement `RegressionBlamer` in `src/core/analysis/RegressionBlamer.ts`.
- [ ] Write the logic to interface with the `tasks` SQLite table and Git history.
- [ ] Implement a bisect-like algorithm or log-parsing heuristic that matches the failing test file/line against the diffs of recent task commits.
- [ ] Return the identified Task ID, Commit Hash, and a brief confidence score of the blame assignment.

## 3. Code Review
- [ ] Ensure database queries against the `tasks` table use parameterized inputs to prevent SQL injection.
- [ ] Verify that the identification algorithm performs efficiently even if the task history is hundreds of commits long.

## 4. Run Automated Tests to Verify
- [ ] Run `npm run test -- tests/core/analysis/RegressionBlamer.test.ts`.
- [ ] Ensure the tests pass and the algorithm correctly identifies the mocked breaking task in multiple simulated histories.

## 5. Update Documentation
- [ ] Add a section in `docs/architecture/RegressionHandling.md` describing the bisect heuristic used by the `RegressionBlamer`.
- [ ] Update `.agent.md` with instructions on how to consume the blame report during a `RefactorNode` phase.

## 6. Automated Verification
- [ ] Run a synthetic end-to-end regression script (`npm run simulate-regression`) that intentionally breaks a test and asserts the `RegressionBlamer` outputs the correct Task ID to stdout.
