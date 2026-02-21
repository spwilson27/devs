# Task: Implement Instant-Jump Tab Transitions in Reduced Motion (Sub-Epic: 91_Reduced_Motion_Transitions)

## Covered Requirements
- [7_UI_UX_DESIGN-REQ-UI-DES-085-4]

## 1. Initial Test Written

- [ ] In `packages/webview-ui/src/components/navigation/__tests__/ViewRouter.test.tsx`, write tests using `@testing-library/react` and `jest`:
  - **Test 1 – slide transition in normal motion:** Mock `useReducedMotion` to return `false`. Render `<ViewRouter initialView="DASHBOARD" />`. Trigger a navigation to `ROADMAP` (e.g., by calling the Zustand action `useUIStore.getState().navigateTo('ROADMAP')`). Assert that the outgoing view element has a CSS class or inline style with a non-zero `transition-duration` (e.g., class `view-transition-slide` or `style.transitionDuration !== '0ms'`).
  - **Test 2 – instant jump in reduced motion:** Mock `useReducedMotion` to return `true`. Render `<ViewRouter initialView="DASHBOARD" />`. Trigger navigation to `ROADMAP`. Assert that the incoming view is immediately present in the DOM with `data-testid` for the target view (`data-testid="view-ROADMAP"`) after a single React state flush (using `act()`). Assert that **no** transition class (e.g., `view-transition-slide`, `view-transition-fade`) is applied.
  - **Test 3 – transition duration 0ms in reduced motion:** With `useReducedMotion` returning `true`, after navigation, assert that any element with `data-testid="view-container"` has `transitionDuration` equal to `'0ms'` or the inline style is absent (relying on the CSS `--devs-transition-duration: 0ms` token).
  - **Test 4 – multiple rapid navigations in reduced motion:** With `useReducedMotion` returning `true`, perform 3 rapid navigation calls in sequence. Assert that only the last target view is rendered and no intermediate transition state elements are present.
  - **Test 5 – active tab indicator updates instantly:** With `useReducedMotion` returning `true`, navigate from `DASHBOARD` to `CONSOLE`. Assert that the tab indicator element (`data-testid="tab-indicator"`) moves to `CONSOLE` without any interim position class.
- [ ] In `packages/webview-ui/src/components/navigation/__tests__/TabBar.test.tsx`, add:
  - **Test 6 – tab indicator motion in reduced motion:** Mock `useReducedMotion` to return `true`. Render `<TabBar activeView="DASHBOARD" />`. Simulate click on `ROADMAP` tab. Assert the active indicator does not have class `tab-indicator-animated` and has class `tab-indicator-instant`.

## 2. Task Implementation

- [ ] Locate `packages/webview-ui/src/components/navigation/ViewRouter.tsx`. Refactor the view transition logic as follows:
  - Import `useReducedMotion` from `../../hooks/useReducedMotion`.
  - Replace any CSS transition class application with a conditional:
    ```tsx
    const reducedMotion = useReducedMotion();
    const transitionClass = reducedMotion ? 'view-transition-instant' : 'view-transition-slide';
    ```
  - Wrap the view swap in a `useLayoutEffect` (not `useEffect`) so that the new view mounts synchronously without a transitional frame when `reducedMotion` is `true`.
  - When `reducedMotion` is `true`, skip the intermediate "exiting" state entirely: set the active view immediately without a two-frame fade sequence.
  - Set `style={{ transitionDuration: reducedMotion ? '0ms' : undefined }}` on the view container element, ensuring the inline style overrides any CSS class-based duration.
- [ ] In `packages/webview-ui/src/styles/viewTransitions.css`, add:
  ```css
  .view-transition-slide {
    transition: opacity var(--devs-transition-duration) ease,
                transform var(--devs-transition-duration) ease;
  }

  .view-transition-instant {
    transition: none !important;
    transform: none !important;
    opacity: 1 !important;
  }

  @media (prefers-reduced-motion: reduce) {
    .view-transition-slide {
      transition: none !important;
      transform: none !important;
    }
  }
  ```
- [ ] Locate `packages/webview-ui/src/components/navigation/TabBar.tsx`. Update the active tab indicator:
  - Import `useReducedMotion`.
  - Apply class `tab-indicator-animated` when `!reducedMotion`, and `tab-indicator-instant` when `reducedMotion`.
  - In `packages/webview-ui/src/styles/tabBar.css`, define:
    ```css
    .tab-indicator-animated {
      transition: left var(--devs-transition-duration) cubic-bezier(0.4, 0, 0.2, 1);
    }
    .tab-indicator-instant {
      transition: none !important;
    }
    @media (prefers-reduced-motion: reduce) {
      .tab-indicator-animated {
        transition: none !important;
      }
    }
    ```
- [ ] Audit all other navigational transitions in the Webview (e.g., panel slide-ins, modal open/close, accordion expand/collapse) and apply the same pattern: gate `transition-duration` on `useReducedMotion()` or `var(--devs-transition-duration)`.
- [ ] Ensure that each view registered in `ViewRouter` has a `data-testid="view-{VIEW_NAME}"` attribute for reliable test targeting.

## 3. Code Review

- [ ] Confirm that `useLayoutEffect` (not `useEffect`) is used for the synchronous view swap in reduced motion mode to prevent a single-frame flash of the outgoing view.
- [ ] Confirm that the `view-transition-instant` class sets `transition: none !important` — not just `transition-duration: 0ms` — to prevent sub-pixel movement from easing functions with a 0ms duration.
- [ ] Confirm no `setTimeout` or `requestAnimationFrame` delays are used to defer the view swap in reduced-motion mode. The swap must be immediate within the same synchronous React render cycle.
- [ ] Verify that the `TabBar` indicator does not use `left` position animation in reduced-motion mode — it must jump directly to the new position.
- [ ] Ensure all transition-related CSS classes are defined in `viewTransitions.css` or `tabBar.css` — not scattered as inline styles with magic number durations.

## 4. Run Automated Tests to Verify

- [ ] Run `pnpm --filter @devs/webview-ui test -- --testPathPattern="ViewRouter|TabBar"` and confirm all 6 tests pass.
- [ ] Run the full webview unit test suite: `pnpm --filter @devs/webview-ui test` and confirm zero regressions.
- [ ] Run `pnpm --filter @devs/webview-ui build` and confirm no TypeScript errors.

## 5. Update Documentation

- [ ] Create `packages/webview-ui/src/components/navigation/ViewRouter.agent.md`:
  - **Transition strategy:** In normal motion mode, view changes use a two-frame slide/fade (`view-transition-slide`). In reduced motion mode (`useReducedMotion() === true`), transitions are bypassed entirely using `useLayoutEffect` with immediate state update and the `view-transition-instant` class. Duration is always governed by `--devs-transition-duration` (0ms in reduced motion).
  - **Tab indicator:** `TabBar` switches between `tab-indicator-animated` and `tab-indicator-instant` CSS classes based on `useReducedMotion()`.
  - **Constraint:** Never use `setTimeout` delays for navigation transitions — they prevent screen reader focus management from working correctly.
- [ ] Update `packages/webview-ui/ARCHITECTURE.md` under "Navigation & Routing" to note the reduced-motion instant-jump policy.

## 6. Automated Verification

- [ ] Run `pnpm --filter @devs/webview-ui test -- --coverage --testPathPattern="ViewRouter|TabBar"` and assert **≥ 90% branch coverage** on `ViewRouter.tsx` and `TabBar.tsx`.
- [ ] Run `grep -n "view-transition-instant\|tab-indicator-instant" packages/webview-ui/src/components/navigation/ViewRouter.tsx packages/webview-ui/src/components/navigation/TabBar.tsx` and confirm both files reference the instant classes.
- [ ] Run `grep -n "transition: none" packages/webview-ui/src/styles/viewTransitions.css packages/webview-ui/src/styles/tabBar.css` and confirm reduced-motion guards are present in both stylesheets.
- [ ] Run `grep -rn "useLayoutEffect" packages/webview-ui/src/components/navigation/ViewRouter.tsx` and confirm at least one usage exists for the synchronous view swap.
