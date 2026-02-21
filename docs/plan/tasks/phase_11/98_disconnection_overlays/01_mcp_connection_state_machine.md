# Task: MCP Connection State Machine & RECONNECTING State (Sub-Epic: 98_Disconnection_Overlays)

## Covered Requirements
- [6_UI_UX_ARCH-REQ-098], [6_UI_UX_ARCH-REQ-049]

## 1. Initial Test Written
- [ ] In `packages/ui-hooks/src/__tests__/useMcpConnection.test.ts`, write unit tests using Vitest + React Testing Library for a `useMcpConnection` hook:
  - Test that initial state is `{ status: 'CONNECTED', reconnectAttempt: 0 }` when the MCP WebSocket mock fires `open`.
  - Test that when the WebSocket mock fires `close`, state transitions to `{ status: 'RECONNECTING', reconnectAttempt: 1 }`.
  - Test that when the WebSocket mock fires `open` after a close, state transitions back to `{ status: 'CONNECTED', reconnectAttempt: 0 }`.
  - Test that `isInteractionDisabled` returns `true` when `status === 'RECONNECTING'` and `false` when `status === 'CONNECTED'`.
  - Test that the hook dispatches a `sync_all` message to the MCP client upon successful reconnection.
  - Test that the exponential backoff timer doubles on each failed reconnect attempt (1s, 2s, 4s… capped at 30s), using fake timers (`vi.useFakeTimers()`).
  - Test that cleanup clears the backoff timer when the hook unmounts.
- [ ] In `packages/vscode/src/__tests__/mcpBridge.test.ts`, write integration tests:
  - Mock the `vscode.postMessage` API. Simulate the extension receiving a `CONNECTION_LOST` postMessage and verify the webview store transitions to RECONNECTING state.
  - Simulate the extension receiving a `CONNECTION_RESTORED` postMessage and verify state returns to CONNECTED and `sync_all` is dispatched.

## 2. Task Implementation
- [ ] Create `packages/ui-hooks/src/useMcpConnection.ts`:
  - Define a `ConnectionStatus` union type: `'CONNECTED' | 'RECONNECTING' | 'FAILED'`.
  - Define `ConnectionState = { status: ConnectionStatus; reconnectAttempt: number; lastDisconnectedAt: number | null }`.
  - Accept a `mcpClient` ref as parameter (the MCP WebSocket/socket abstraction).
  - Register `onClose` and `onOpen` handlers on the client.
  - On `close`: set `status` to `'RECONNECTING'`, increment `reconnectAttempt`, schedule reconnect with exponential backoff (`Math.min(1000 * 2 ** attempt, 30000)`).
  - On `open` after reconnect: set `status` to `'CONNECTED'`, reset `reconnectAttempt` to 0, call `mcpClient.send({ type: 'sync_all' })`.
  - Expose `isInteractionDisabled: boolean` derived as `status !== 'CONNECTED'`.
  - Expose `connectionState` for consumers.
  - Return a cleanup function that clears the backoff timer.
- [ ] Update the Zustand global UI store (`packages/ui-hooks/src/store/uiStore.ts`):
  - Add a `connectionState: ConnectionState` slice.
  - Add actions: `setConnectionState(state: ConnectionState)`.
- [ ] In the Webview bootstrap (`packages/webview/src/main.tsx`), wire the `useMcpConnection` hook to the Zustand store so `connectionState` stays globally synchronized.
- [ ] In `packages/vscode/src/mcpBridge.ts`, emit `CONNECTION_LOST` and `CONNECTION_RESTORED` postMessages when the extension host MCP socket changes state.

## 3. Code Review
- [ ] Verify `useMcpConnection` is a pure custom hook with no direct DOM side-effects; it only drives state.
- [ ] Confirm exponential backoff is capped at 30 seconds to prevent infinite rapid reconnects.
- [ ] Ensure `sync_all` is only dispatched once per reconnect cycle (idempotency guard).
- [ ] Confirm the Zustand slice uses `immer` for immutable updates consistent with the rest of the store.
- [ ] Verify cleanup functions prevent memory leaks (no dangling timers or event listeners after unmount).
- [ ] Confirm TypeScript strict mode: no `any` types in hook or store slice.

## 4. Run Automated Tests to Verify
- [ ] Run `pnpm --filter @devs/ui-hooks test` and confirm all tests in `useMcpConnection.test.ts` pass.
- [ ] Run `pnpm --filter @devs/vscode test` and confirm all tests in `mcpBridge.test.ts` pass.
- [ ] Run `pnpm typecheck` from the repo root and confirm zero TypeScript errors.

## 5. Update Documentation
- [ ] Create/update `packages/ui-hooks/src/useMcpConnection.agent.md` documenting:
  - Hook signature and parameters.
  - State machine diagram (Mermaid `stateDiagram-v2`) showing CONNECTED → RECONNECTING → CONNECTED/FAILED transitions.
  - Backoff algorithm details and cap value.
  - How to consume `isInteractionDisabled` in UI components.
- [ ] Update `packages/ui-hooks/README.md` to include `useMcpConnection` in the exported hooks table.

## 6. Automated Verification
- [ ] Run `pnpm --filter @devs/ui-hooks test --reporter=json > /tmp/useMcpConnection-results.json` and assert exit code is `0`.
- [ ] Run `node -e "const r = require('/tmp/useMcpConnection-results.json'); process.exit(r.numFailedTests > 0 ? 1 : 0)"` to confirm zero failures without trusting agent self-report.
