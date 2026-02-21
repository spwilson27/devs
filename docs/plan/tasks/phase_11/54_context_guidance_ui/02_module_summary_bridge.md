# Task: Add module summary bridge (extension host ↔ webview) (Sub-Epic: 54_Context_Guidance_UI)

## Covered Requirements
- [7_UI_UX_DESIGN-REQ-UI-DES-130], [7_UI_UX_DESIGN-REQ-UI-DES-130-1]

## 1. Initial Test Written
- [ ] Add unit tests for the bridge at `packages/vscode/src/extension/__tests__/moduleSummaryBridge.test.ts` verifying:
  - When `handleMessage({ type: 'getModuleSummary', path })` is invoked on the extension host side it calls `parseAgentDocFromFile(path)` and returns a structured message `{ type: 'moduleSummaryResponse', path, summary }` to the webview via `panel.webview.postMessage`.
  - Error path: missing file yields `{ type: 'moduleSummaryResponse', path, error: 'not_found' }` and does not crash the host.
  - Caching: repeated requests for the same path call the parser only once (mock fs and parser to assert call counts).

## 2. Task Implementation
- [ ] Implement the bridge handler in the extension host (suggested file `packages/vscode/src/extension/moduleSummaryBridge.ts`):
  - Expose a handler for `getModuleSummary` messages received from the webview (via `panel.webview.onDidReceiveMessage`).
  - Call `parseAgentDocFromFile(path)` (implemented in Task 01) and `postMessage` back a `moduleSummaryResponse` containing `{ intent, hooks, testStrategy }`.
  - Implement an in-memory LRU cache keyed by absolute file path to debounce duplicate requests for the same file within a short TTL (configurable, default 30s).
  - Ensure errors are sanitized and not leaked to the webview (return an error code/message only).

## 3. Code Review
- [ ] Verify message contract stability (use small shared TypeScript types/interfaces), ensure caching does not leak memory (bounded LRU), and ensure postMessage payloads are minimal (no giant doc bodies beyond required summary).

## 4. Run Automated Tests to Verify
- [ ] Run: `npx vitest packages/vscode/src/extension/__tests__/moduleSummaryBridge.test.ts` and verify success; include an integration smoke test that simulates a webview message and asserts the webview callback receives the `moduleSummaryResponse`.

## 5. Update Documentation
- [ ] Document the message contract in `packages/vscode/src/extension/README.md` and add a section to `packages/vscode/webview/README.md` showing how the webview should request a module summary and handle `moduleSummaryResponse`.

## 6. Automated Verification
- [ ] Add a small script `scripts/verify-module-summary-bridge.js` that mocks the webview/extension message exchange and asserts that the bridge returns expected `moduleSummaryResponse` objects for a set of fixture paths; CI should run this script and fail on non-zero exit.
