# Task: VSCode Extension HITL Gate Trigger & Popup (Sub-Epic: 82_HITL_Gating_Interface)

## Covered Requirements
- [1_PRD-REQ-INT-010]

## 1. Initial Test Written
- [ ] In `packages/vscode/src/hitl/__tests__/hitlGateTrigger.test.ts`, write unit tests for the `HitlGateTrigger` class (mock the `vscode` module via `jest.mock('vscode')`):
  - When a `HITL_GATE_REQUESTED` event arrives on the extension message bus with `{ gateId, phaseId, checkpointLabel }`, `HitlGateTrigger.handle(event)` invokes `vscode.commands.executeCommand('devs.showHitlGatePanel', gateId)`.
  - When the gate is already `APPROVED` or `REJECTED`, `handle(event)` is a no-op and does not invoke `executeCommand`.
  - `HitlGateTrigger` registers a disposable listener on the message bus on `activate()` and disposes it on `deactivate()`.
- [ ] In `packages/vscode/src/hitl/__tests__/hitlGatePanel.test.ts`, write unit tests for `HitlGatePanel` (mock `vscode.WebviewPanel` and `vscode.window.createWebviewPanel`):
  - `HitlGatePanel.createOrShow(gateId)` calls `vscode.window.createWebviewPanel` with `viewType: 'devs.hitlGate'`, `title: 'Review Required'`, and `options: { enableScripts: true }`.
  - Calling `createOrShow` for the same `gateId` twice reveals the existing panel (does not create a second panel).
  - `HitlGatePanel.dispose()` disposes the underlying `WebviewPanel`.
  - The panel's `onDidReceiveMessage` handler routes `{ command: 'approve' }` to `HitlGateService.approveGate(gateId)` and `{ command: 'reject' }` to `HitlGateService.rejectGate(gateId)`.
  - After `approveGate` resolves, the handler posts `{ command: 'gateResolved', status: 'APPROVED' }` back to the webview and disposes the panel.
- [ ] In `packages/vscode/src/hitl/__tests__/hitlStatusBar.test.ts`, write tests for `HitlStatusBar`:
  - When a `PENDING` gate exists, the status bar item text is `$(warning) Approval Required` and background is `statusBarItem.warningBackground`.
  - When no pending gate exists, the status bar item is hidden.
  - Clicking the status bar item invokes `devs.showHitlGatePanel` for the pending gate.

## 2. Task Implementation
- [ ] Create `packages/vscode/src/hitl/HitlGateTrigger.ts`:
  - Subscribe to the extension's internal `EventBus` for `HITL_GATE_REQUESTED` events.
  - On receipt, call `vscode.commands.executeCommand('devs.showHitlGatePanel', event.gateId)`.
  - Expose `activate(): vscode.Disposable` and implement cleanup in `dispose()`.
- [ ] Create `packages/vscode/src/hitl/HitlGatePanel.ts`:
  - Static `createOrShow(gateId: string, extensionUri: vscode.Uri): HitlGatePanel` factory — reuses existing panel instance keyed by `gateId`.
  - Call `panel.webview.postMessage({ command: 'init', gate: HitlGateService.getGate(gateId) })` immediately after panel creation to hydrate the webview.
  - In `onDidReceiveMessage`, handle `approve` and `reject` commands, calling the core API client (HTTP `PATCH /api/hitl/gates/:id/approve` and `/reject`).
  - On resolution, post `gateResolved` message to webview and call `this.dispose()`.
  - Set CSP header on `panel.webview.html` to allow only `vscode-resource:` and the extension's `nonce`-tagged inline scripts.
- [ ] Create `packages/vscode/src/hitl/HitlStatusBar.ts`:
  - Create a `vscode.StatusBarItem` at `vscode.StatusBarAlignment.Left, priority: 100`.
  - Subscribe to gate state changes; show/hide and update text based on pending gate existence.
  - Assign `command: 'devs.showHitlGatePanel'` on the status bar item.
- [ ] Register `devs.showHitlGatePanel` command in `packages/vscode/src/extension.ts` `activate()` function, bound to `HitlGatePanel.createOrShow`.
- [ ] Ensure all disposables (`HitlGateTrigger`, `HitlStatusBar`, panel) are pushed into `context.subscriptions`.

## 3. Code Review
- [ ] Verify the extension host code never imports `react` or any webview-specific DOM APIs — it is pure VSCode API.
- [ ] Verify the panel's HTML sets a strict CSP nonce: `default-src 'none'; script-src 'nonce-${nonce}' vscode-resource:; style-src 'nonce-${nonce}';`.
- [ ] Verify `createOrShow` is the only code path that calls `vscode.window.createWebviewPanel`; no inline panel creation elsewhere.
- [ ] Verify the `onDidReceiveMessage` handler wraps all async calls in try/catch and posts a `{ command: 'error', message }` back to the webview on failure.
- [ ] Confirm all disposables are registered in `context.subscriptions` to prevent memory leaks on extension deactivation.

## 4. Run Automated Tests to Verify
- [ ] Run `pnpm --filter @devs/vscode test -- --testPathPattern=hitl` and confirm all tests pass.
- [ ] Run `pnpm --filter @devs/vscode build` and confirm TypeScript compilation succeeds with zero errors.

## 5. Update Documentation
- [ ] Add a `## HITL Gate Extension Commands` section to `packages/vscode/README.md` documenting:
  - `devs.showHitlGatePanel` — opens the HITL gate review panel for the pending gate.
  - The status bar indicator and its behaviour.
- [ ] Update `docs/agent-memory/architecture-decisions.md` with:
  ```
  ## [ADR-HITL-002] VSCode Extension HITL Trigger Architecture
  - The extension host listens for HITL_GATE_REQUESTED on the internal EventBus.
  - Each gate maps to exactly one WebviewPanel instance (singleton keyed by gateId).
  - The panel is disposed immediately upon gate resolution (approve or reject).
  - CSP nonces are generated fresh per panel instantiation.
  ```

## 6. Automated Verification
- [ ] Run `pnpm --filter @devs/vscode test -- --ci --testPathPattern=hitl` and assert exit code `0`.
- [ ] Run `pnpm --filter @devs/vscode build` and assert exit code `0`.
- [ ] Confirm `grep -r "devs.showHitlGatePanel" packages/vscode/src/extension.ts` returns the command registration line.
