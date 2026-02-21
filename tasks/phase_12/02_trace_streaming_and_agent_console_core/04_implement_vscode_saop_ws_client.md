# Task: Implement VSCode Extension WebSocket Client for SAOP Stream (Sub-Epic: 02_Trace Streaming and Agent Console Core)

## Covered Requirements
- [TAS-058], [3_MCP-TAS-038], [1_PRD-REQ-INT-009]

## 1. Initial Test Written

- [ ] In `packages/vscode-extension/src/streaming/__tests__/saop-ws-client.test.ts`, write unit tests using a mock WebSocket server (use `ws` in test server mode or `jest-websocket-mock`):
  - Test that `SaopWsClient.connect(url, taskId)` sends a WebSocket upgrade request to `url` and immediately sends `{ "subscribe": taskId }` upon the `open` event.
  - Test that when the mock server sends a valid `ThoughtEnvelope` JSON string, the client's `onEnvelope` callback is invoked with the parsed `ThoughtEnvelope` object.
  - Test that when the mock server sends a JSON string that fails `SAOPEnvelopeSchema.parse()`, the client emits an `"error"` event with a descriptive message and does NOT crash.
  - Test that `SaopWsClient.disconnect()` sends `{ "unsubscribe": taskId }` before closing the connection.
  - Test reconnection logic: if the WebSocket `close` event fires with code `1006` (abnormal closure) within the first 30 seconds, the client attempts reconnection after `2^attempt * 100ms` (exponential backoff), up to a max of 5 retries. Verify retry count increments correctly using fake timers.
  - Test that after 5 failed reconnection attempts, a `"connection_failed"` event is emitted and no further reconnection is attempted.
  - Test that `SaopWsClient.disconnect()` called during a reconnection backoff cancels the pending retry.

## 2. Task Implementation

- [ ] Create `packages/vscode-extension/src/streaming/saop-ws-client.ts`.
- [ ] Import `SAOPEnvelope`, `parseSAOPEnvelope` from `@devs/core`.
- [ ] Implement class `SaopWsClient extends EventEmitter` with:
  - `constructor(options: { onEnvelope: (envelope: SAOPEnvelope) => void })`.
  - Private `ws: WebSocket | null`, `taskId: string | null`, `url: string | null`.
  - Private `retryCount: number = 0`, `maxRetries: number = 5`, `retryTimer: NodeJS.Timeout | null`.
  - `connect(url: string, taskId: string): void`:
    - Stores `url` and `taskId`.
    - Creates a `WebSocket` instance (use the browser-compatible `WebSocket` global, which is available in VSCode Webview contexts).
    - On `open`: sends `JSON.stringify({ subscribe: taskId })`.
    - On `message`: calls `parseSAOPEnvelope(JSON.parse(event.data))`, then calls `onEnvelope`. Wraps in try/catch; on error, emits `"error"`.
    - On `close` (code 1006 and `retryCount < maxRetries`): schedules reconnection via `setTimeout` with delay `Math.min(2 ** retryCount * 100, 30000)`, increments `retryCount`.
    - On `close` (retries exhausted): emits `"connection_failed"`.
  - `disconnect(): void`:
    - Clears retry timer.
    - If `ws` and `ws.readyState === WebSocket.OPEN`, sends `JSON.stringify({ unsubscribe: taskId })` then calls `ws.close(1000)`.
    - Sets `ws = null`.
- [ ] Create `packages/vscode-extension/src/streaming/index.ts` exporting `SaopWsClient`.
- [ ] Integrate `SaopWsClient` into the extension's activation logic in `packages/vscode-extension/src/extension.ts`:
  - On `devs.startSession` command, create a `SaopWsClient` instance and call `connect()` with the orchestrator WebSocket URL (read from `vscode.workspace.getConfiguration("devs").get("orchestrator.wsUrl")`) and the active `taskId`.
  - On `devs.stopSession` command or extension deactivation, call `disconnect()`.

## 3. Code Review

- [ ] Verify exponential backoff uses `Math.min(..., 30000)` to cap at 30 seconds, preventing indefinite backoff growth.
- [ ] Confirm that `parseSAOPEnvelope` errors are emitted as `"error"` events on the EventEmitter rather than thrown, so callers can attach `client.on("error", handler)` without uncaught exception crashes.
- [ ] Confirm `retryCount` is reset to `0` after a successful reconnection (on `open` event).
- [ ] Verify the client does not attempt reconnection when `disconnect()` was explicitly called (i.e., normal `close` code `1000` should not trigger retry).

## 4. Run Automated Tests to Verify

- [ ] Run `npm test --workspace=packages/vscode-extension -- --testPathPattern=saop-ws-client` and confirm all tests pass.
- [ ] Run `npm run typecheck --workspace=packages/vscode-extension` and confirm zero TypeScript errors.

## 5. Update Documentation

- [ ] Create `packages/vscode-extension/src/streaming/saop-ws-client.agent.md` documenting:
  - The WebSocket subscription protocol used (subscribe/unsubscribe messages).
  - The reconnection strategy (exponential backoff, max 5 retries, max 30s delay).
  - How to attach event listeners for `"error"` and `"connection_failed"` events.
  - The VSCode configuration key for the orchestrator WebSocket URL (`devs.orchestrator.wsUrl`).
  - Instructions for wiring the client into `extension.ts` activation/deactivation hooks.

## 6. Automated Verification

- [ ] Run `npm test --workspace=packages/vscode-extension -- --testPathPattern=saop-ws-client --coverage` and confirm `saop-ws-client.ts` has ≥ 90% line coverage.
- [ ] Run `npm run build --workspace=packages/vscode-extension` and confirm the extension VSIX compiles without errors.
