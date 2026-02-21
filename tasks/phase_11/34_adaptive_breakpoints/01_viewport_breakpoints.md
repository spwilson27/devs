# Task: Implement viewport breakpoint constants and utilities (Sub-Epic: 34_Adaptive_Breakpoints)

## Covered Requirements
- [7_UI_UX_DESIGN-REQ-UI-DES-081]

## 1. Initial Test Written
- [ ] Create unit tests at src/ui/layout/__tests__/breakpoints.test.ts using the project's unit test framework (Jest/Vitest). Write the tests BEFORE implementing code.
  - Test 1: import { BREAKPOINTS, getBreakpoint } from 'src/ui/layout/breakpoints'
    - Assert BREAKPOINTS equals the single-source-of-truth object:
      { MOBILE: 480, NARROW: 840, STANDARD: 1200, WIDE: 1920 }
    - (These numbers are the min-width thresholds. Document them in docs/ui/breakpoints.md.)
  - Test 2: assert getBreakpoint(375) === 'mobile'
  - Test 3: assert getBreakpoint(768) === 'narrow'
  - Test 4: assert getBreakpoint(1024) === 'standard'
  - Test 5: assert getBreakpoint(1440) === 'wide'
  - Test 6: renderHook/useBreakpoint: use a hook test (renderHook from @testing-library/react-hooks or @testing-library/react) to assert the hook returns the correct breakpoint when window.innerWidth is programmatically changed and a resize event is dispatched.

## 2. Task Implementation
- [ ] Add src/ui/layout/breakpoints.ts (TypeScript) implementing:
  - export const BREAKPOINTS = { MOBILE: 480, NARROW: 840, STANDARD: 1200, WIDE: 1920 } as const;
  - export type Breakpoint = 'mobile'|'narrow'|'standard'|'wide';
  - export function getBreakpoint(width: number): Breakpoint; // returns the correct string for given width
- [ ] Add src/ui/layout/useBreakpoint.tsx implementing a React hook that:
  - Uses ResizeObserver against document.documentElement or window.innerWidth fallback.
  - Debounces updates by 50ms.
  - Is SSR-safe (guards for window undefined).
  - Returns the current Breakpoint and raw width.
- [ ] Update tailwind.config.js (or tailwind.config.cjs) screens mapping to the same BREAKPOINTS values so CSS and JS share the same breakpoints. Prefer importing the BREAKPOINTS from a JS module (e.g., build a small script to produce tailwind screens from BREAKPOINTS or export BREAKPOINTS from a JS file used by both).

## 3. Code Review
- [ ] Confirm there are no magic numbers duplicated across code; BREAKPOINTS must be the single source of truth.
- [ ] Confirm types are exported and used (Breakpoint type), the hook is SSR-safe, and debouncing is applied.
- [ ] Confirm tailwind.config.js uses the same values (either by import or by clear comments) and that comments reference the tests.
- [ ] Verify unit tests cover edge conditions (exact threshold values and just-below/above values).

## 4. Run Automated Tests to Verify
- [ ] Run the project's unit tests: npm test or pnpm test. Prefer running the single test file:
  - npx jest src/ui/layout/__tests__/breakpoints.test.ts --runInBand OR
  - npx vitest run src/ui/layout/__tests__/breakpoints.test.ts
- [ ] Ensure tests initially fail (TDD), then implement code until they pass.

## 5. Update Documentation
- [ ] Add docs/ui/breakpoints.md describing:
  - The breakpoint names and numeric thresholds.
  - How to import BREAKPOINTS in JS/TS and reference screens in tailwind.config.js.
  - The intended layout mode for each breakpoint (mobile, narrow, standard, wide).

## 6. Automated Verification
- [ ] Add a CI job step (or a local script) that imports the module and asserts getBreakpoint(1024) returns 'standard' (e.g., node -e "console.log(require('./src/ui/layout/breakpoints').getBreakpoint(1024))").
- [ ] Run tests with coverage and assert the breakpoints file is included in coverage reporting.
