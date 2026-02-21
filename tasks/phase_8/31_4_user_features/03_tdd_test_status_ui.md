# Task: Implement TDD Test Status UI (Sub-Epic: 31_4_USER_FEATURES)

## Covered Requirements
- [4_USER_FEATURES-REQ-037]

## 1. Initial Test Written
- [ ] Write a parsing test `test_tdd_status_formatter.ts` that provides mock raw output from a failing `npm test` and a passing `npm test`.
- [ ] Assert that a failing test output correctly translates to a `Test Established (Red)` semantic status event.
- [ ] Assert that a passing test output correctly translates to a `Requirement Met (Green)` semantic status event.

## 2. Task Implementation
- [ ] Build a `TestStatusParser` utility that monitors the sandbox test runner execution.
- [ ] Integrate this parser into the CLI and VSCode terminal views to intercept standard test outputs.
- [ ] Implement UI indicators (badges or colored text segments) that explicitly show "🔴 Test Established (Red)" during the `TestNode` phase when tests fail.
- [ ] Implement UI indicators showing "🟢 Requirement Met (Green)" during the `VerificationNode` phase when the tests pass.

## 3. Code Review
- [ ] Ensure the parser handles different test runner formats (e.g., Jest, Vitest, PyTest) robustly by checking exit codes rather than relying solely on brittle regex matching of stdout.
- [ ] Verify that the color formatting respects the `High-Contrast & Color Blindness Support` constraints (e.g., using symbols alongside colors).

## 4. Run Automated Tests to Verify
- [ ] Execute `npm test -- tdd_status_parser` to ensure correct translation of exit codes and stdout into semantic statuses.
- [ ] Verify the CLI output coloring correctly applies ANSI red/green escape codes depending on the state.

## 5. Update Documentation
- [ ] Add the TDD semantic states to the UX definitions in the `PRD` and `TAS`.
- [ ] Update the `DeveloperAgent` documentation to explain how test exit codes map to the UI indicators.

## 6. Automated Verification
- [ ] Run a headless CLI session that orchestrates a mock task with an intentionally failing then passing test, asserting that the stdout log contains the exact strings "Test Established (Red)" followed by "Requirement Met (Green)".
