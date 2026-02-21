# Task: Implement `useReducedMotion` Hook and Global CSS Media Query Infrastructure (Sub-Epic: 90_Reduced_Motion_Media)

## Covered Requirements
- [7_UI_UX_DESIGN-REQ-UI-DES-085]

## 1. Initial Test Written

- [ ] In `packages/webview-ui/src/hooks/__tests__/useReducedMotion.test.ts`, write unit tests for a `useReducedMotion()` hook:
  - Test 1 — **Default (motion allowed):** Mock `window.matchMedia` to return `{ matches: false }` for the query `(prefers-reduced-motion: reduce)`. Assert that `useReducedMotion()` returns `false`.
  - Test 2 — **Reduced motion active:** Mock `window.matchMedia` to return `{ matches: true }` for the same query. Assert that `useReducedMotion()` returns `true`.
  - Test 3 — **Dynamic update:** Simulate the `matchMedia` event listener being called with a `MediaQueryListEvent` where `matches` changes from `false` to `true`. Assert the hook's return value re-renders from `false` to `true` (use `act()` from `@testing-library/react`).
  - Test 4 — **Cleanup:** Assert that `removeEventListener` (or `removeListener` for older APIs) is called when the component using the hook is unmounted, to prevent memory leaks.
- [ ] In `packages/webview-ui/src/styles/__tests__/reducedMotion.css.test.ts`, write a CSS-in-JS snapshot or DOM assertion test that:
  - Confirms that when `<html>` has the class `reduced-motion` (applied by the hook bootstrap logic), a known animated element loses its `transition` and `animation` properties (use `getComputedStyle`).
  - Confirms that the `@media (prefers-reduced-motion: reduce)` CSS block is present in the compiled stylesheet by checking that the relevant CSS custom property (`--devs-motion-duration`) resolves to `0ms`.

## 2. Task Implementation

- [ ] Create the hook file at `packages/webview-ui/src/hooks/useReducedMotion.ts`:
  ```typescript
  import { useState, useEffect } from 'react';

  const QUERY = '(prefers-reduced-motion: reduce)';

  export function useReducedMotion(): boolean {
    const [prefersReducedMotion, setPrefersReducedMotion] = useState<boolean>(
      () => typeof window !== 'undefined' && window.matchMedia(QUERY).matches
    );

    useEffect(() => {
      const mediaQueryList = window.matchMedia(QUERY);
      const listener = (event: MediaQueryListEvent) => {
        setPrefersReducedMotion(event.matches);
      };
      mediaQueryList.addEventListener('change', listener);
      return () => mediaQueryList.removeEventListener('change', listener);
    }, []);

    return prefersReducedMotion;
  }
  ```
- [ ] Export `useReducedMotion` from the shared hooks barrel file `packages/webview-ui/src/hooks/index.ts`.
- [ ] Add global CSS infrastructure in `packages/webview-ui/src/styles/motion.css`:
  ```css
  :root {
    --devs-motion-duration: 200ms;
    --devs-motion-easing: ease-in-out;
  }

  @media (prefers-reduced-motion: reduce) {
    :root {
      --devs-motion-duration: 0ms;
      --devs-motion-easing: step-end;
    }

    *,
    *::before,
    *::after {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
      scroll-behavior: auto !important;
    }
  }
  ```
- [ ] Import `motion.css` in the Webview entry point (`packages/webview-ui/src/index.tsx`) so it is globally applied.
- [ ] In the Webview's root `App.tsx`, call `useReducedMotion()` at the top level and store the result in the global Zustand UI store (key: `prefersReducedMotion: boolean`) so all child components can access it without prop-drilling.
- [ ] Ensure the Zustand store slice for UI preferences (in `packages/webview-ui/src/store/uiStore.ts`) is updated to include `prefersReducedMotion` with a default of `false`, and expose a `setReducedMotion(value: boolean)` action.

## 3. Code Review

- [ ] Verify the hook uses the functional initializer form of `useState` to correctly capture the media query state on the *first* render (avoids a flash of the wrong state).
- [ ] Verify `addEventListener`/`removeEventListener` is used (not the deprecated `addListener`/`removeListener`) to ensure forward compatibility.
- [ ] Verify `motion.css` uses CSS custom properties (`--devs-motion-*`) to allow fine-grained overrides per component rather than only the blanket `!important` override.
- [ ] Confirm that `motion.css` is imported *before* any component-level stylesheets in `index.tsx` to ensure correct CSS cascade order.
- [ ] Confirm no hardcoded `transition` or `animation` durations remain in any component stylesheet that bypass `--devs-motion-duration`.

## 4. Run Automated Tests to Verify

- [ ] Run the hook unit tests: `pnpm --filter @devs/webview-ui test -- --testPathPattern="useReducedMotion"`
- [ ] Run the CSS infrastructure test: `pnpm --filter @devs/webview-ui test -- --testPathPattern="reducedMotion.css"`
- [ ] Run the full Webview UI test suite to ensure no regressions: `pnpm --filter @devs/webview-ui test`
- [ ] All tests must pass with zero failures and zero snapshots unexpectedly changed.

## 5. Update Documentation

- [ ] Add an entry to `packages/webview-ui/src/hooks/README.md` (create if absent) documenting `useReducedMotion`: its signature, return value, and a usage example.
- [ ] Update `packages/webview-ui/AGENT.md` (or the relevant `.agent.md` file) with a section "Reduced Motion Architecture" explaining: (a) the `useReducedMotion` hook, (b) the `motion.css` global overrides, (c) the `prefersReducedMotion` Zustand key, and (d) how component authors must use `--devs-motion-duration` rather than hardcoded values.
- [ ] Record the architectural decision in `docs/decisions/ADR-reduced-motion-hook.md`: why a React hook + CSS custom properties approach was chosen over a pure CSS-only approach.

## 6. Automated Verification

- [ ] Run `pnpm --filter @devs/webview-ui test --coverage --coveragePathPattern="useReducedMotion"` and assert line coverage ≥ 90%.
- [ ] Run `pnpm --filter @devs/webview-ui build` and confirm the build succeeds with zero TypeScript errors.
- [ ] Execute the CI pipeline script `scripts/verify-motion-tokens.sh` (create if absent) that greps the compiled CSS bundle for `--devs-motion-duration` and fails if it is not present, confirming the token is bundled correctly.
