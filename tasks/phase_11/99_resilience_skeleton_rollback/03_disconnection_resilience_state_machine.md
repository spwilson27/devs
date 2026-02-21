# Task: Implement MCP Disconnection Resilience State Machine & State Reconciliation (Sub-Epic: 99_Resilience_Skeleton_Rollback)

## Covered Requirements
- [6_UI_UX_ARCH-REQ-049]

## 1. Initial Test Written
- [ ] In `packages/vscode/src/webview/bridge/__tests__/reconnectionStateMachine.test.ts`, create unit tests for the reconnection state machine:
  - **Test: Initial state is CONNECTED**: Assert that a freshly constructed `ReconnectionStateMachine` instance has `state === 'CONNECTED'`.
  - **Test: CONNECTED → DISCONNECTED on socket close**: Call `machine.onSocketClose()` and assert `state === 'DISCONNECTED'`.
  - **Test: DISCONNECTED → RECONNECTING on retry start**: Call `machine.onRetryStart()` and assert `state === 'RECONNECTING'`.
  - **Test: RECONNECTING → CONNECTED on success**: Call `machine.onReconnectSuccess()` and assert `state === 'CONNECTED'`.
  - **Test: RECONNECTING → DISCONNECTED on retry exhaustion**: Call `machine.onRetryExhausted()` and assert `state === 'DISCONNECTED'`.
  - **Test: Interactive lock during RECONNECTING**: Assert `machine.interactiveButtonsDisabled === true` when in `RECONNECTING` state.
  - **Test: Interactive lock during DISCONNECTED**: Assert `machine.interactiveButtonsDisabled === true` when in `DISCONNECTED` state.
  - **Test: Interactive unlock on CONNECTED**: Assert `machine.interactiveButtonsDisabled === false` when in `CONNECTED` state.
- [ ] In `packages/vscode/src/webview/bridge/__tests__/syncReconciliation.test.ts`:
  - **Test: `sync_all` dispatched on reconnect**: Mock the MCP bridge and assert that upon `onReconnectSuccess()`, the bridge sends a `sync_all` request to the extension host within 100ms.
  - **Test: Store state updated after `sync_all` response**: Simulate a `sync_all` response payload and assert that the Zustand project mirror store (Tier 2) is fully updated with the new server state.
  - **Test: `sequence_id` validated on `sync_all` response**: Assert that if the response `sequence_id` is lower than the current local `sequence_id`, a warning is logged and the local state is NOT overwritten.

## 2. Task Implementation
- [ ] **`ReconnectionStateMachine` class**: Create `packages/vscode/src/webview/bridge/reconnectionStateMachine.ts`:
  ```ts
  type ConnectionState = 'CONNECTED' | 'RECONNECTING' | 'DISCONNECTED';
  class ReconnectionStateMachine {
    state: ConnectionState = 'CONNECTED';
    get interactiveButtonsDisabled(): boolean {
      return this.state !== 'CONNECTED';
    }
    onSocketClose(): void { this.state = 'DISCONNECTED'; }
    onRetryStart(): void  { this.state = 'RECONNECTING'; }
    onReconnectSuccess(): void { this.state = 'CONNECTED'; }
    onRetryExhausted(): void  { this.state = 'DISCONNECTED'; }
  }
  ```
  - Wire state transitions to dispatch `setConnectionStatus` on the Zustand connection store (from Task 02) so UI reactivity is maintained.
- [ ] **Exponential backoff reconnection logic**: In `packages/vscode/src/extension/mcpClient.ts`:
  - On socket `close` event: set status to `DISCONNECTED`, then begin exponential backoff retry loop (1s, 2s, 4s, 8s, max 30s, up to 10 retries).
  - On each retry attempt: set status to `RECONNECTING` before the attempt.
  - On success: set status to `CONNECTED` and trigger `sync_all`.
  - On exhaustion (10 retries): set status to `DISCONNECTED` permanently and post an error notification to the Webview.
- [ ] **`sync_all` reconciliation**: In `packages/vscode/src/webview/bridge/mcpBridge.ts`:
  - After reconnection, send `{ type: 'TOOL_CALL', tool: 'sync_all' }` to the extension host.
  - On response: validate `sequence_id` is greater than or equal to local `sequence_id`. If valid, dispatch a bulk `setProjectState(payload)` action to the Zustand Tier 2 store.
  - If `sequence_id` is stale: log a warning via `console.warn` and do NOT overwrite local state.
- [ ] **`sequence_id` tracking**: In `packages/vscode/src/webview/store/projectStore.ts` (Tier 2 store):
  - Add `sequenceId: number` field, initialized to `0`.
  - Update `sequenceId` on every `STATE_CHANGE` event received from the extension host.
  - Expose `sequenceId` as a selector for the reconciliation check.
- [ ] **Button disable enforcement**: In `packages/vscode/src/webview/components/controls/ActionButton.tsx`:
  - Read `interactiveButtonsDisabled` from the connection store.
  - Apply `disabled={interactiveButtonsDisabled}` and `aria-disabled={interactiveButtonsDisabled}` to all action buttons when in RECONNECTING/DISCONNECTED state.
  - Add `title="Reconnecting to agent..."` tooltip when disabled due to connection state.

## 3. Code Review
- [ ] Verify the state machine is the single authority for connection state — no component or hook directly reads raw WebSocket status.
- [ ] Verify the exponential backoff implementation in `mcpClient.ts` caps at 30 seconds and a maximum of 10 retries, with no infinite loop risk.
- [ ] Verify `sync_all` is called exactly once per reconnection event, not on every `STATE_CHANGE`.
- [ ] Verify `sequence_id` validation prevents stale `sync_all` responses from clobbering newer optimistic state.
- [ ] Verify `ActionButton` disabled state properly uses both `disabled` and `aria-disabled` attributes to ensure both functional and accessible blocking per WCAG 2.1 AA.
- [ ] Verify no race condition exists between the reconnection retry loop and `sync_all` — `sync_all` must only fire after `onReconnectSuccess()` is confirmed.

## 4. Run Automated Tests to Verify
- [ ] Run: `pnpm --filter @devs/vscode test -- --testPathPattern="reconnectionStateMachine|syncReconciliation"` and confirm all tests pass.
- [ ] Run: `pnpm --filter @devs/vscode test:extension -- --testPathPattern="mcpClient"` and confirm backoff and reconnection tests pass.
- [ ] Run the full test suite: `pnpm --filter @devs/vscode test` and confirm zero regressions.

## 5. Update Documentation
- [ ] Create `packages/vscode/src/webview/bridge/README.agent.md` documenting:
  - `ReconnectionStateMachine` state diagram (as ASCII or Mermaid).
  - The `sync_all` reconciliation contract (when triggered, `sequence_id` validation logic).
  - The backoff schedule (1s, 2s, 4s, 8s, max 30s, 10 retries).
- [ ] Update `packages/vscode/src/webview/store/README.agent.md` to document the `sequenceId` field in the Tier 2 project store and its role in preventing stale state overwrites.
- [ ] Add an entry to `tasks/phase_11/agent_memory.md` recording: "`6_UI_UX_ARCH-REQ-049` fulfilled by `ReconnectionStateMachine` + exponential backoff in `mcpClient.ts` + `sync_all` reconciliation on reconnect."

## 6. Automated Verification
- [ ] Run `pnpm --filter @devs/vscode test -- --coverage --testPathPattern="reconnectionStateMachine|syncReconciliation"` and assert line coverage ≥ 90%.
- [ ] Run a script: `node scripts/verify_no_direct_websocket_reads.js` (create if absent) that uses `grep -r "readyState\|WebSocket(" packages/vscode/src/webview/` and asserts zero results outside of `mcpClient.ts` (confirming no component reads WebSocket directly).
- [ ] Run `pnpm --filter @devs/vscode build` and confirm zero TypeScript compilation errors.
