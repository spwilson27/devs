# Task: Implement Extension Host URI Deep-Linking Handler (Sub-Epic: 05_UI_Interaction_Triggers)

## Covered Requirements
- [6_UI_UX_ARCH-REQ-060]

## 1. Initial Test Written
- [ ] Create an integration test for a custom `UriHandler` to verify it correctly parses a custom URI (e.g., `vscode://google.gemini-devs/open-task?id=TASK-001`).
- [ ] Implement a mock for the `vscode.window.registerUriHandler` API and verify the handler is called with the expected URI.
- [ ] Ensure that the handler extracts the `taskId` and dispatches a navigation command to the Webview.

## 2. Task Implementation
- [ ] Register the `google.gemini-devs` URI scheme in the VSCode extension host (`@devs/vscode`)'s `package.json`.
- [ ] Implement a `DevsUriHandler` class that implements the `vscode.UriHandler` interface. This handler should:
    - Listen for `open-task` paths in the custom URI.
    - Extract the `id` query parameter representing the `taskId`.
    - Use the `postMessage` bridge to send a `NAVIGATE_TO_TASK` message to the Webview.
- [ ] Update the Webview's `ViewRouter` to handle the `NAVIGATE_TO_TASK` message and update the `activeTaskId` in the Zustand store.
- [ ] Call `vscode.window.registerUriHandler(handler)` in the extension's `activate` function.

## 3. Code Review
- [ ] Verify that the custom URI scheme registration matches the extension's unique ID.
- [ ] Ensure that the URI handler correctly handles invalid or missing `taskId` values by showing a "Task Not Found" warning.
- [ ] Confirm that deep-linking works across all project phases where task implementation is active.

## 4. Run Automated Tests to Verify
- [ ] Execute the `DevsUriHandler` integration tests.
- [ ] Manually test the deep-linking functionality by opening a `vscode://google.gemini-devs/open-task?id=...` URI in a browser or from another application.

## 5. Update Documentation
- [ ] Document the custom URI scheme and its parameters in the project's README for external integration.
- [ ] Update the Phase 11 documentation to include the deep-linking capabilities.

## 6. Automated Verification
- [ ] Run a shell script that verifies the presence of the `onUri` activation event and the custom URI scheme registration in the `@devs/vscode` package.json.
- [ ] Check for the `DevsUriHandler` implementation in the `@devs/vscode` source code.
