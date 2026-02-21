# Task: Implement Webview-to-Extension postMessage Bridge (Sub-Epic: 03_Interface_Core_Decoupling)

## Covered Requirements
- [6_UI_UX_ARCH-REQ-008]

## 1. Initial Test Written
- [ ] Create a unit test `packages/vscode/tests/webview_bridge.test.ts` using a JSDOM environment.
- [ ] Mock the `acquireVsCodeApi()` global function.
- [ ] Write a test that sends a message from a mock React component and verifies that `vscode.postMessage` is called with the correct MCP-wrapped payload.

## 2. Task Implementation
- [ ] Implement the `useMcpBridge` hook in `packages/vscode/src/webview/hooks/useMcpBridge.ts`.
- [ ] Build a `PostMessageBatcher` in `packages/vscode/src/webview/bridge/PostMessageBatcher.ts` to implement the 32ms/50ms bottleneck mitigation (REQ-036/REQ-044).
- [ ] Create a standardized `sendMcpRequest` helper that wraps UI triggers into MCP `callTool` requests.
- [ ] Implement a global event listener in the Webview that listens for `window.message` and routes them to the Tier 2 Zustand store.

## 3. Code Review
- [ ] Verify that the `PostMessageBatcher` correctly groups multiple state updates into a single frame.
- [ ] Ensure that no direct references to VSCode APIs are leaked into the React components themselves; everything must go through the bridge hook.
- [ ] Check that the message envelope includes the required `sequence_id` and `timestamp`.

## 4. Run Automated Tests to Verify
- [ ] Run `npm test packages/vscode/tests/webview_bridge.test.ts` and ensure batching and message routing work as expected.

## 5. Update Documentation
- [ ] Document the `PostMessageBatcher` logic in the `docs/architecture/ui_performance.md` file.

## 6. Automated Verification
- [ ] Use the VSCode Webview Developer Tools to monitor the `postMessage` traffic and verify that high-frequency updates are indeed batched.
