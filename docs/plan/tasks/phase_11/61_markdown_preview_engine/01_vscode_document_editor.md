# Task: Implement VSCode Document Editor with Preview and Sync/Regenerate (Sub-Epic: 61_Markdown_Preview_Engine)

## Covered Requirements
- [1_PRD-REQ-INT-008]

## 1. Initial Test Written
- [ ] Create an integration-style unit test that mocks the VSCode Webview API and verifies that: (a) when a document text buffer changes the extension sends a `postMessage` with type `sync` and the full markdown payload to the preview webview, and (b) when the user invokes the "Regenerate" button/command the extension sends a `postMessage` with type `regenerate` and the preview updates. Place the test at `extensions/vscode/test/preview-editor.test.ts` and use Jest with a mocked `vscode.window.createWebviewPanel` and a stubbed `webview.postMessage` to assert message shapes and call counts.

## 2. Task Implementation
- [ ] Implement the extension-side editor+preview integration: add `devs.openMarkdownPreview` command and register a WebviewPanel that exposes `postMessage`/`onDidReceiveMessage` handlers, wire textDocument change events to send `sync` messages, implement a preview UI control that emits `regenerate`, and persist the "Sync & Regenerate" toggle in `webview.getState` / `webview.setState`.

## 3. Code Review
- [ ] Verify strict message schema types (TypeScript interfaces for `SyncMessage` and `RegenerateMessage`), ensure separation between extension host code and preview UI code, confirm CSP header is strict, and verify no un-sanitized HTML is posted to the webview.

## 4. Run Automated Tests to Verify
- [ ] Run unit tests: `yarn test extensions:vscode -- test/preview-editor.test.ts` (or `npm run test -- extensions/vscode test/preview-editor.test.ts`), assert mocked `postMessage` calls and state persistence pass.

## 5. Update Documentation
- [ ] Update `docs/vscode.md` (or `docs/usage/vscode-preview.md`) with the new command name, expected postMessage schema (`{type:'sync'|'regenerate', payload:{text:string, cursor:number}}`), and developer notes for adding new message types.

## 6. Automated Verification
- [ ] Add an automated integration test that launches a headless extension host (via `@vscode/test-electron`) to open a test workspace, open a markdown file, programmatically edit the document, and assert the preview webview receives `sync` and that invoking the preview's `Regenerate` control yields a `regenerate` message; fail the CI job if any assertion does not hold.
