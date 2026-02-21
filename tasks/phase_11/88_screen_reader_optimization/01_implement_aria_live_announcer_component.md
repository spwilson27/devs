# Task: Implement AriaLiveAnnouncer Component (Sub-Epic: 88_Screen_Reader_Optimization)

## Covered Requirements
- [7_UI_UX_DESIGN-REQ-UI-DES-084-3], [7_UI_UX_DESIGN-REQ-UI-DES-140]

## 1. Initial Test Written

- [ ] In `packages/webview-ui/src/components/accessibility/__tests__/AriaLiveAnnouncer.test.tsx`, write unit tests for a new `AriaLiveAnnouncer` React component:
  - Test that the component renders a visually-hidden `<div>` with `aria-live="polite"` and `aria-atomic="false"` for non-critical agentic thought events.
  - Test that the component renders a second visually-hidden `<div>` with `aria-live="assertive"` and `aria-atomic="true"` for critical intervention/failure events.
  - Test that calling `announce(message, 'polite')` sets the text content of the polite region within 150ms (use `jest.useFakeTimers` and `act`).
  - Test that calling `announce(message, 'assertive')` immediately sets the text content of the assertive region.
  - Test that the assertive region is cleared after 5000ms to prevent stale announcements (use `jest.advanceTimersByTime`).
  - Test that the polite region is cleared after 3000ms.
  - Test that the component does NOT disrupt focus by ensuring `tabIndex` is `-1` on both regions.
  - Test that announcing a new polite message while one is pending replaces the queued message (debounce behavior).
  - Write an integration test (using `@testing-library/react`) that renders the `AriaLiveAnnouncer` and verifies it is reachable by assistive technology queries (`getByRole('status')` for polite, `getByRole('alert')` for assertive).

## 2. Task Implementation

- [ ] Create the directory `packages/webview-ui/src/components/accessibility/`.
- [ ] Create `packages/webview-ui/src/components/accessibility/AriaLiveAnnouncer.tsx`:
  - Define a singleton React context `AriaLiveContext` that exposes an `announce(message: string, priority: 'polite' | 'assertive') => void` function.
  - The component renders two visually-hidden `<div>` elements positioned off-screen using a CSS class (e.g., `sr-only` via Tailwind: `absolute -left-[9999px] w-px h-px overflow-hidden`). Do NOT use `display: none` or `visibility: hidden` as these hide content from screen readers.
  - The `polite` region: `role="status"`, `aria-live="polite"`, `aria-atomic="false"`.
  - The `assertive` region: `role="alert"`, `aria-live="assertive"`, `aria-atomic="true"`.
  - Use `useRef` to hold both region DOM references. Use `setTimeout` to write the message to the DOM ref's `textContent` (not React state) to guarantee a DOM mutation event is fired for the screen reader even when message content is identical.
  - Implement a debounce of 100ms on polite announcements to batch rapid sequential thought events.
  - Implement auto-clear: polite regions clear after 3000ms; assertive regions clear after 5000ms.
  - Export a `useAriaLive()` hook that consumes the `AriaLiveContext` to allow any component to trigger announcements.
- [ ] Create `packages/webview-ui/src/components/accessibility/index.ts` to re-export `AriaLiveAnnouncer`, `AriaLiveContext`, and `useAriaLive`.
- [ ] Wrap the top-level `<App>` component in `packages/webview-ui/src/App.tsx` with `<AriaLiveAnnouncer>` so the context is available to all views.
- [ ] Create a CSS utility class `.sr-only` in `packages/webview-ui/src/styles/accessibility.css` if Tailwind's built-in `sr-only` class is not available in Shadow DOM scope, ensuring it visually hides elements while keeping them accessible.

## 3. Code Review

- [ ] Verify the two `aria-live` regions use `role="status"` (polite) and `role="alert"` (assertive) for redundancy and cross-browser AT compatibility.
- [ ] Confirm that DOM manipulation is done via `ref.current.textContent = ''` (clear) then `ref.current.textContent = message` (set) on a timer tick, NOT via React state or `innerHTML`, to reliably trigger screen reader re-reads.
- [ ] Verify the `sr-only` CSS class does NOT use `display: none`, `visibility: hidden`, or `opacity: 0`, which suppress AT announcements.
- [ ] Verify the singleton pattern means only one pair of announcement divs exists in the DOM at all times.
- [ ] Confirm that the `announce` function is stable (memoized with `useCallback`) to prevent unnecessary re-renders of consuming components.
- [ ] Verify no hardcoded colors or theme values are present; the component has no visual output.
- [ ] Confirm the component is covered by the AOD density rule: a `.agent.md` file must exist alongside it.

## 4. Run Automated Tests to Verify

- [ ] Run `pnpm --filter @devs/webview-ui test -- --testPathPattern="AriaLiveAnnouncer"` and confirm all tests pass with zero failures.
- [ ] Run the full webview test suite: `pnpm --filter @devs/webview-ui test` to check for regressions.

## 5. Update Documentation

- [ ] Create `packages/webview-ui/src/components/accessibility/AriaLiveAnnouncer.agent.md` documenting:
  - The purpose: singleton ARIA live announcement service for the devs webview.
  - The two region types: polite (thoughts) and assertive (interventions/failures).
  - The `useAriaLive()` hook API: `announce(message, priority)`.
  - Clear timing: polite 3000ms, assertive 5000ms.
  - Debounce timing: 100ms on polite announcements.
  - Where it is mounted: root `<App>` wrapper.
- [ ] Update `packages/webview-ui/src/components/accessibility/index.ts` exports if new symbols are added.
- [ ] Add an entry to the Phase 11 accessibility architecture notes in `docs/phase_11_accessibility.md` (create if absent) noting the AriaLiveAnnouncer pattern.

## 6. Automated Verification

- [ ] Run `pnpm --filter @devs/webview-ui test -- --coverage --testPathPattern="AriaLiveAnnouncer"` and confirm branch coverage ≥ 90% for `AriaLiveAnnouncer.tsx`.
- [ ] Run `pnpm --filter @devs/webview-ui build` and confirm the bundle compiles without TypeScript errors.
- [ ] Verify the `.agent.md` file exists: `test -f packages/webview-ui/src/components/accessibility/AriaLiveAnnouncer.agent.md && echo "AOD OK"`.
