# Task: Implement Disconnection Mask Overlay with Reconnecting Toast (Sub-Epic: 99_Resilience_Skeleton_Rollback)

## Covered Requirements
- [7_UI_UX_DESIGN-REQ-UI-DES-086-2], [6_UI_UX_ARCH-REQ-049]

## 1. Initial Test Written
- [ ] In `packages/vscode/src/webview/components/overlays/__tests__/`, create `DisconnectedMask.test.tsx`:
  - Write a test that renders `<DisconnectedMask visible={true} />` and asserts an element with `data-testid="disconnected-mask"` is present in the DOM.
  - Write a test asserting the mask element has `style` including `backdropFilter: "blur(4px)"` (or the equivalent CSS class that resolves to this).
  - Write a test asserting a child element with `data-testid="reconnecting-toast"` is rendered, containing the text `"Reconnecting..."`.
  - Write a test that renders `<DisconnectedMask visible={false} />` and asserts the mask element is NOT present (or has `display: none` / `aria-hidden="true"`).
  - Write a test asserting the toast renders with `role="alert"` and `aria-live="assertive"` for immediate screen reader announcement.
  - Write a test confirming interactive zone children passed as `children` prop are rendered behind the mask (non-interactable) by verifying `pointer-events: none` on the overlay layer.
- [ ] In `packages/vscode/src/webview/store/__tests__/connectionStore.test.ts`:
  - Write a test that dispatches `setConnectionStatus('DISCONNECTED')` to the Zustand store and asserts `connectionStatus` equals `'DISCONNECTED'` and `interactiveButtonsDisabled` equals `true`.
  - Write a test that dispatches `setConnectionStatus('RECONNECTING')` and asserts `connectionStatus === 'RECONNECTING'` and `interactiveButtonsDisabled === true`.
  - Write a test that dispatches `setConnectionStatus('CONNECTED')` and asserts `connectionStatus === 'CONNECTED'` and `interactiveButtonsDisabled === false`.

## 2. Task Implementation
- [ ] **Connection status store slice**: In `packages/vscode/src/webview/store/connectionStore.ts` (create or extend `uiStore.ts`), define:
  ```ts
  type ConnectionStatus = 'CONNECTED' | 'RECONNECTING' | 'DISCONNECTED';
  interface ConnectionState {
    connectionStatus: ConnectionStatus;
    interactiveButtonsDisabled: boolean;
    setConnectionStatus: (status: ConnectionStatus) => void;
  }
  ```
  - `setConnectionStatus` must set `connectionStatus` and set `interactiveButtonsDisabled` to `true` when status is `'RECONNECTING'` or `'DISCONNECTED'`, and `false` when `'CONNECTED'`.
- [ ] **`DisconnectedMask` component**: Create `packages/vscode/src/webview/components/overlays/DisconnectedMask.tsx`:
  - Accepts `visible: boolean` and `children?: React.ReactNode`.
  - When `visible` is `true`, renders a `<div>` with `data-testid="disconnected-mask"` positioned `absolute` or `fixed` over the interactive zones, with:
    - `style={{ backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)' }}`
    - `pointer-events: all` on the overlay itself.
    - A child `<div data-testid="reconnecting-toast" role="alert" aria-live="assertive">` containing the text `"Reconnecting..."` styled as a high-priority toast (use `--vscode-notificationsWarningIcon-foreground` and `--vscode-notifications-background` tokens).
    - A `pointer-events: none` wrapper around `{children}` to prevent interaction with the underlying UI.
  - When `visible` is `false`, renders `{children}` directly with no overlay.
- [ ] **MCP socket disconnection listener**: In `packages/vscode/src/webview/bridge/mcpBridge.ts` (or the `postMessage` handler):
  - Listen for the `CONNECTION_STATUS_CHANGED` message from the extension host.
  - On receipt, dispatch `setConnectionStatus(payload.status)` to the connection store.
- [ ] **App shell integration**: In `packages/vscode/src/webview/App.tsx`:
  - Import `useConnectionStore` and select `connectionStatus`.
  - Wrap the main interactive layout zones with `<DisconnectedMask visible={connectionStatus !== 'CONNECTED'} >`.
- [ ] **Extension host MCP socket monitoring**: In `packages/vscode/src/extension/mcpClient.ts`:
  - On socket `close` or `error` event, post `{ type: 'CONNECTION_STATUS_CHANGED', payload: { status: 'DISCONNECTED' } }` to the Webview.
  - On reconnection attempt start, post `{ status: 'RECONNECTING' }`.
  - On successful reconnection, post `{ status: 'CONNECTED' }`.

## 3. Code Review
- [ ] Verify `backdrop-filter: blur(4px)` is applied exactly as specified in `7_UI_UX_DESIGN-REQ-UI-DES-086-2` — confirm both `backdropFilter` and `WebkitBackdropFilter` are set for cross-browser coverage.
- [ ] Verify the toast uses `role="alert"` and `aria-live="assertive"` (not `"polite"`) since disconnection is a high-priority state change.
- [ ] Verify `interactiveButtonsDisabled` in the store is consumed by all action buttons (Approve, Inject Directive, etc.) to prevent user interaction during reconnection, satisfying `6_UI_UX_ARCH-REQ-049`.
- [ ] Verify the `DisconnectedMask` does not hardcode any colors — all colors use `--vscode-*` tokens per `6_UI_UX_ARCH-REQ-004`.
- [ ] Verify the mask overlay uses a z-index within the `Overlays (200)` tier as required by `7_UI_UX_DESIGN-REQ-UI-DES-049-Z2`.
- [ ] Confirm `CONNECTION_STATUS_CHANGED` is a documented message type in the bridge contract and that no other component duplicates this logic.

## 4. Run Automated Tests to Verify
- [ ] Run: `pnpm --filter @devs/vscode test -- --testPathPattern="DisconnectedMask|connectionStore"` and confirm all tests pass with zero failures.
- [ ] Run the full extension host test suite: `pnpm --filter @devs/vscode test:extension` and confirm no regressions in `mcpClient.ts`.

## 5. Update Documentation
- [ ] Create `packages/vscode/src/webview/components/overlays/README.agent.md` documenting: `DisconnectedMask` props, z-index tier (200), and CSS token dependencies.
- [ ] Update `packages/vscode/src/webview/store/README.agent.md` to document the `ConnectionState` slice, valid `ConnectionStatus` enum values, and the invariant that `interactiveButtonsDisabled === true` whenever `connectionStatus !== 'CONNECTED'`.
- [ ] Update `packages/vscode/src/extension/mcpClient.ts` header comment to document the three connection events posted to the Webview and their payload shapes.

## 6. Automated Verification
- [ ] Run `pnpm --filter @devs/vscode test -- --coverage --testPathPattern="DisconnectedMask|connectionStore"` and assert coverage ≥ 90% for `DisconnectedMask.tsx` and `connectionStore.ts`.
- [ ] Run a Playwright E2E test (if E2E suite exists at `packages/vscode/e2e/`) that simulates MCP socket closure and asserts:
  1. The mask overlay appears within 500ms.
  2. The "Reconnecting..." text is visible.
  3. Clicking an action button during disconnection has no effect.
  4. Upon simulated reconnection, the overlay disappears and buttons re-enable.
- [ ] Run `pnpm --filter @devs/vscode build` and confirm zero errors.
