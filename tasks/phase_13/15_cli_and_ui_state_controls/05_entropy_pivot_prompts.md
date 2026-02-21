# Task: Implement Entropy Pivot Prompts (Pivot Rationalization Notifications) (Sub-Epic: 15_CLI and UI State Controls)

## Covered Requirements
- [4_USER_FEATURES-REQ-064]

## 1. Initial Test Written
- [ ] In `src/core/__tests__/pivotRationalization.test.ts`, write unit tests for `PivotRationalizationNotifier`:
  - Test that `PivotRationalizationNotifier.notify({ previousStrategy, newStrategy, reason, taskId })` formats a "Pivot Rationalization" message containing all four fields.
  - Test that the notifier emits a `PIVOT_RATIONALIZATION` event on the shared `EventBus` with the structured payload.
  - Test that the notifier persists the pivot event to a `strategy_pivots` SQLite table (columns: `id INTEGER PRIMARY KEY`, `task_id TEXT`, `previous_strategy TEXT`, `new_strategy TEXT`, `reason TEXT`, `timestamp TEXT`).
  - Test that if a pivot occurs with the same `previousStrategy` → `newStrategy` transition for the same `taskId` that has already been recorded, a `DuplicatePivotError` is thrown to prevent looping.
- [ ] In `src/cli/__tests__/pivotRationalizationOutput.test.ts`, write tests for CLI rendering:
  - Test that the CLI subscribes to `PIVOT_RATIONALIZATION` events and prints a formatted notification block:
    ```
    ── STRATEGY PIVOT ──────────────────────────────────
    Task:     <taskId>
    Previous: <previousStrategy>
    New:      <newStrategy>
    Reason:   <reason>
    ────────────────────────────────────────────────────
    ```
  - Test that the VSCode extension displays this as a `vscode.window.showWarningMessage` with the pivot reason as the message body.

## 2. Task Implementation
- [ ] Create `src/core/PivotRationalizationNotifier.ts` with:
  - `notify(pivot: PivotEvent): Promise<void>`:
    1. Check `strategy_pivots` for duplicate transition; throw `DuplicatePivotError` if found.
    2. Insert new row into `strategy_pivots`.
    3. Emit `{ type: 'PIVOT_RATIONALIZATION', payload: pivot }` on `EventBus`.
- [ ] Create the `strategy_pivots` migration in `src/db/migrations/`:
  ```sql
  CREATE TABLE IF NOT EXISTS strategy_pivots (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    task_id TEXT NOT NULL,
    previous_strategy TEXT NOT NULL,
    new_strategy TEXT NOT NULL,
    reason TEXT NOT NULL,
    timestamp TEXT NOT NULL
  );
  ```
- [ ] In `src/cli/renderers/PivotRationalizationRenderer.ts`, subscribe to `EventBus` for `PIVOT_RATIONALIZATION` and print the formatted block to stdout (use `boxen` or plain string formatting with box-drawing characters).
- [ ] In `src/vscode/notifications/PivotRationalizationNotification.ts`, subscribe to `EventBus` and call `vscode.window.showWarningMessage("Strategy Pivot: " + pivot.reason, "View Details")` on each event.
- [ ] Call `PivotRationalizationNotifier.notify(...)` from the `OrchestrationLoop` wherever a strategy change is forced (e.g., after adding a strategy to the blacklist).

## 3. Code Review
- [ ] Verify `DuplicatePivotError` is a named custom error class (not a generic `Error`) so it can be caught specifically.
- [ ] Confirm `EventBus` is a typed event emitter (e.g., using `mitt` or `EventEmitter` with typed channels) — no `any` types on event payloads.
- [ ] Verify `PivotRationalizationRenderer` and `PivotRationalizationNotification` only react to events; they do not call DB directly.
- [ ] Confirm the `strategy_pivots` table insert is atomic and rolls back on `DuplicatePivotError`.

## 4. Run Automated Tests to Verify
- [ ] Run `npm test -- --testPathPattern="pivotRationalization"` and confirm all tests pass.
- [ ] Run `npm test -- --testPathPattern="OrchestrationLoop"` to confirm integration with the pivot notifier is correct.

## 5. Update Documentation
- [ ] Create `src/core/PivotRationalizationNotifier.agent.md` (AOD) documenting the pivot event schema, DB table, and `DuplicatePivotError` guard.
- [ ] Update `docs/error-handling.md` with a section on Pivot Rationalization: what triggers it, what the user sees, and the duplicate pivot protection.

## 6. Automated Verification
- [ ] Run `npm test -- --coverage --testPathPattern="PivotRationalizationNotifier"` and confirm ≥ 90% line coverage.
- [ ] Simulate a forced strategy pivot in the E2E test suite (`npm run test:e2e -- --grep "pivot rationalization"`) and assert: a row exists in `strategy_pivots`, and the CLI output contains the `── STRATEGY PIVOT ──` header.
