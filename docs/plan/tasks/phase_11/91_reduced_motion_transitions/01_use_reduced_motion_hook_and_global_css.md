# Task: Implement `useReducedMotion` Hook and Global CSS Reduced-Motion Overrides (Sub-Epic: 91_Reduced_Motion_Transitions)

## Covered Requirements
- [7_UI_UX_DESIGN-REQ-UI-DES-059-2]

## 1. Initial Test Written

- [ ] In `packages/webview-ui/src/hooks/__tests__/useReducedMotion.test.ts`, write unit tests using `@testing-library/react-hooks` (or `renderHook` from `@testing-library/react`):
  - **Test 1 – default (no media query):** Mock `window.matchMedia` to return `matches: false` for `(prefers-reduced-motion: reduce)`. Assert that `useReducedMotion()` returns `false`.
  - **Test 2 – reduced motion active:** Mock `window.matchMedia` to return `matches: true`. Assert that `useReducedMotion()` returns `true`.
  - **Test 3 – live media query change:** Mock `window.matchMedia` to emit a `change` event toggling `matches` from `false` to `true` mid-render. Assert that the hook re-renders and returns `true` after the event fires.
  - **Test 4 – cleanup:** Assert that the `removeEventListener` (or `removeListener`) cleanup function is called when the hook unmounts (spy on `MediaQueryList.removeEventListener`).
- [ ] In `packages/webview-ui/src/styles/__tests__/reducedMotion.css.test.ts`, write a jsdom-based test (using `jest` + `jest-environment-jsdom`):
  - Apply the stylesheet (via `document.adoptedStyleSheets` or a `<style>` tag inserted in `beforeEach`).
  - Simulate `prefers-reduced-motion: reduce` by overriding `window.matchMedia` to return `matches: true`.
  - Assert that CSS custom property `--devs-transition-duration` resolves to `0ms` within the `@media (prefers-reduced-motion: reduce)` block.
  - Assert that the `.animate-pulse`, `.animate-spin`, `.animate-bounce` utility classes have `animation: none !important` applied in reduced-motion mode.
  - Assert that `.transition`, `.transition-all`, `.transition-colors`, `.transition-opacity`, `.transition-transform` classes have `transition: none !important` applied.

## 2. Task Implementation

- [ ] Create `packages/webview-ui/src/hooks/useReducedMotion.ts`:
  ```ts
  import { useState, useEffect } from 'react';

  const QUERY = '(prefers-reduced-motion: reduce)';

  export function useReducedMotion(): boolean {
    const [reducedMotion, setReducedMotion] = useState<boolean>(
      () => typeof window !== 'undefined' && window.matchMedia(QUERY).matches
    );

    useEffect(() => {
      const mql = window.matchMedia(QUERY);
      const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
      mql.addEventListener('change', handler);
      return () => mql.removeEventListener('change', handler);
    }, []);

    return reducedMotion;
  }
  ```
- [ ] Export the hook from `packages/webview-ui/src/hooks/index.ts`.
- [ ] Create `packages/webview-ui/src/styles/reducedMotion.css`. This file must be imported once in the Webview entry point (`main.tsx` or `App.tsx`) after the Tailwind base import:
  ```css
  @media (prefers-reduced-motion: reduce) {
    *,
    *::before,
    *::after {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
      transition-delay: 0ms !important;
      scroll-behavior: auto !important;
    }

    /* Kill Tailwind animate-* utilities completely */
    .animate-pulse,
    .animate-spin,
    .animate-bounce,
    .animate-ping {
      animation: none !important;
    }

    /* Kill Tailwind transition utilities */
    .transition,
    .transition-all,
    .transition-colors,
    .transition-opacity,
    .transition-transform {
      transition: none !important;
    }
  }
  ```
- [ ] Add a CSS custom property to the `:root` block in the global stylesheet (`globals.css`) for use as a runtime token:
  ```css
  :root {
    --devs-transition-duration: 200ms;
  }
  @media (prefers-reduced-motion: reduce) {
    :root {
      --devs-transition-duration: 0ms;
    }
  }
  ```
- [ ] Audit all inline `transition` and `animation` style objects in React components under `packages/webview-ui/src/components/`. Replace hardcoded duration values with `var(--devs-transition-duration)` where they do not already use it.
- [ ] Replace all transforms and opacity-pulse animations that serve as "status indicators" with a CSS class swap approach: define a `.state-active` (solid color change, e.g., `background-color: var(--vscode-charts-green)`) and `.state-idle` class that are toggled via React state, so that the visual state persists with no motion.

## 3. Code Review

- [ ] Verify that the `useReducedMotion` hook contains **no direct DOM manipulation** beyond the `matchMedia` call — all side-effects must be inside `useEffect`.
- [ ] Confirm the `reducedMotion.css` file uses `!important` only on the universal override block and animation/transition utilities — not on component-specific styles.
- [ ] Ensure `--devs-transition-duration` is consistently used across all animated components in place of hardcoded `200ms`/`300ms` literals.
- [ ] Confirm the hook is not instantiated more than once per render tree — it should live in a single provider context or be memoized if used in many children (use React Context to broadcast the value if needed to avoid redundant `matchMedia` calls).
- [ ] Verify no accessibility regressions: focus rings, color changes for state, and ARIA attributes must remain unchanged in reduced-motion mode.

## 4. Run Automated Tests to Verify

- [ ] Run `pnpm --filter @devs/webview-ui test -- --testPathPattern="useReducedMotion|reducedMotion.css"` and confirm all tests pass with 0 failures.
- [ ] Run the full webview unit test suite: `pnpm --filter @devs/webview-ui test` — confirm no regressions.
- [ ] Run `pnpm --filter @devs/webview-ui build` and confirm the build succeeds with no TypeScript errors.

## 5. Update Documentation

- [ ] Create `packages/webview-ui/src/hooks/useReducedMotion.agent.md` documenting:
  - Purpose: wraps `prefers-reduced-motion` media query as a React hook.
  - Return value: `boolean` (`true` = user prefers reduced motion).
  - Usage pattern: consumed by animation-heavy components and the `reducedMotion.css` global override.
  - Constraint: must not add `animation: none` directly in JS — prefer the CSS layer for blanket suppression; use the hook for conditional React rendering logic.
- [ ] Add a section to `packages/webview-ui/ARCHITECTURE.md` under "Accessibility" describing the two-layer reduced motion strategy: (1) CSS global override via `reducedMotion.css`, (2) React hook `useReducedMotion` for programmatic branching.

## 6. Automated Verification

- [ ] Execute `pnpm --filter @devs/webview-ui test -- --coverage --testPathPattern="useReducedMotion|reducedMotion"` and assert **100% line coverage** on `useReducedMotion.ts`.
- [ ] Run `grep -r "animation-duration\|transition-duration" packages/webview-ui/src/styles/reducedMotion.css` and confirm the `0.01ms` suppression values are present.
- [ ] Run `grep -rn "prefers-reduced-motion" packages/webview-ui/src/` and confirm at least 2 files reference the media query (the CSS file + the hook).
