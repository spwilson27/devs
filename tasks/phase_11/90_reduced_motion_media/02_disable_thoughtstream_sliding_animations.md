# Task: Disable ThoughtStream Sliding Animations Under Reduced Motion (Sub-Epic: 90_Reduced_Motion_Media)

## Covered Requirements
- [7_UI_UX_DESIGN-REQ-UI-DES-085-1]

## 1. Initial Test Written

- [ ] In `packages/webview-ui/src/components/ThoughtStreamer/__tests__/ThoughtStreamer.reducedMotion.test.tsx`, write the following tests using `@testing-library/react`:
  - **Setup:** Before each test, use `vi.spyOn(window, 'matchMedia')` (or the Jest equivalent) to mock `(prefers-reduced-motion: reduce)` as either `true` or `false`.
  - Test 1 — **Sliding animation present (motion allowed):** With `prefersReducedMotion = false`, render `<ThoughtStreamer>` and add a new thought entry. Assert that the newly rendered thought element has a CSS class (e.g., `thought-enter-active`) that corresponds to the slide-in transition, and that `getComputedStyle(el).transition` is non-empty (or that the class is applied).
  - Test 2 — **Sliding animation absent (reduced motion):** With `prefersReducedMotion = true`, render `<ThoughtStreamer>` and add a new thought entry. Assert that the thought element does **not** have the slide-in class (`thought-enter-active` or equivalent) and instead has a static-display class (e.g., `thought-no-motion`).
  - Test 3 — **Dynamic toggle:** Start with `prefersReducedMotion = false`, add a thought, then simulate the OS setting changing to `prefersReducedMotion = true` (fire a `change` event on the mocked `matchMedia`). Add a second thought. Assert the first thought used the slide class and the second thought used the no-motion class.
  - Test 4 — **Snapshot:** Capture a React Testing Library snapshot of `<ThoughtStreamer>` in reduced-motion mode to lock the rendered DOM structure.

## 2. Task Implementation

- [ ] Open `packages/webview-ui/src/components/ThoughtStreamer/ThoughtStreamer.tsx`.
- [ ] Import `useReducedMotion` from `../../hooks` and call it at the top of the component: `const reducedMotion = useReducedMotion();`
- [ ] Locate the CSS Transition Group (or Framer Motion / custom CSS animation) responsible for the sliding entry/exit of new thought lines. This is expected to be a component like `<CSSTransition classNames="thought" ...>` or a Framer Motion `<motion.div animate={{ x: ... }}>` wrapper around each thought entry.
- [ ] Conditionally apply the animation:
  - If using **CSS Transitions / CSSTransitionGroup**: pass `classNames={reducedMotion ? 'thought-no-motion' : 'thought'}` and set `timeout={reducedMotion ? 0 : THOUGHT_TRANSITION_MS}` on the `<CSSTransition>` element.
  - If using **Framer Motion**: pass `transition={{ duration: reducedMotion ? 0 : THOUGHT_TRANSITION_S }}` and set `initial={reducedMotion ? false : { x: -20, opacity: 0 }}` on the `<motion.div>`.
- [ ] Add the following CSS rules to `packages/webview-ui/src/components/ThoughtStreamer/ThoughtStreamer.module.css`:
  ```css
  /* No-motion entry: instant display, no transform */
  .thought-no-motion-enter,
  .thought-no-motion-enter-active,
  .thought-no-motion-enter-done {
    opacity: 1;
    transform: none;
    transition: none;
  }
  ```
- [ ] Verify that the `--devs-motion-duration` CSS custom property (defined in `motion.css` from Task 01) is used as the value for any explicit `transition-duration` declarations inside `ThoughtStreamer.module.css`, replacing any hardcoded millisecond values.
- [ ] Ensure the ThoughtStreamer's virtual scrolling logic (which may use `scrollTo` with `behavior: 'smooth'`) is updated to use `behavior: reducedMotion ? 'instant' : 'smooth'`.

## 3. Code Review

- [ ] Verify that the `reducedMotion` boolean is read once at the component level (from `useReducedMotion()`) and not re-derived inside child render loops, to avoid unnecessary recalculations.
- [ ] Verify no inline `style={{ transition: '...' }}` props remain on animated thought elements; all motion values must flow through CSS classes or the `--devs-motion-duration` token.
- [ ] Confirm the `timeout` prop of `<CSSTransition>` (or equivalent) is set to `0` in reduced-motion mode to prevent React's transition state machine from getting stuck in `entering`/`exiting` states indefinitely.
- [ ] Confirm that removing the slide animation does not cause a layout shift — the thought item must still occupy its correct vertical space instantly.
- [ ] Validate that the `scrollTo` behavior change (`'instant'` vs `'smooth'`) is covered by a test and that the mock for `element.scrollTo` is verified.

## 4. Run Automated Tests to Verify

- [ ] Run the ThoughtStreamer reduced-motion tests: `pnpm --filter @devs/webview-ui test -- --testPathPattern="ThoughtStreamer.reducedMotion"`
- [ ] Run the full ThoughtStreamer test suite to check for regressions: `pnpm --filter @devs/webview-ui test -- --testPathPattern="ThoughtStreamer"`
- [ ] Run the full Webview UI test suite: `pnpm --filter @devs/webview-ui test`
- [ ] All tests must pass; no snapshot diffs should appear unless intentionally updated.

## 5. Update Documentation

- [ ] Update `packages/webview-ui/src/components/ThoughtStreamer/AGENT.md` (create if absent) with a section "Reduced Motion Behaviour" that documents: (a) which prop/hook controls the animation branch, (b) the CSS class names used for each mode, and (c) the `scrollTo` behavior switch.
- [ ] Update the "Animation Catalogue" section of `docs/ui-patterns.md` (create if absent) to list the `ThoughtStreamer` sliding animation as having a reduced-motion alternative, with a code snippet showing the conditional branch.
- [ ] If the ThoughtStreamer Storybook story exists (`ThoughtStreamer.stories.tsx`), add a story variant `ReducedMotion` that sets `prefers-reduced-motion: reduce` using the `@storybook/addon-a11y` decorator so designers can visually verify the static state.

## 6. Automated Verification

- [ ] Run `pnpm --filter @devs/webview-ui test --coverage --coveragePathPattern="ThoughtStreamer"` and assert line coverage ≥ 85%.
- [ ] Run `pnpm --filter @devs/webview-ui build` and confirm no TypeScript errors.
- [ ] Execute `scripts/a11y-motion-audit.sh` (create if absent): a script that uses `axe-core` against the compiled Storybook static build and fails if any animation-related WCAG 2.1 SC 2.3.3 violations are reported for the ThoughtStreamer component.
