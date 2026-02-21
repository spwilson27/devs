# Task: State Reconciliation via sync_all on Reconnection (Sub-Epic: 98_Disconnection_Overlays)

## Covered Requirements
- [6_UI_UX_ARCH-REQ-098], [6_UI_UX_ARCH-REQ-049]

## 1. Initial Test Written
- [ ] In `packages/ui-hooks/src/__tests__/useMcpConnection.sync.test.ts`, write unit tests focused on the post-reconnect sync:
  - Test that upon reconnect, the hook calls `mcpClient.send({ type: 'sync_all' })` exactly once.
  - Test that if `sync_all` response arrives, the Zustand store's `connectionState.status` is set to `'CONNECTED'`.
  - Test that if `sync_all` response takes >5000ms (timeout), `status` transitions to `'FAILED'` and the UI store emits a `CONNECTION_FAILED` event.
  - Test that a second rapid reconnect (connection drops again before `sync_all` completes) cancels the in-flight sync and restarts the RECONNECTING cycle cleanly.
- [ ] In `packages/webview/src/__tests__/AppReconnectFlow.test.tsx`, write an integration test:
  - Render the full `<App />` component tree with a mocked MCP client.
  - Simulate connection drop: assert overlay appears, all buttons are disabled.
  - Simulate reconnect: assert overlay disappears, `sync_all` was dispatched, interactive elements are re-enabled.
  - Simulate a new `STATE_CHANGE` event arriving after `sync_all`: assert the Zustand store reflects the updated project state.

## 2. Task Implementation
- [ ] Extend `packages/ui-hooks/src/useMcpConnection.ts` with the sync phase:
  - After WebSocket `open`, before setting `status: 'CONNECTED'`, dispatch `sync_all` and await the acknowledgement event (`{ type: 'sync_all_complete' }`).
  - Use `AbortController` to cancel pending sync if another disconnect occurs during the wait.
  - On `sync_all_complete`: set `status: 'CONNECTED'`, reset `reconnectAttempt`.
  - On sync timeout (>5000ms): set `status: 'FAILED'`, emit a `CONNECTION_FAILED` postMessage to the extension host for logging.
- [ ] In `packages/vscode/src/mcpBridge.ts`:
  - Handle the `CONNECTION_FAILED` postMessage: log the event via the VS Code Output Channel (`vscode.window.createOutputChannel('devs MCP')`).
  - Optionally show a non-blocking VS Code notification: `vscode.window.showWarningMessage('devs: MCP connection could not be restored. Please restart the extension.')`.
- [ ] Ensure the `uiStore` slice actions include `setConnectionFailed()` which sets `status: 'FAILED'` and stores a `failureReason: string`.

## 3. Code Review
- [ ] Verify `AbortController` usage correctly cancels the pending `sync_all` without leaving dangling Promise chains.
- [ ] Confirm the `FAILED` state is surfaced to the UI (the `DisconnectedOverlay` should show a distinct failed message, e.g., "Connection failed. Please restart devs." instead of the spinner) — verify the overlay handles `status === 'FAILED'` in a follow-on state.
- [ ] Confirm `sync_all` is never dispatched if the previous attempt is still in-flight (idempotency guard using a `syncInFlight` ref).
- [ ] Verify the VS Code Output Channel is reused (not recreated on every disconnect cycle).
- [ ] Confirm all Promise rejections are caught and channelled into the `FAILED` state (no unhandled rejections).

## 4. Run Automated Tests to Verify
- [ ] Run `pnpm --filter @devs/ui-hooks test` and confirm all sync-related tests pass.
- [ ] Run `pnpm --filter @devs/webview test` and confirm `AppReconnectFlow.test.tsx` passes end-to-end.
- [ ] Run `pnpm --filter @devs/vscode test` and confirm no regressions in the bridge tests.
- [ ] Run `pnpm typecheck` and confirm zero TypeScript errors.

## 5. Update Documentation
- [ ] Update `packages/ui-hooks/src/useMcpConnection.agent.md` to add:
  - The sync phase state machine extension: RECONNECTING → SYNCING → CONNECTED / FAILED.
  - Mermaid state diagram update.
  - Timeout value (5000ms) and rationale.
  - `AbortController` pattern used for cancellation.
- [ ] Update `packages/vscode/src/mcpBridge.agent.md` to document the `CONNECTION_FAILED` postMessage handling and Output Channel usage.

## 6. Automated Verification
- [ ] Run `pnpm --filter @devs/ui-hooks test --reporter=json > /tmp/sync-reconnect-results.json` and assert exit code `0`.
- [ ] Run `pnpm --filter @devs/webview test --reporter=json > /tmp/app-reconnect-results.json` and assert exit code `0`.
- [ ] Run `node -e "const a = require('/tmp/sync-reconnect-results.json'); const b = require('/tmp/app-reconnect-results.json'); process.exit((a.numFailedTests + b.numFailedTests) > 0 ? 1 : 0)"` to verify zero combined failures.
