# Task: Implement Typed Message Bridge (postMessage) (Sub-Epic: 01_VSCode_Extension_Core)

## Covered Requirements
- [TAS-102], [6_UI_UX_ARCH-REQ-001]

## 1. Initial Test Written
- [ ] Write a test for the `MessageBridge` class to ensure that messages sent between the extension host and the Webview are correctly typed.
- [ ] Implement a test that verifies the `handleMessage` function correctly dispatches messages to the appropriate handlers.
- [ ] Create a test for the `postMessage` protocol to ensure that the data payload is correctly serialized and deserialized.

## 2. Task Implementation
- [ ] Define a shared TypeScript interface for all messages (events/commands) between the extension host and the Webview.
- [ ] Implement a `MessageBridge` class on the extension host to handle `webview.onDidReceiveMessage` and `webview.postMessage`.
- [ ] Create a corresponding `VSCodeBridge` class in the Webview UI to handle `window.addEventListener('message', ...)` and `vscode.postMessage`.
- [ ] Set up a message routing system to dispatch messages based on their type (e.g., `command`, `event`, `state_update`).
- [ ] Implement a `logMessage` utility to trace all messages passing through the bridge for debugging.
- [ ] Implement a response-based message pattern (request-response) to handle asynchronous operations.

## 3. Code Review
- [ ] Verify that the `TAS-102` requirement for the UI controller is met.
- [ ] Ensure that all messages are strictly typed and use the shared interface.
- [ ] Confirm that the message bridge correctly handles errors and timeouts.

## 4. Run Automated Tests to Verify
- [ ] Execute the unit tests for the `MessageBridge`.
- [ ] Manually verify that sending a message from the Webview correctly triggers a command in the extension host.

## 5. Update Documentation
- [ ] Document the typed message protocol and shared interfaces in the `@devs/vscode` architecture documentation.
- [ ] Update the `extension-webview-bridge.md` AOD with details on message types and routing.

## 6. Automated Verification
- [ ] Run a shell script that verifies the existence of the shared message interface.
- [ ] Check for the `postMessage` call in the compiled Webview code.
