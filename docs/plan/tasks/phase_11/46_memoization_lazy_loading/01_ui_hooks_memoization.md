# Task: Implement shared memoization hooks and selector utilities (Sub-Epic: 46_Memoization_Lazy_Loading)

## Covered Requirements
- [7_UI_UX_DESIGN-REQ-UI-DES-068]

## 1. Initial Test Written
- [ ] Create unit tests under packages/ui-hooks/__tests__/useMemoizedSelector.test.tsx (or packages/ui/__tests__) using Jest + React Testing Library that prove components subscribed with the new selector hook do NOT re-render when unrelated state changes.
  - Use a minimal Zustand store fixture in the test with keys: {a: string, b: string}.
  - Mount a tiny test component that uses the new hook: const value = useMemoizedSelector(s => s.a);
  - Track render count by incrementing a ref on each render and assert that when s.b is updated, render count for the test component does NOT increase.
  - Add a second test that asserts the component DOES re-render when s.a changes.

## 2. Task Implementation
- [ ] Add a new file packages/ui-hooks/src/useMemoizedSelector.ts (or packages/ui/src/hooks/useMemoizedSelector.ts) implementing a small wrapper around the existing Zustand selector API which enforces stable referential identity when the selected slice is semantically unchanged.
  - API: export function useMemoizedSelector<T, U>(selector: (s: T) => U, isEqual?: (a: U, b: U) => boolean): U
  - Implementation notes:
    - Use useRef to keep previous selected value and only return a new object identity when deep/shallow equality fails.
    - Default to shallow equality (shallow-equal) for objects/arrays.
    - Use the underlying zustand store subscribe/select API so no additional global state is introduced.
  - Add a companion useShallowSelector alias that defaults to shallow equality for common cases.
- [ ] Export hooks from the package entry (packages/ui-hooks/src/index.ts).
- [ ] Add TypeScript types and JSDoc describing expected semantics and performance characteristics.

## 3. Code Review
- [ ] Verify no business logic or state transitions are introduced into UI hooks; hooks must be pure selectors and equality helpers only.
- [ ] Ensure the equality function is configurable but defaults to a fast shallow compare; avoid deep equality that can be expensive.
- [ ] Confirm types are exported and the implementation is tree-shakeable (no side-effectful top-level imports of heavy libs).
- [ ] Ensure tests cover both positive and negative re-render scenarios and run fast (<1s per unit).

## 4. Run Automated Tests to Verify
- [ ] Run the project's unit test runner for the package: (from repo root) run: pnpm -w test or npm test —filter packages/ui-hooks (or the equivalent workspace filter) and ensure the new tests pass.
- [ ] Validate test asserts by running jest --runInBand packages/ui-hooks/__tests__/useMemoizedSelector.test.tsx.

## 5. Update Documentation
- [ ] Add a README snippet to packages/ui-hooks/README.md describing the hook contract, usage examples, and guidance: "Use for high-frequency UI streams to avoid unnecessary re-renders".
- [ ] Add an example code snippet showing how to replace direct store subscriptions with useMemoizedSelector.

## 6. Automated Verification
- [ ] Add a small CI unit test gating: include the new test file in the unit test suite and ensure it is run during the repository's unit-test step.
- [ ] Optionally enable jest coverage assertion for the hook file to ensure future regressions are caught: expect(coverage.statements.pct).toBeGreaterThan(80).