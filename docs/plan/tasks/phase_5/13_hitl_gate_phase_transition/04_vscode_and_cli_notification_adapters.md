# Task: Implement VSCode & CLI Notification Adapters for HITL Gate (Sub-Epic: 13_HITL Gate & Phase Transition)

## Covered Requirements
- [1_PRD-REQ-UI-001], [1_PRD-REQ-HITL-001], [9_ROADMAP-REQ-001]

## 1. Initial Test Written
- [ ] In `packages/vscode-extension/src/__tests__/vscode-hitl-notification.adapter.test.ts`, write unit tests that mock the VS Code API (`vscode.window.showInformationMessage`, `vscode.commands.executeCommand`) and assert:
  - `VscodeHITLNotificationAdapter.sendApprovalRequest(payload)` calls `vscode.commands.executeCommand('devs.showResearchApprovalPanel', payload)` exactly once.
  - The adapter does NOT call `vscode.window.showInformationMessage` for the approval request (the Webview panel command is the correct mechanism).
  - The adapter resolves without throwing when `executeCommand` resolves.
  - The adapter rejects with a `NotificationAdapterError` when `executeCommand` rejects.
- [ ] In `packages/cli/src/__tests__/cli-hitl-notification.adapter.test.ts`, write unit tests that spy on `process.stdout.write` and assert:
  - `CliHITLNotificationAdapter.sendApprovalRequest(payload)` prints a formatted table of report summaries with confidence scores to stdout.
  - Each row in the table contains `reportType`, `title`, and `confidenceScore` (formatted as a percentage, e.g., `87%`).
  - After printing the table, the adapter prompts the user with `[A]pprove / [R]eject / [D]eep Search? ` via `readline`.
  - When the user inputs `A`, the adapter resolves with `{ decision: 'approve' }`.
  - When the user inputs `R` followed by a reason string, the adapter resolves with `{ decision: 'reject', reason: '...' }`.
  - When the user inputs `D`, the adapter resolves with `{ decision: 'deep_search' }`.
  - Any other input re-prompts the user (the prompt is issued a second time).

## 2. Task Implementation
- [ ] Create `packages/vscode-extension/src/adapters/vscode-hitl-notification.adapter.ts`:
  - Import `INotificationAdapter` and `ApprovalRequestPayload` from `@devs/core`.
  - Implement `VscodeHITLNotificationAdapter` satisfying `INotificationAdapter`.
  - In `sendApprovalRequest(payload)`: call `vscode.commands.executeCommand('devs.showResearchApprovalPanel', payload)` and await the result.
  - Export the class.
- [ ] Create `packages/cli/src/adapters/cli-hitl-notification.adapter.ts`:
  - Import `INotificationAdapter` and `ApprovalRequestPayload` from `@devs/core`.
  - Implement `CliHITLNotificationAdapter` satisfying `INotificationAdapter`.
  - Use Node.js `readline` (not `prompt-sync` or other external libraries) to prompt the user.
  - Format the report table using the `cli-table3` package (already a project dependency).
  - Print confidence score as `(score * 100).toFixed(0) + '%'`.
  - Loop on invalid input until a valid key (`A`, `R`, `D`) is entered.
  - Export the class.
- [ ] Create `packages/cli/src/adapters/__tests__/cli-hitl-notification.adapter.test.ts` (move test here if created elsewhere).
- [ ] Register `VscodeHITLNotificationAdapter` in the VSCode extension's DI container (`packages/vscode-extension/src/extension.ts`) bound to the `INotificationAdapter` token.
- [ ] Register `CliHITLNotificationAdapter` in the CLI's DI container (`packages/cli/src/container.ts`) bound to the `INotificationAdapter` token.

## 3. Code Review
- [ ] Verify `VscodeHITLNotificationAdapter` contains no business logic — it only delegates to the VSCode API.
- [ ] Verify `CliHITLNotificationAdapter` handles readline `close` events gracefully (resolve with `deep_search` as safe default if stdin closes unexpectedly).
- [ ] Verify neither adapter imports from each other or from the other package.
- [ ] Verify the CLI adapter's table output is human-readable at 80-column terminal width.
- [ ] Verify both adapters export only the class (not internal helpers).

## 4. Run Automated Tests to Verify
- [ ] Run `pnpm --filter @devs/vscode-extension test -- --testPathPattern="vscode-hitl"` and confirm all tests pass.
- [ ] Run `pnpm --filter @devs/cli test -- --testPathPattern="cli-hitl"` and confirm all tests pass.

## 5. Update Documentation
- [ ] Create `packages/vscode-extension/src/adapters/vscode-hitl-notification.agent.md`:
  - Document the VSCode command invoked, expected payload shape, and error handling.
- [ ] Create `packages/cli/src/adapters/cli-hitl-notification.agent.md`:
  - Document the terminal UI flow, valid input keys, and the readline loop strategy.

## 6. Automated Verification
- [ ] Run `pnpm --filter @devs/vscode-extension test:coverage -- --testPathPattern="vscode-hitl"` and assert exit code 0.
- [ ] Run `pnpm --filter @devs/cli test:coverage -- --testPathPattern="cli-hitl"` and assert exit code 0.
- [ ] Run `pnpm build` (workspace-wide) and assert exit code 0.
