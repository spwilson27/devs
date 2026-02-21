# Task: Integrate hover behavior in src view and wire caching (Sub-Epic: 54_Context_Guidance_UI)

## Covered Requirements
- [7_UI_UX_DESIGN-REQ-UI-DES-130], [7_UI_UX_DESIGN-REQ-UI-DES-130-1]

## 1. Initial Test Written
- [ ] Add an integration test at `packages/webview/src/components/FileList/__tests__/FileList.hover.integration.test.tsx` using `@testing-library/react` + `msw` or a mocked `acquireVsCodeApi` bridge:
  - Render the `FileList` (or the minimal file-row component) with a mocked `panel`/`vscode` message bridge.
  - Simulate `hover` (fireEvent.mouseEnter) on a file-name element; assert that a `getModuleSummary` message is sent (or fetch is called) and that `ModuleHover` appears with the returned summary.
  - Assert caching behavior: second hover on the same file within TTL does not trigger a second bridge call (spy/mocks assert call count = 1).
  - Assert cancellation: quickly move mouse off before debounce duration and assert no bridge call is made.

## 2. Task Implementation
- [ ] In `packages/webview/src/components/FileList/FileRow.tsx` (or the component responsible for displaying file names):
  - Add `onMouseEnter` handler with a short debounce (100ms) that requests a module summary from the webview bridge: `vscode.postMessage({ type: 'getModuleSummary', path })`.
  - On `onMouseLeave` cancel any pending request if not completed; if completed, allow the hover to display and hide on `mouseleave`.
  - Use a simple in-memory UI cache (Zustand or a module-level Map) keyed by file path to store `{ summary, fetchedAt }`. On request, check cache TTL (default 30s) before sending bridge message.
  - When response arrives, set cached value and set `ModuleHover.visible = true` anchored to the file row bounding rect; on `mouseleave` hide the hover.
  - Ensure the UI does not block the main thread (lightweight ops only) and that response sizes are small.

## 3. Code Review
- [ ] Verify debounce correctness, cancellation on mouseleave, cache TTL behavior, and that anchor positioning uses `getBoundingClientRect()` safely; confirm no memory leak by ensuring cache size is bounded (e.g., LRU of 200 entries) and entries expire.

## 4. Run Automated Tests to Verify
- [ ] Run: `npx vitest packages/webview/src/components/FileList/__tests__/FileList.hover.integration.test.tsx` and ensure all assertions pass including caching call count, cancellation, and rendering assertions.

## 5. Update Documentation
- [ ] Update `packages/webview/README.md` describing the hover UX contract: debounce 100ms, TTL 30s, anchor behavior, keyboard fallback (focus/enter to open), and message contract used with the extension host.

## 6. Automated Verification
- [ ] Add a CI-level integration script `scripts/verify-module-hover-integration.js` that runs the vitest integration test, asserts `numFailedTests === 0`, and prints a short trace of any failed interactions.
