# Task: Disconnection Overlay Accessibility & Reduced Motion Compliance (Sub-Epic: 98_Disconnection_Overlays)

## Covered Requirements
- [7_UI_UX_DESIGN-REQ-UI-DES-121], [6_UI_UX_ARCH-REQ-098]

## 1. Initial Test Written
- [ ] In `packages/webview/src/__tests__/DisconnectedOverlay.a11y.test.tsx`, write accessibility-focused tests using `axe-core` via `@axe-core/react` or `jest-axe` (or `vitest-axe`):
  - Render the `DisconnectedOverlay` in RECONNECTING state and run `axe()`. Assert zero accessibility violations.
  - Assert `aria-live="assertive"` is present on the status message element.
  - Assert `role="dialog"` and `aria-modal="true"` are present on the overlay container.
  - Assert `aria-label="Connection Lost"` is present.
  - Assert the spinner `<span>` has `aria-hidden="true"` (decorative — the text conveys the message).
  - Assert the overlay is the first focusable region in the DOM when active (focus trap is applied).
  - Assert that when the overlay closes (CONNECTED), focus is returned to the previously focused element.
- [ ] In `packages/webview/src/__tests__/DisconnectedOverlay.reducedMotion.test.tsx`, write reduced-motion tests:
  - Mock `window.matchMedia('(prefers-reduced-motion: reduce)')` to return `matches: true`.
  - Assert that when reduced motion is active, the spinner does NOT use `codicon-modifier-spin` (or the spin animation is suppressed via CSS class).
  - Assert that a static icon (e.g., `codicon-loading` without spin modifier) or a plain text indicator is rendered instead.
  - Mock `matchMedia` to return `matches: false` and assert the spinning animation is present.

## 2. Task Implementation
- [ ] Update `packages/webview/src/components/DisconnectedOverlay/DisconnectedOverlay.tsx`:
  - Import `usePrefersReducedMotion` from `@devs/ui-hooks` (create this hook if not already present — it wraps `window.matchMedia('(prefers-reduced-motion: reduce)')`).
  - When `prefersReducedMotion === true`, replace the spinning codicon with a static `codicon-loading` (no spin modifier) or a pulsing opacity class (`animate-pulse` at 1-second interval using CSS only, no JS).
  - Implement a focus trap:
    - On mount (when RECONNECTING), capture `document.activeElement` as `previousFocus`.
    - Move focus to the overlay dialog container via `containerRef.current?.focus()`.
    - On unmount (back to CONNECTED), call `previousFocus?.focus()`.
  - The overlay container must be focusable: add `tabIndex={-1}` to the dialog `<div>`.
  - Ensure the overlay does not trap Tab navigation in a loop — since no interactive elements exist inside, Tab should not cycle within the overlay (natural focus trap for an empty dialog).
- [ ] Create `packages/ui-hooks/src/usePrefersReducedMotion.ts` if it does not already exist:
  - Returns `boolean` by subscribing to `window.matchMedia('(prefers-reduced-motion: reduce)')` change events.
  - Returns `false` in SSR/non-browser environments.
  - Cleans up the media query listener on unmount.
- [ ] Export `usePrefersReducedMotion` from `packages/ui-hooks/src/index.ts`.

## 3. Code Review
- [ ] Verify the focus trap implementation correctly restores focus to `previousFocus` on close — critical for keyboard-only users.
- [ ] Confirm `aria-live="assertive"` (not `"polite"`) is used — disconnection is a critical interruption that must be announced immediately by screen readers.
- [ ] Verify the reduced motion path does not rely on JavaScript animation disabling — it MUST use a CSS-media-query-based class swap or Tailwind `motion-safe:` / `motion-reduce:` utilities where possible.
- [ ] Confirm `axe-core` integration is added to the test setup (not skipped or mocked away).
- [ ] Verify no focus is sent to elements outside the overlay while it is open.
- [ ] Confirm the `usePrefersReducedMotion` hook cleans up its event listener to prevent memory leaks.

## 4. Run Automated Tests to Verify
- [ ] Run `pnpm --filter @devs/webview test` and confirm all tests in `DisconnectedOverlay.a11y.test.tsx` and `DisconnectedOverlay.reducedMotion.test.tsx` pass.
- [ ] Run `pnpm --filter @devs/ui-hooks test` and confirm `usePrefersReducedMotion.test.ts` passes (add if not covered in prior tasks).
- [ ] Run `pnpm typecheck` and confirm zero TypeScript errors.

## 5. Update Documentation
- [ ] Update `packages/webview/src/components/DisconnectedOverlay/DisconnectedOverlay.agent.md` to add:
  - Accessibility contract: `role`, `aria-modal`, `aria-live`, `aria-label`, `tabIndex` values and their purposes.
  - Focus trap behavior: capture on open, restore on close.
  - Reduced motion behavior: spinner class switch, no JS animation when `prefers-reduced-motion: reduce`.
- [ ] Create `packages/ui-hooks/src/usePrefersReducedMotion.agent.md` documenting the hook's purpose, API, and cleanup contract.

## 6. Automated Verification
- [ ] Run `pnpm --filter @devs/webview test --reporter=json > /tmp/overlay-a11y-results.json` and assert exit code `0`.
- [ ] Run `node -e "const r = require('/tmp/overlay-a11y-results.json'); process.exit(r.numFailedTests > 0 ? 1 : 0)"` to independently verify zero failures.
- [ ] Run `grep -r 'aria-live' packages/webview/src/components/DisconnectedOverlay/` and assert the output contains `aria-live="assertive"` (not `"polite"`).
