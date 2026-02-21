# Task: DisconnectedOverlay React Component (Sub-Epic: 98_Disconnection_Overlays)

## Covered Requirements
- [7_UI_UX_DESIGN-REQ-UI-DES-121], [6_UI_UX_ARCH-REQ-098]

## 1. Initial Test Written
- [ ] In `packages/webview/src/__tests__/DisconnectedOverlay.test.tsx`, write unit tests using Vitest + React Testing Library:
  - Test that when `connectionState.status === 'CONNECTED'`, the `DisconnectedOverlay` renders `null` (nothing is mounted).
  - Test that when `connectionState.status === 'RECONNECTING'`, the overlay renders with:
    - `role="dialog"` and `aria-modal="true"` and `aria-label="Connection Lost"`.
    - A visible spinner element (`data-testid="reconnect-spinner"`).
    - The exact text `"Reconnecting to Orchestrator..."`.
    - The `data-testid="disconnected-overlay"` container applying a CSS class that triggers the backdrop blur.
  - Test that the overlay is rendered at `z-index` layer 400 (maps to `--devs-z-critical`) — assert the computed class includes the critical z-index token.
  - Test that the overlay covers the full viewport (assert `position: fixed`, `inset: 0`).
  - Test that `aria-live="assertive"` is set on the status text so screen readers announce the disconnection immediately.
  - Test that the component does NOT render any interactive/clickable elements while in RECONNECTING state (scanning `queryAllByRole` for buttons/links yields empty).
  - Snapshot test the overlay DOM structure to catch regressions.

## 2. Task Implementation
- [ ] Create `packages/webview/src/components/DisconnectedOverlay/DisconnectedOverlay.tsx`:
  - Accept `connectionState: ConnectionState` as a prop (imported from `@devs/ui-hooks`).
  - Return `null` when `connectionState.status !== 'RECONNECTING'`.
  - When RECONNECTING, render a `<div>` with:
    - `role="dialog"` `aria-modal="true"` `aria-label="Connection Lost"` `aria-live="assertive"`.
    - Tailwind classes: `fixed inset-0 z-[400] flex items-center justify-center`.
    - A backdrop layer: `<div className="absolute inset-0 bg-[var(--vscode-editor-background)] opacity-80 backdrop-blur-md" />` (uses VSCode token for background, never a hardcoded hex).
    - A centered card: `<div className="relative flex flex-col items-center gap-4 rounded p-8 bg-[var(--vscode-editorWidget-background)] border border-[var(--vscode-editorWidget-border)] shadow-md">`.
    - A spinner: `<span data-testid="reconnect-spinner" className="codicon codicon-loading codicon-modifier-spin text-[var(--vscode-progressBar-background)] text-4xl" aria-hidden="true" />`.
    - Status text: `<p className="text-[var(--vscode-foreground)] text-[13px] font-medium" aria-live="assertive">Reconnecting to Orchestrator...</p>`.
    - Optionally a dimmed attempt counter: `<span className="text-[var(--vscode-descriptionForeground)] text-[11px]">Attempt {connectionState.reconnectAttempt}</span>`.
  - Export as a named export.
- [ ] Create `packages/webview/src/components/DisconnectedOverlay/index.ts` re-exporting the component.
- [ ] Wire the overlay into the root webview layout in `packages/webview/src/App.tsx`:
  - Import `useUiStore` from `@devs/ui-hooks` to select `connectionState`.
  - Render `<DisconnectedOverlay connectionState={connectionState} />` as the **last child** of the root layout (so it renders above all other content at z-400).
- [ ] Ensure the Tailwind config in `packages/webview/tailwind.config.ts` has `z-[400]` whitelisted or uses the `safelist` pattern for the critical layer class.

## 3. Code Review
- [ ] Verify the overlay uses only `var(--vscode-*)` CSS custom properties — no hardcoded colors or hex values anywhere in the component.
- [ ] Confirm `codicon-modifier-spin` is used for the spinner (not a custom CSS animation), consistent with `[6_UI_UX_ARCH-REQ-073]` Codicons usage requirement.
- [ ] Verify the `z-[400]` class maps to the Critical z-index tier defined in `[7_UI_UX_DESIGN-REQ-UI-DES-049-Z4]`.
- [ ] Confirm `backdrop-blur-md` is hardware-accelerated and applies `will-change: backdrop-filter` or equivalent GPU promotion to avoid layout thrash.
- [ ] Verify there are zero interactive elements (no `<button>`, `<a>`, `<input>`) rendered in the overlay during RECONNECTING state, enforcing the interaction-disabled requirement.
- [ ] Confirm the component is memoized with `React.memo` to prevent unnecessary re-renders while connection state hasn't changed.
- [ ] Confirm the snapshot test is committed to catch future regressions.

## 4. Run Automated Tests to Verify
- [ ] Run `pnpm --filter @devs/webview test` and confirm all tests in `DisconnectedOverlay.test.tsx` pass with zero failures.
- [ ] Run `pnpm --filter @devs/webview build` and confirm the webview bundle builds successfully with no TypeScript or Tailwind errors.
- [ ] Run `pnpm typecheck` from the repo root and confirm zero TypeScript errors introduced.

## 5. Update Documentation
- [ ] Create `packages/webview/src/components/DisconnectedOverlay/DisconnectedOverlay.agent.md` documenting:
  - Component purpose and when it renders.
  - Props contract (`ConnectionState` type reference).
  - Z-index tier used and why (critical layer 400).
  - VSCode token list used (background, widget background, foreground, description foreground, progress bar).
  - Accessibility attributes used (`role`, `aria-modal`, `aria-live`, `aria-label`).
  - Note that no interactive elements may be added while in RECONNECTING state.
- [ ] Update `packages/webview/src/components/README.md` (or component index) to list `DisconnectedOverlay` and its requirement coverage.

## 6. Automated Verification
- [ ] Run `pnpm --filter @devs/webview test --reporter=json > /tmp/disconnected-overlay-results.json` and assert exit code is `0`.
- [ ] Run `node -e "const r = require('/tmp/disconnected-overlay-results.json'); process.exit(r.numFailedTests > 0 ? 1 : 0)"` to independently confirm zero failures.
- [ ] Run `grep -r 'hardcoded\|#[0-9a-fA-F]\{3,6\}\|rgb(' packages/webview/src/components/DisconnectedOverlay/` and assert no matches (no hardcoded colors).
