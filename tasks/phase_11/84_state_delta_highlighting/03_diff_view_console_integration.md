# Task: Integrate DiffView into CONSOLE View and Wire useStateDelta Hook (Sub-Epic: 84_State_Delta_Highlighting)

## Covered Requirements
- [6_UI_UX_ARCH-REQ-086]

## 1. Initial Test Written
- [ ] In `packages/webview/src/views/__tests__/ConsoleView.test.tsx`, add integration tests:
  - Test: when the active `turnId` is set in the Zustand store (`useUIStore.getState().activeTurnId`), a `DiffView` panel is rendered within the `ConsoleView`.
  - Test: the `DiffView` panel is titled "State Delta" and renders with `data-testid="state-delta-panel"`.
  - Test: when `activeTurnId` is `null`, the `DiffView` panel is not rendered (returns `null` for that section).
  - Test: the `DiffView` panel is collapsible — a "State Delta ▾" toggle button exists and is keyboard-focusable (`tabIndex={0}`).
  - Test: `useStateDelta` is called with the correct `activeTurnId` from the store (mock the hook and assert it receives the right argument).
  - Test: when `useStateDelta` returns `isLoading: true`, the skeleton is rendered inside the panel.
  - Test: when `useStateDelta` returns `error: "..."`, an error message is rendered inside the panel.
- [ ] In `packages/webview/src/views/__tests__/ConsoleView.layout.test.tsx`, add layout tests:
  - Test: the "State Delta" panel is rendered below the agent console log and above any bottom toolbar.
  - Test: the panel occupies the full width of the `ConsoleView` container.

## 2. Task Implementation
- [ ] In `packages/webview/src/views/ConsoleView.tsx`:
  - Import `useStateDelta` from `@devs/ui-hooks`.
  - Import `DiffView` from `../components/DiffView/DiffView`.
  - Read `activeTurnId` from the Zustand UI store via `useUIStore(state => state.activeTurnId)` (selector-based, per `[6_UI_UX_ARCH-REQ-045]`).
  - Call `const { files, isLoading, error } = useStateDelta(activeTurnId)`.
  - Render a collapsible `<section data-testid="state-delta-panel">` below the existing log terminal section, conditionally only when `activeTurnId !== null`:
    ```tsx
    {activeTurnId && (
      <section data-testid="state-delta-panel" className="console-section">
        <button className="console-section__toggle" aria-expanded={isDeltaOpen} onClick={() => setIsDeltaOpen(v => !v)}>
          <i className="codicon codicon-diff" aria-hidden="true" /> State Delta
        </button>
        {isDeltaOpen && <DiffView files={files} isLoading={isLoading} error={error} />}
      </section>
    )}
    ```
  - Add local `useState<boolean>(true)` for `isDeltaOpen` (default open).
- [ ] Add `activeTurnId: string | null` to the Zustand UI store slice in `packages/webview/src/store/uiStore.ts` if not already present:
  - Default value: `null`.
  - Action: `setActiveTurnId(turnId: string | null): void`.
- [ ] Ensure the extension host posts a `SET_ACTIVE_TURN` message when a new implementation turn begins, which the Webview message handler routes to `setActiveTurnId`.
  - Add handler case `SET_ACTIVE_TURN` in `packages/webview/src/messaging/messageHandler.ts`.
- [ ] Add CSS for `.console-section` and `.console-section__toggle` in `packages/webview/src/views/consoleView.css`:
  - `.console-section` border-top: `1px solid var(--vscode-panel-border)`.
  - `.console-section__toggle`: display flex, align-items center, gap 4px, font-size `var(--devs-font-metadata)` (11px), color `var(--vscode-descriptionForeground)`, background none, border none, cursor pointer, padding `4px 8px`, width 100%.
  - `.console-section__toggle:focus-visible`: `outline: 2px solid var(--vscode-focusBorder)` (per `[7_UI_UX_DESIGN-REQ-UI-DES-084-2]`).

## 3. Code Review
- [ ] Verify the `useStateDelta` call is guarded so it is only invoked when `activeTurnId` is non-null (no spurious network requests with undefined `turnId`).
- [ ] Verify the selector `useUIStore(state => state.activeTurnId)` is used (not full store subscription) to prevent unnecessary re-renders of `ConsoleView` on unrelated state changes (per `[6_UI_UX_ARCH-REQ-045]`).
- [ ] Verify the `.console-section__toggle` button has `aria-expanded` properly toggled for screen reader support (per `[7_UI_UX_DESIGN-REQ-UI-DES-084-3]`).
- [ ] Verify no hardcoded colors appear in `consoleView.css` — all values use `var(--vscode-*)` or `var(--devs-*)` tokens.
- [ ] Verify the `SET_ACTIVE_TURN` message handler is covered in the existing message handler test suite.

## 4. Run Automated Tests to Verify
- [ ] Run `pnpm --filter @devs/webview test -- --testPathPattern=ConsoleView` — all tests pass including new integration tests.
- [ ] Run `pnpm --filter @devs/webview test -- --testPathPattern=messageHandler` — the `SET_ACTIVE_TURN` handler test passes.
- [ ] Run `pnpm --filter @devs/webview build` — build succeeds with no errors.
- [ ] Run `pnpm --filter @devs/webview tsc --noEmit` — zero TypeScript errors.

## 5. Update Documentation
- [ ] Update `packages/webview/AGENTS.md` section "ConsoleView" to document:
  - The `state-delta-panel` section, its activation condition (`activeTurnId` non-null), and its collapse behavior.
  - The `SET_ACTIVE_TURN` message protocol.
- [ ] Update `packages/webview/AGENTS.md` section "Zustand Store" to document the `activeTurnId` field and `setActiveTurnId` action.

## 6. Automated Verification
- [ ] Run `pnpm --filter @devs/webview test --coverage -- --testPathPattern=ConsoleView` and confirm ≥ 85% line coverage for the modified `ConsoleView.tsx`.
- [ ] Run `pnpm test` from repo root — full test suite passes without regressions.
- [ ] Grep `consoleView.css` for `#[0-9a-fA-F]` — confirm zero matches.
