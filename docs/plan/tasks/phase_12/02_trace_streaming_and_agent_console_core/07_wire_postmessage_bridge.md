# Task: Wire postMessage Bridge Between VSCode Extension Host and Webview (Sub-Epic: 02_Trace Streaming and Agent Console Core)

## Covered Requirements
- [TAS-058], [3_MCP-TAS-038], [1_PRD-REQ-INT-009], [9_ROADMAP-TAS-703]

## 1. Initial Test Written

- [ ] In `packages/vscode-extension/src/__tests__/saop-webview-bridge.test.ts`, write unit tests using `vscode` mock (from `@vscode/test-electron` or a manual mock in `__mocks__/vscode.ts`):
  - Test that when `SaopWsClient` emits an `onEnvelope` call with a `ThoughtEnvelope`, the bridge calls `webviewPanel.webview.postMessage({ type: "saop:thought", envelope: <ThoughtEnvelope> })`.
  - Test that when `SaopWsClient` emits an `onEnvelope` call with an `ActionEnvelope`, the bridge calls `postMessage({ type: "saop:action", envelope: <ActionEnvelope> })`.
  - Test that when `SaopWsClient` emits an `onEnvelope` call with an `ObservationEnvelope`, the bridge calls `postMessage({ type: "saop:observation", envelope: <ObservationEnvelope> })`.
  - Test that when the `SaopWsClient` emits a `"connection_failed"` event, the bridge calls `postMessage({ type: "saop:status", status: "disconnected" })`.
  - Test that when `SaopWsClient.connect()` is called, the bridge immediately posts `{ type: "saop:status", status: "connecting" }`, and then `{ type: "saop:status", status: "connected" }` once the WebSocket `open` event fires.
  - Test that when the Webview is disposed (`webviewPanel.onDidDispose`), `SaopWsClient.disconnect()` is called automatically.
  - Test that when the bridge is initialized with a null `webviewPanel` (panel not yet created), envelope messages are queued and replayed in order once `setWebviewPanel(panel)` is called.

## 2. Task Implementation

- [ ] Create `packages/vscode-extension/src/streaming/saop-webview-bridge.ts`.
- [ ] Import `SaopWsClient` from `./saop-ws-client`, `SAOPEnvelope`, `ThoughtEnvelope`, `ActionEnvelope`, `ObservationEnvelope` from `@devs/core`, and `vscode` from `vscode`.
- [ ] Implement class `SaopWebviewBridge` with:
  - `constructor(client: SaopWsClient)` — stores the client reference.
  - Private `panel: vscode.WebviewPanel | null = null`.
  - Private `pendingMessages: Array<{ type: string; envelope?: SAOPEnvelope; status?: string }> = []`.
  - `setWebviewPanel(panel: vscode.WebviewPanel): void`:
    - Stores `panel`.
    - Registers `panel.onDidDispose(() => this.handleDispose())`.
    - Drains `pendingMessages` by calling `panel.webview.postMessage()` for each.
    - Clears `pendingMessages`.
  - `start(url: string, taskId: string): void`:
    - Posts `{ type: "saop:status", status: "connecting" }`.
    - Calls `client.connect(url, taskId)`.
    - Registers `client.on("open", () => this.post({ type: "saop:status", status: "connected" }))`.
    - Registers `client.on("connection_failed", () => this.post({ type: "saop:status", status: "disconnected" }))`.
    - Passes `onEnvelope` callback that routes to `this.routeEnvelope(envelope)`.
  - Private `routeEnvelope(envelope: SAOPEnvelope): void` — dispatches `post({ type: "saop:thought"|"saop:action"|"saop:observation", envelope })` based on `envelope.type`.
  - Private `post(message: object): void` — if `panel` is non-null, calls `panel.webview.postMessage(message)`; otherwise appends to `pendingMessages`.
  - Private `handleDispose(): void` — calls `client.disconnect()`, sets `panel = null`.
- [ ] Update `packages/vscode-extension/src/extension.ts` to:
  - Instantiate `SaopWsClient` and `SaopWebviewBridge` once during extension activation.
  - On `devs.openAgentConsole` command: create the `vscode.WebviewPanel` and call `bridge.setWebviewPanel(panel)`.
  - On `devs.startSession` command: call `bridge.start(wsUrl, taskId)`.

## 3. Code Review

- [ ] Verify the pending message queue is drained in FIFO order (use array `shift()` or drain in `for` loop with `splice(0)`), preserving event sequence.
- [ ] Confirm the bridge registers `client.on("open", ...)` AFTER calling `client.connect()` to avoid a race condition where `open` fires synchronously before the listener is attached. (Note: in async WebSocket implementations this is safe, but add an inline comment explaining this assumption.)
- [ ] Verify that if `setWebviewPanel` is called while messages are being posted (e.g., from a rapid series of `onEnvelope` callbacks), the `pendingMessages` array is not mutated mid-drain (use a local `const toSend = this.pendingMessages.splice(0)` pattern).
- [ ] Ensure the bridge does not hold a strong reference to the Webview after `handleDispose()`, to allow garbage collection.

## 4. Run Automated Tests to Verify

- [ ] Run `npm test --workspace=packages/vscode-extension -- --testPathPattern=saop-webview-bridge` and confirm all tests pass.
- [ ] Run `npm run typecheck --workspace=packages/vscode-extension` and confirm zero TypeScript errors.

## 5. Update Documentation

- [ ] Create `packages/vscode-extension/src/streaming/saop-webview-bridge.agent.md` documenting:
  - The bridge's role as the intermediary between `SaopWsClient` (Node.js Extension Host) and the Webview (browser context).
  - The pending message queue and its FIFO drain behavior when the Webview panel is first set.
  - The full `postMessage` message type catalogue (`saop:thought`, `saop:action`, `saop:observation`, `saop:status`, `saop:clear`).
  - Instructions for wiring `SaopWebviewBridge` into `extension.ts`.

## 6. Automated Verification

- [ ] Run `npm test --workspace=packages/vscode-extension -- --testPathPattern=saop-webview-bridge --coverage` and confirm `saop-webview-bridge.ts` has ≥ 90% line coverage.
- [ ] Run `npm run build --workspace=packages/vscode-extension` and confirm the extension compiles without errors.
- [ ] In the Extension Development Host, open the Agent Console panel before starting a session, then start a session, and verify that all events emitted during the pre-panel period are correctly replayed in the correct order once the panel opens.
