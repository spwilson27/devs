# Task: Implement AIC (Agent-Initiated Clarification) Interaction Dialogs (Sub-Epic: 15_CLI and UI State Controls)

## Covered Requirements
- [4_USER_FEATURES-REQ-066]

## 1. Initial Test Written
- [ ] In `src/core/__tests__/aicDialog.test.ts`, write unit tests for `AICDialogManager`:
  - Test that `AICDialogManager.prompt({ taskId, conflictDescription, options })` suspends the `OrchestrationLoop` (sets `run_state.status = 'AWAITING_USER'`) before presenting the dialog.
  - Test that the dialog waits for user input before resolving (mock the input stream / VSCode `showWarningMessage` response).
  - Test that on user response, `run_state.status` is set back to `'RUNNING'` and the resolved option is returned to the caller.
  - Test that if no response is received within a configurable timeout (default: `AIC_DIALOG_TIMEOUT_MS = 300000` ms / 5 minutes), the dialog auto-resolves with the first option and emits a `AIC_TIMEOUT` log event.
  - Test that `AICDialogManager.prompt()` persists the clarification request and user response to an `aic_interactions` SQLite table.
- [ ] In `src/cli/__tests__/aicDialogCli.test.ts`, write tests for CLI rendering:
  - Test that the CLI presents the conflict description and numbered option list to stdout.
  - Test that typing a valid option number and pressing Enter resolves the dialog.
  - Test that an invalid input re-prompts the user (up to 3 attempts, then auto-selects option 1 with a warning).
- [ ] In `src/vscode/__tests__/aicDialogVscode.test.ts`, write tests:
  - Test that `vscode.window.showWarningMessage(conflictDescription, ...options)` is called with the correct arguments.
  - Test that the selected option string is returned to `AICDialogManager`.

## 2. Task Implementation
- [ ] Create `src/core/AICDialogManager.ts`:
  - `prompt(request: AICRequest): Promise<string>`:
    1. Set `run_state.status = 'AWAITING_USER'` in a DB transaction.
    2. Persist the request to `aic_interactions` (columns: `id`, `task_id`, `conflict_description`, `options` as JSON, `response`, `timestamp`).
    3. Emit `{ type: 'AIC_DIALOG_REQUESTED', payload: request }` on `EventBus`.
    4. Await user response from `EventBus` event `AIC_DIALOG_RESPONDED` with a timeout.
    5. On response: update `aic_interactions` row with response; set `run_state.status = 'RUNNING'`; return the chosen option.
    6. On timeout: log `AIC_TIMEOUT`; auto-select option[0]; proceed as above.
- [ ] Create the `aic_interactions` migration:
  ```sql
  CREATE TABLE IF NOT EXISTS aic_interactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    task_id TEXT NOT NULL,
    conflict_description TEXT NOT NULL,
    options TEXT NOT NULL,
    response TEXT,
    timed_out INTEGER NOT NULL DEFAULT 0,
    timestamp TEXT NOT NULL
  );
  ```
- [ ] Implement `src/cli/renderers/AICDialogRenderer.ts`:
  - Subscribe to `AIC_DIALOG_REQUESTED` on `EventBus`.
  - Print: `\n⚠ AGENT CLARIFICATION NEEDED\n`, then the conflict description, then numbered options.
  - Read stdin line; validate input; emit `AIC_DIALOG_RESPONDED` with the resolved option string.
- [ ] Implement `src/vscode/dialogs/AICDialogVSCode.ts`:
  - Subscribe to `AIC_DIALOG_REQUESTED`.
  - Call `vscode.window.showWarningMessage(conflictDescription, { modal: true }, ...options)`.
  - Emit `AIC_DIALOG_RESPONDED` with the selected item.
- [ ] Add `AIC_DIALOG_TIMEOUT_MS` to the project config (default: 300000).

## 3. Code Review
- [ ] Verify that the `OrchestrationLoop` does not proceed while `run_state.status = 'AWAITING_USER'` (the `isPaused()`-equivalent check should also block on this status).
- [ ] Confirm the timeout uses `Promise.race` between the response event and a `setTimeout` to avoid hanging forever.
- [ ] Verify all `aic_interactions` DB writes are transactional.
- [ ] Confirm both CLI and VSCode renderers emit the same `AIC_DIALOG_RESPONDED` event shape on the shared `EventBus`.
- [ ] Verify the `{ modal: true }` option is set on the VSCode dialog so it blocks user interaction appropriately.

## 4. Run Automated Tests to Verify
- [ ] Run `npm test -- --testPathPattern="aicDialog"` and confirm all tests pass.
- [ ] Run `npm test -- --testPathPattern="OrchestrationLoop"` to confirm the loop correctly blocks during `AWAITING_USER` status.

## 5. Update Documentation
- [ ] Create `src/core/AICDialogManager.agent.md` (AOD) documenting the `AICRequest` type, `aic_interactions` schema, timeout behavior, and `EventBus` event contract.
- [ ] Update `docs/human-in-the-loop.md` with a section on AIC Dialogs: what triggers them, how they appear in CLI vs VSCode, and timeout behavior.

## 6. Automated Verification
- [ ] Run `npm test -- --coverage --testPathPattern="AICDialogManager"` and confirm ≥ 90% line coverage.
- [ ] Run E2E test `npm run test:e2e -- --grep "AIC dialog"` using a mock that auto-responds to the dialog, and assert `aic_interactions` contains a row with a non-null `response` after the test.
