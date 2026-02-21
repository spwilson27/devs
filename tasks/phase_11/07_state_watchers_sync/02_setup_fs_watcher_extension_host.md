# Task: Implement VSCode Extension Host File System Watcher for state.sqlite (Sub-Epic: 07_State_Watchers_Sync)

## Covered Requirements
- [6_UI_UX_ARCH-REQ-038]

## 1. Initial Test Written
- [ ] Mock the `vscode` module and verify that `vscode.workspace.createFileSystemWatcher` is called with a pattern targeting `.devs/state.sqlite`.
- [ ] Mock a file system change event and verify that a message is sent to the active webview panel via `webview.postMessage`.
- [ ] Test the debouncing logic to ensure that a burst of file changes only results in a single `postMessage` call within a 100ms window.

## 2. Task Implementation
- [ ] In the `@devs/vscode` extension host code, implement a `ProjectWatcher` class or update the `ProjectManager`.
- [ ] Use `vscode.workspace.createFileSystemWatcher(new vscode.RelativePattern(rootPath, '.devs/state.sqlite'))` to monitor the project's state file.
- [ ] Attach a listener to the `onDidChange` event of the watcher.
- [ ] Implement a debounced dispatcher that sends a `STATE_MODIFIED` message (type: `string`, payload: `{ type: 'FS_WATCHER_TRIGGER', timestamp: number }`) to the active webview panel.
- [ ] Ensure the watcher is properly disposed of when the extension is deactivated or the project is closed to prevent memory leaks.

## 3. Code Review
- [ ] Verify that the file watcher is scoped correctly to the project root and doesn't trigger for other workspaces.
- [ ] Check for appropriate handling of `onDidCreate` and `onDidDelete` events for the `state.sqlite` file.
- [ ] Ensure the `postMessage` payload is minimal to reduce IPC overhead.

## 4. Run Automated Tests to Verify
- [ ] Run the extension host unit tests using the VSCode test runner or a suitable framework (e.g., `vscode-test-extension`).

## 5. Update Documentation
- [ ] Update the extension architecture documentation to include the file watcher mechanism for real-time synchronization.

## 6. Automated Verification
- [ ] Use the VSCode Extension Development Host to manually trigger a change in the `state.sqlite` file (e.g., via `touch` or a small write) and verify that the "State Updated" indicator appears in the webview.
- [ ] Verify that the `vscode-extension` logs show the file change event being handled.
