# Task: Build VSCode postMessage Bridge for LangGraph State Streaming to Sidebar Webview (Sub-Epic: 01_Real-time Event Bus Infrastructure)

## Covered Requirements
- [1_PRD-REQ-MAP-005], [TAS-038]

## 1. Initial Test Written
- [ ] Create `packages/vscode-extension/src/transport/__tests__/postmessage-bridge.test.ts`.
- [ ] Write a unit test that:
  1. Creates a mock `vscode.Webview` with a stub `postMessage(msg: unknown): Thenable<boolean>` method (use `vi.fn()`).
  2. Instantiates `PostMessageBridge` with the mock webview.
  3. Publishes a `STATE_TRANSITION` event to the `EventBus` singleton.
  4. Asserts `mockWebview.postMessage` was called with `{ command: 'devs.event', payload: <the event> }`.
- [ ] Write a unit test verifying that batched `THOUGHT_STREAM` events result in a single `postMessage` call with `{ command: 'devs.event.batch', payload: { events: DevsEvent[] } }`.
- [ ] Write a unit test verifying `PostMessageBridge.detach()` unsubscribes from `EventBus` and subsequent events do NOT trigger `postMessage`.
- [ ] Write a unit test verifying that if `postMessage` rejects (returns a rejected `Thenable`), the error is caught and logged — it must not propagate and crash the extension host.
- [ ] Write a unit test verifying the bridge does not call `postMessage` when the webview's `visible` property is `false` — events published while the webview is hidden are dropped (not queued) to prevent memory leaks in long-running sessions.
- [ ] All tests must mock `vscode` module using `vi.mock('vscode')` — the `vscode` module must not be imported from the real extension host in tests.

## 2. Task Implementation
- [ ] Create directory `packages/vscode-extension/src/transport/`.
- [ ] Create `packages/vscode-extension/src/transport/postmessage-bridge.ts`:
  - Import `EventBus`, `DevsEvent`, `ThoughtBatchingBuffer` from `@devs/core`.
  - Import `vscode` (type-only where possible to keep the module testable via mocks).
  - Export `PostMessageBridgeOptions`: `{ eventBus?: EventBus; logger?: Logger; batchOptions?: ThoughtBatchingBufferOptions; }`.
  - Export `PostMessageBridge` class:
    - Constructor accepts `webview: vscode.Webview` and `PostMessageBridgeOptions`.
    - Stores a reference to the webview and the `EventBus` instance (defaults to `EventBus.getInstance()`).
    - Instantiates a `ThoughtBatchingBuffer` whose `onFlush` callback calls `this.sendBatch(batch)`.
    - Subscribes to `EventBus` with `'*'` wildcard.
    - In the subscription handler:
      - If `webview.visible === false`, drop the event and return.
      - If event type is `THOUGHT_STREAM`, push to `ThoughtBatchingBuffer` and return.
      - Otherwise, call `this.send(event)`.
    - Private `send(event: DevsEvent): void` — calls `this.webview.postMessage({ command: 'devs.event', payload: event })` and handles the returned `Thenable` rejection via `.then(undefined, (err) => logger.error(err))`.
    - Private `sendBatch(events: DevsEvent[]): void` — calls `this.webview.postMessage({ command: 'devs.event.batch', payload: { events } })` with same error handling.
    - Method `detach(): void` — unsubscribes the `EventBus` token, calls `ThoughtBatchingBuffer.destroy()`.
- [ ] Register `PostMessageBridge` in the VSCode extension's `activate()` function in `packages/vscode-extension/src/extension.ts`. Instantiate when the sidebar webview panel is created; call `bridge.detach()` in the panel's `onDidDispose` callback.
- [ ] Create `packages/vscode-extension/src/transport/index.ts` re-exporting `PostMessageBridge` and `PostMessageBridgeOptions`.

## 3. Code Review
- [ ] Verify the `visible` check is performed on every event dispatch to prevent accumulating stale events while the webview is hidden.
- [ ] Verify `detach()` is idempotent: calling it twice must not throw (use a `detached` boolean flag).
- [ ] Verify there is no direct dependency from `packages/vscode-extension` into the WebSocket or SSE transport modules — the postMessage bridge is the only mechanism for webview communication.
- [ ] Verify the message contract (`command: 'devs.event'` and `command: 'devs.event.batch'`) matches what the webview's `window.addEventListener('message', ...)` handler expects (cross-reference with the frontend webview component — that handler will be implemented in a later task but the contract must be agreed now).
- [ ] Verify the `vscode` import uses `import type` where it only consumes types, to avoid bundling the entire `vscode` module into unit test contexts.

## 4. Run Automated Tests to Verify
- [ ] Run `pnpm --filter @devs/vscode-extension test src/transport/__tests__/postmessage-bridge.test.ts` and confirm all tests pass with exit code 0.
- [ ] Run `pnpm --filter @devs/vscode-extension test --coverage` and verify line coverage for `src/transport/postmessage-bridge.ts` is ≥ 90%.
- [ ] Run `pnpm --filter @devs/vscode-extension build` and confirm zero TypeScript errors.

## 5. Update Documentation
- [ ] Add a section `## postMessage Bridge` to `packages/vscode-extension/README.md` documenting: the message contract (`devs.event` / `devs.event.batch`), the `visible` optimization, and lifecycle (attach on panel create, detach on panel dispose).
- [ ] Update `docs/architecture/event-bus.md` to show the `PostMessageBridge` in the VSCode Extension layer: `EventBus → PostMessageBridge → vscode.Webview.postMessage() → Sidebar React UI`.
- [ ] Append to `docs/agent-memory/decisions.md`: "Phase 12 / Task 05 — `PostMessageBridge` forwards EventBus events to the VSCode Sidebar via `webview.postMessage`. THOUGHT_STREAM events are batched. Events are dropped (not queued) when the webview is not visible. Contract: command='devs.event' for single, 'devs.event.batch' for batched."

## 6. Automated Verification
- [ ] Run `pnpm --filter @devs/vscode-extension test --reporter=json --outputFile=test-results/postmessage-bridge.json` and assert the JSON contains `"numFailedTests": 0`.
- [ ] Compile the extension in a headless VSIX package with `vsce package --no-dependencies` and assert exit code 0, confirming the extension host will load without runtime errors related to this bridge.
