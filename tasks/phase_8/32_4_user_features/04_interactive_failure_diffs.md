# Task: Implement Interactive Failure Diffs (Sub-Epic: 32_4_USER_FEATURES)

## Covered Requirements
- [4_USER_FEATURES-REQ-061]

## 1. Initial Test Written
- [ ] Write a unit test in `src/ui/diff-viewer.test.ts` (or the equivalent CLI/Webview component test) that passes a failed test output and the corresponding source code changes.
- [ ] Assert that the diff payload correctly maps the line numbers of the failure in the test output to the modified lines in the source code.
- [ ] Assert that the data structure includes the associated `REQ-ID` that the test was attempting to fulfill.

## 2. Task Implementation
- [ ] Implement a `DiffAnalyzer` utility in `src/utils/diff.ts` that takes a Jest/Vitest/Mocha error stack trace and identifies the relevant lines in the application source code.
- [ ] Update the `CodeNode` and `TestNode` state outputs to ensure the targeted `REQ-ID` is explicitly passed along with the test results.
- [ ] For the VSCode Extension: Create a new Webview component `FailureDiffView.tsx` that visually renders the test output on one side and the application code diff on the other. Highlight the specific lines identified by the `DiffAnalyzer`.
- [ ] For the CLI: Implement a TUI view using a library like `blessed` or simple ANSI color-coded output that prints the failing test snippet followed by the Git diff of the modified files, with the `REQ-ID` clearly displayed at the top.
- [ ] Wire the UI components to trigger automatically when a user clicks "View Failure" or runs `devs status --show-diff`.

## 3. Code Review
- [ ] Ensure the diff parsing logic is robust against different test runner output formats.
- [ ] Verify that the VSCode Webview implementation uses the `vscode-webview-ui-toolkit` for consistent styling.
- [ ] Check that large diffs or massive test outputs do not crash the UI (implement truncation or virtualized scrolling if necessary).

## 4. Run Automated Tests to Verify
- [ ] Run `npm test -- src/utils/diff.test.ts` and `npm test -- src/ui/diff-viewer.test.ts`.
- [ ] Ensure UI component tests (if applicable, e.g., React Testing Library) pass for the new Webview component.

## 5. Update Documentation
- [ ] Add screenshots and usage instructions for the Interactive Failure Diffs to the `docs/vscode_extension.md` and `docs/cli.md`.

## 6. Automated Verification
- [ ] Execute a CLI test that runs `devs status --show-diff` on a mocked failed task state and verify the standard output contains the expected ANSI-colored diff and REQ-ID markers.