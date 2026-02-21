# Task: Implement RCA Report Modal Overlay (Sub-Epic: 97_Diagnostics_RCA_Metrics)

## Covered Requirements
- [7_UI_UX_DESIGN-REQ-UI-DES-120-2]

## 1. Initial Test Written
- [ ] In `packages/vscode/src/webview/components/__tests__/RcaModal.test.tsx`, write unit tests for the `RcaModal` React component:
  - Test that the modal is **not rendered** when `isOpen` prop is `false`.
  - Test that the modal **is rendered** when `isOpen` prop is `true` and `rcaReport` prop is populated.
  - Test that the modal renders a "Failing Strategy" section displaying `rcaReport.failingStrategy` text.
  - Test that the modal renders a "Proposed Pivot" section displaying `rcaReport.proposedPivot` text.
  - Test that clicking the "Accept Pivot" button calls an `onAccept` callback.
  - Test that clicking the "Dismiss" button (or pressing `Escape`) calls an `onDismiss` callback.
  - Test that the modal has `role="dialog"`, `aria-modal="true"`, and `aria-labelledby` pointing to its title element.
  - Test that focus is trapped inside the modal when open (focus must not escape to the background).
  - Test that the modal is rendered at z-index level 300 (Modal tier) per the z-index specification.
- [ ] In `packages/vscode/src/webview/store/__tests__/uiStore.rca.test.ts`, write unit tests:
  - Test that `uiStore` has `rcaModal: { isOpen: false, report: null }` as initial state.
  - Test that `openRcaModal(report: RcaReport)` sets `isOpen: true` and populates `report`.
  - Test that `closeRcaModal()` sets `isOpen: false` and clears `report` to `null`.
- [ ] In `packages/vscode/src/webview/__tests__/RcaModal.integration.test.tsx`, write an integration test:
  - Simulate the Zustand store receiving a `STATE_CHANGE` message from the extension host containing a `glitchState` payload with `rcaReport` populated.
  - Assert that `openRcaModal` is called and the `RcaModal` is rendered in the DOM.
  - Assert that after `closeRcaModal()` is dispatched, the modal is unmounted from the DOM.

## 2. Task Implementation
- [ ] Define the `RcaReport` TypeScript interface in `packages/vscode/src/webview/types/diagnostics.ts`:
  ```ts
  export interface RcaReport {
    taskId: string;
    detectedAt: string;         // ISO timestamp
    failingStrategy: string;    // Markdown string describing the stuck loop
    proposedPivot: string;      // Markdown string describing the recommended action
    entropyScore: number;       // Numeric score (e.g., loop repeat count)
    affectedHashes: string[];   // The repeating hash values that triggered detection
  }
  ```
- [ ] Add RCA modal state and actions to the Zustand UI store in `packages/vscode/src/webview/store/uiStore.ts`:
  - `rcaModal: { isOpen: boolean; report: RcaReport | null }` initialized to `{ isOpen: false, report: null }`.
  - `openRcaModal(report: RcaReport): void` action.
  - `closeRcaModal(): void` action.
- [ ] Create `packages/vscode/src/webview/components/RcaModal.tsx`:
  - Accept props: `{ isOpen: boolean; rcaReport: RcaReport | null; onAccept: () => void; onDismiss: () => void }`.
  - When `!isOpen` or `!rcaReport`, return `null`.
  - Render a full-screen backdrop overlay using `var(--vscode-editor-background)` at 80% opacity with a blur effect.
  - Inside, render a modal card styled with `border-radius: 4px`, `border: 1px solid var(--vscode-panel-border)`, and `box-shadow` per `shadow-md` spec.
  - Apply `z-index: 300` (Modal tier per `[7_UI_UX_DESIGN-REQ-UI-DES-049-Z3]`).
  - Include a header: "⚠ Root Cause Analysis" with the `taskId` subtitle in monospace.
  - Render "Failing Strategy" section: label in bold system font + body content rendered via `react-markdown` with `remark-gfm`.
  - Render "Proposed Pivot" section: label in bold system font + body content rendered via `react-markdown`.
  - Render `entropyScore` as a numeric badge and `affectedHashes` as a collapsed `<details>` element.
  - Render two action buttons: "Accept Pivot" (primary, calls `onAccept`) and "Dismiss" (ghost, calls `onDismiss`).
  - Implement focus trap: on mount, move focus to the modal container; on `keydown` Tab, cycle focus within modal children; on `Escape` keydown, call `onDismiss`.
  - Add `role="dialog"`, `aria-modal="true"`, `aria-labelledby="rca-modal-title"` to the modal card root.
- [ ] Wire the `RcaModal` into `packages/vscode/src/webview/App.tsx`:
  - Subscribe to `uiStore` `rcaModal` slice via selector.
  - Render `<RcaModal isOpen={...} rcaReport={...} onAccept={handleAccept} onDismiss={closeRcaModal} />` at the root level (outside any view router, so it can overlay any view).
  - In `handleAccept`: call `closeRcaModal()`, then dispatch an MCP tool call `{ tool: 'accept_pivot', taskId: report.taskId }` via the extension message bus.
- [ ] Update the extension host message handler in `packages/vscode/src/extension/messageHandler.ts`:
  - When a `STATE_CHANGE` event is received with a `glitchState.rcaReport` payload, post a `OPEN_RCA_MODAL` message to the webview with the `RcaReport` object.
- [ ] Update the webview message listener in `packages/vscode/src/webview/bridge/messageListener.ts`:
  - Handle the `OPEN_RCA_MODAL` message type by calling `uiStore.getState().openRcaModal(payload.report)`.

## 3. Code Review
- [ ] Verify the modal uses only `--vscode-*` CSS custom properties; no hardcoded color values.
- [ ] Verify `role="dialog"`, `aria-modal="true"`, and `aria-labelledby` are correctly set and point to an element with a matching `id`.
- [ ] Verify focus trap is implemented without a third-party library (use raw `querySelectorAll` on focusable elements) to minimize bundle size per `[6_UI_UX_ARCH-REQ-007]`.
- [ ] Verify `react-markdown` is already a shared dependency in `packages/vscode/package.json` before adding it (avoid duplicate installs).
- [ ] Verify the modal is rendered at the React tree root (inside `App.tsx`) and not inside a routed view, ensuring it can overlay any screen.
- [ ] Verify `closeRcaModal` is called on both "Dismiss" click and `Escape` key to ensure the modal is always closeable.
- [ ] Verify the `z-index: 300` value aligns with `[7_UI_UX_DESIGN-REQ-UI-DES-049-Z3]`.

## 4. Run Automated Tests to Verify
- [ ] Run `pnpm --filter @devs/vscode test -- --testPathPattern="RcaModal|uiStore.rca"` and confirm all tests pass with zero failures.
- [ ] Run `pnpm --filter @devs/vscode build` and confirm no TypeScript compilation errors.

## 5. Update Documentation
- [ ] Update `docs/ui-architecture.md` with a section: "RCA Modal — Triggered by `glitchState.rcaReport` payload from the extension host. Renders a full-screen modal overlay with failing strategy and proposed pivot. Accept dispatches `accept_pivot` MCP tool call. Requirement: `[7_UI_UX_DESIGN-REQ-UI-DES-120-2]`."
- [ ] Add the `RcaReport` interface to `docs/types-reference.md` (or equivalent agent memory file).
- [ ] Add an entry to `CHANGELOG.md` under Phase 11: "feat(vscode): Implement RCA Report modal overlay for glitch state diagnostics".

## 6. Automated Verification
- [ ] Run `pnpm --filter @devs/vscode test -- --testPathPattern="RcaModal|uiStore.rca" --json --outputFile=/tmp/rca_test_results.json` and assert `numFailedTests === 0` in the JSON output.
- [ ] Run `grep -n "z-index" packages/vscode/src/webview/components/RcaModal.tsx` and assert the value is `300`.
- [ ] Run `grep -n 'role="dialog"' packages/vscode/src/webview/components/RcaModal.tsx` and assert at least one match.
- [ ] Run `grep -rn "#[0-9a-fA-F]\{3,6\}\|rgb(" packages/vscode/src/webview/components/RcaModal.tsx` and assert no matches (no hardcoded colors).
