# Task: Implement density scaling engine and Zustand store (Sub-Epic: 36_High_Density_SNR)

## Covered Requirements
- [7_UI_UX_DESIGN-REQ-UI-DES-004], [7_UI_UX_DESIGN-REQ-UI-DES-062]

## 1. Initial Test Written
- [ ] Add unit tests at src/ui/density/__tests__/store.test.ts that assert the store defaults and selectors:
  - default mode is 'normal'.
  - setting 'compact' returns itemHeight === 24, 'normal' === 40, 'comfortable' === 56.
  - getVisibleCount(viewportHeight) === Math.floor(viewportHeight / getItemHeight()).

Example test snippet (Jest):

```ts
import { createDensityStore } from 'src/ui/density/store';

test('density store default and mode changes', () => {
  const store = createDensityStore();
  expect(store.getState().mode).toBe('normal');
  store.getState().setMode('compact');
  expect(store.getState().getItemHeight()).toBe(24);
});
```

## 2. Task Implementation
- [ ] Implement src/ui/density/store.ts (TypeScript) using Zustand with the following exported API:
  - type DensityMode = 'compact' | 'normal' | 'comfortable';
  - createDensityStore(): returns methods: mode, setMode(mode), getItemHeight(), getDensityScale(), getVisibleCount(viewportHeight:number).
  - Constants: ITEM_HEIGHTS = { compact:24, normal:40, comfortable:56 } and SCALES = { compact:0.6, normal:1, comfortable:1.4 }.
- [ ] Implement hook export: export const useDensityStore = createDensityStore();
- [ ] Add well-typed selectors and memoize simple derived values.

Implementation notes:
- Keep all logic pure and deterministic; no DOM reads in the store.
- Add TypeScript types and JSDoc comments for each exported function.

## 3. Code Review
- [ ] Verify TypeScript strictness and typed public API.
- [ ] Ensure selectors are pure and memoized where appropriate.
- [ ] Check unit tests cover edge cases (invalid mode, zero viewport height).
- [ ] Validate the store has no side-effects and is trivial to mock in component tests.

## 4. Run Automated Tests to Verify
- [ ] Run: npm test -- src/ui/density --silent
- [ ] Or: npx jest src/ui/density --coverage and assert tests pass.

## 5. Update Documentation
- [ ] Add docs/ui/density.md describing the modes, constants, and how components should consume getItemHeight() and getVisibleCount().

## 6. Automated Verification
- [ ] Add a CI step or jest coverageThreshold for src/ui/density >= 90% and a unit test that validates getVisibleCount correctness over a set of viewport heights.
