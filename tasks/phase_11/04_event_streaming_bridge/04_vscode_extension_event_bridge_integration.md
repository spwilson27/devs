# Task: VSCode: Extension Host Event Bridge Integration (Sub-Epic: 04_Event_Streaming_Bridge)

## Covered Requirements
- [6_UI_UX_ARCH-REQ-036], [6_UI_UX_ARCH-REQ-010]

## 1. Initial Test Written
- [ ] In the VSCode Extension tests (`@devs/vscode/src/test/`), create an integration test that mocks the `@devs/core` Orchestrator and verifies the extension host successfully forwards a batched message to the Webview.
- [ ] Use a mock `WebviewPanel` and verify that its `postMessage` method is called with the expected batched envelope.
- [ ] Verify that the `STATE_CHANGE` events are correctly intercepted by the Extension Host and passed through.
- [ ] Test the Extension Host's ability to handle multiple concurrent Webview panels (if applicable) and route messages correctly.

## 2. Task Implementation
- [ ] In `@devs/vscode/src/extension.ts` (or a dedicated bridge module), initialize the `MessageBatcher` from `@devs/core`.
- [ ] Create a listener that subscribes to the `@devs/core` Orchestrator events (specifically `STATE_CHANGE` and `ThoughtStream`).
- [ ] Implement the callback that feeds these events into the `MessageBatcher`.
- [ ] Provide the `MessageBatcher` with a sender function that calls `webviewPanel.webview.postMessage(batch)`.
- [ ] Ensure the Extension Host gracefully handles cases where the Webview is closed or disposed while messages are being batched.
- [ ] Implement a "Flush on Dispose" policy to ensure no messages are lost when the extension is deactivated or the project is closed.

## 3. Code Review
- [ ] Confirm that the Extension Host bridge doesn't introduce any unnecessary latency.
- [ ] Verify that the `postMessage` calls are not redundant (e.g., sending multiple identical state updates).
- [ ] Check for proper error handling if the `postMessage` call fails.
- [ ] Ensure that the `STATE_CHANGE` event remains the source of truth for UI refreshes.

## 4. Run Automated Tests to Verify
- [ ] Run the VSCode Extension integration tests.
- [ ] Manually verify the end-to-end flow from Orchestrator -> Core Batcher -> Extension Host -> Webview using the Extension Development Host.

## 5. Update Documentation
- [ ] Update the internal VSCode Extension architecture docs to reflect the bridge logic and its dependency on `@devs/core/MessageBatcher`.
- [ ] Document the lifecycle of the bridge relative to the Webview panel's lifecycle.

## 6. Automated Verification
- [ ] Use a script to verify that every `STATE_CHANGE` event emitted by the core is received by the mock Webview within 100ms (50ms batching + IPC overhead).
