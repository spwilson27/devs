# Task: State Recovery Glitch/Desaturation Animation (Sub-Epic: 13_Animation Performance and Guardrails)

## Covered Requirements
- [7_UI_UX_DESIGN-REQ-UI-DES-058], [7_UI_UX_DESIGN-REQ-UI-DES-058-1]

## 1. Initial Test Written
- [ ] In `packages/webview-ui/src/__tests__/animations/`, create `rewind-glitch-animation.test.tsx`.
- [ ] Write a unit test that renders the top-level `AppShell` component, dispatches a `{ type: 'REWIND_INITIATED' }` action to the Zustand store, and asserts within 50ms that the root `<div data-testid="app-shell-root">` has a CSS `filter` style value of `grayscale(1) brightness(0.8)`.
- [ ] Write a test asserting that exactly 600ms after `REWIND_INITIATED`, the filter is removed (i.e., `filter` is `none` or empty string), using Vitest fake timers (`vi.useFakeTimers()` + `vi.advanceTimersByTime(600)`).
- [ ] Write a test asserting that if `REWIND_INITIATED` fires while a previous glitch animation is still running, the timer resets (debounce/restart behavior).
- [ ] Write a test that when `useReducedMotion()` returns `true`, no CSS filter is applied (the rewind state is communicated via a banner element only).

## 2. Task Implementation
- [ ] Add a `rewindInProgress: boolean` field to the global UI Zustand store slice in `packages/webview-ui/src/store/uiSlice.ts`.
  - Add actions `setRewindInProgress(value: boolean)`.
- [ ] In `packages/webview-ui/src/store/uiSlice.ts` or a dedicated middleware, subscribe to the `REWIND_INITIATED` event from the `EventBus` (from Phase 12 Task 01) and dispatch `setRewindInProgress(true)`, then automatically dispatch `setRewindInProgress(false)` after 600ms via `setTimeout`.
- [ ] In `packages/webview-ui/src/components/AppShell/AppShell.tsx`:
  - Read `rewindInProgress` from the Zustand store.
  - Also read `isReducedMotion` from `useReducedMotion()`.
  - Apply inline style `{ filter: 'grayscale(1) brightness(0.8)', transition: 'filter 150ms ease-out' }` to the root wrapper `<div>` when `rewindInProgress && !isReducedMotion`.
  - When `isReducedMotion` is `true` and `rewindInProgress` is `true`, render a `<div data-testid="rewind-reduced-motion-banner">` overlay with the text "Restoring state..." instead.
- [ ] Define the 600ms duration as a named constant `REWIND_GLITCH_DURATION_MS = 600` exported from `packages/webview-ui/src/constants/animation.ts` (create if absent).

## 3. Code Review
- [ ] Verify the `setTimeout` handle is stored and cleared (`clearTimeout`) if the component unmounts mid-animation to prevent setting state on an unmounted component.
- [ ] Confirm the `transition: 'filter 150ms ease-out'` ensures a smooth fade-out at the end of the 600ms window rather than an abrupt snap.
- [ ] Ensure the `filter` style is applied to the **root shell wrapper only** and not cascaded into individual panels (which may have their own `filter` applied for other reasons) by checking specificity.
- [ ] Verify the `REWIND_GLITCH_DURATION_MS` constant is referenced in both the store middleware and any related tests—no magic numbers.

## 4. Run Automated Tests to Verify
- [ ] Run `pnpm --filter @devs/webview-ui test --reporter=verbose packages/webview-ui/src/__tests__/animations/rewind-glitch-animation.test.tsx` and confirm all assertions pass.

## 5. Update Documentation
- [ ] Add a `## Rewind & State Recovery` section to `packages/webview-ui/AGENT.md` documenting the `REWIND_INITIATED` event contract, the 600ms glitch duration constant, and the reduced-motion fallback banner.
- [ ] Update `docs/architecture/animation-system.md` with the rewind animation sequence diagram.

## 6. Automated Verification
- [ ] Run `pnpm --filter @devs/webview-ui test:ci` and verify exit code is `0`.
- [ ] Run the Playwright E2E test `rewind-glitch.spec.ts` (create if absent) that triggers a rewind via the CLI command `devs rewind --task <id>`, captures a screenshot within 100ms, and asserts via pixel-level grayscale analysis (or `page.locator('[data-testid="app-shell-root"]').evaluate(el => getComputedStyle(el).filter)`) that the filter is active; then waits 700ms and asserts the filter is cleared, exiting non-zero on failure.
