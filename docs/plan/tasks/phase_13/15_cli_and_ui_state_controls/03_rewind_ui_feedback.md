# Task: Implement Project Rewind (Time-Travel) UI Feedback (Sub-Epic: 15_CLI and UI State Controls)

## Covered Requirements
- [1_PRD-REQ-UI-011]

## 1. Initial Test Written
- [ ] In `src/ui/__tests__/rewindFeedback.test.ts` (VSCode Extension context) and `src/cli/__tests__/rewindFeedbackCli.test.ts` (CLI context), write tests for the "Glitch/Desaturation" visual feedback during rewind:
  - **CLI**: Test that when `RewindManager.rewind()` begins, a `ProgressRenderer.startRewind(taskId, sha)` call emits a terminal spinner with the message `"⏪ Rewinding to task <taskId> (commit <sha>)..."`.
  - **CLI**: Test that when rewind completes, `ProgressRenderer.completeRewind()` prints `"✓ Project rewound to task <taskId>."` and stops the spinner.
  - **VSCode Extension**: Test that a `RewindStatusBarItem` updates its text to `"$(loading~spin) Rewinding..."` with a warning background color during rewind, then reverts to the default status bar state on completion.
  - Test that if rewind fails mid-operation, `ProgressRenderer.failRewind(error)` prints `"✗ Rewind failed: <error.message>"` and the status bar shows an error icon.
  - Test that the rewind feedback UI correctly receives `taskId` and `sha` as parameters and renders them in the output.

## 2. Task Implementation
- [ ] Implement `src/cli/renderers/ProgressRenderer.ts` with methods:
  - `startRewind(taskId: string, sha: string): void` — starts an `ora` spinner with the formatted message.
  - `completeRewind(taskId: string): void` — succeeds the spinner with the completion message.
  - `failRewind(error: Error): void` — fails the spinner with the error message.
- [ ] Implement `src/vscode/statusBar/RewindStatusBarItem.ts`:
  - On `startRewind(taskId, sha)`: set `statusBarItem.text = "$(loading~spin) Rewinding..."`, `statusBarItem.backgroundColor = new vscode.ThemeColor('statusBarItem.warningBackground')`, `statusBarItem.show()`.
  - On `completeRewind()`: revert text and background to defaults.
  - On `failRewind(error)`: set `statusBarItem.text = "$(error) Rewind Failed"` with error background.
- [ ] Wire `ProgressRenderer` calls into `RewindManager.rewind()` at the start, on success, and in the catch block.
- [ ] Wire `RewindStatusBarItem` into the VSCode extension's `activate()` function and subscribe it to `RewindManager` events via an `EventEmitter`.

## 3. Code Review
- [ ] Verify `ProgressRenderer` depends on the `ora` package and that the spinner is always stopped (succeed or fail) even if an exception is thrown (use try/finally).
- [ ] Verify `RewindStatusBarItem` is disposed in the extension's `deactivate()` method to prevent memory leaks.
- [ ] Confirm UI feedback is purely presentational — no business logic in `ProgressRenderer` or `RewindStatusBarItem`.
- [ ] Confirm feedback components receive data via parameters, not by importing `StateController` directly.

## 4. Run Automated Tests to Verify
- [ ] Run `npm test -- --testPathPattern="rewindFeedback"` and confirm all tests pass.
- [ ] Run `npm test -- --testPathPattern="rewindFeedbackCli"` and confirm all tests pass.

## 5. Update Documentation
- [ ] Update `src/cli/renderers/ProgressRenderer.agent.md` (AOD) describing the renderer's methods and their expected call sites.
- [ ] Update `src/vscode/statusBar/RewindStatusBarItem.agent.md` (AOD) describing the status bar item lifecycle and event subscription pattern.
- [ ] Add a note in `docs/ui-patterns.md` (create if it doesn't exist) describing the "Glitch/Desaturation" rewind feedback pattern and which components implement it.

## 6. Automated Verification
- [ ] Run `npm test -- --coverage --testPathPattern="ProgressRenderer|RewindStatusBarItem"` and confirm ≥ 90% line coverage.
- [ ] Manually trigger `devs rewind <taskId>` in a test environment and confirm the spinner appears and resolves correctly in the terminal.
