# Task: Implement selector-based Zustand store and subscription hooks (Sub-Epic: 45_Performance_Reactivity)

## Covered Requirements
- [6_UI_UX_ARCH-REQ-045]

## 1. Initial Test Written
- [ ] Create a unit test at tests/unit/store/selectiveReactivity.test.tsx using Jest + @testing-library/react that proves selector-based subscriptions prevent unrelated re-renders.
  - Mount two minimal React components: ComponentA uses selector s => s.ui.sidebarOpen, ComponentB uses selector s => s.tasks.visibleCount.
  - Use jest.fn() or a render counter to assert ComponentA re-renders when sidebarOpen changes and ComponentB does NOT re-render, and vice versa.
  - Use the real store implementation (import from src/webview/store) with a test-only provider or direct hook usage via renderHook.

## 2. Task Implementation
- [ ] Implement a typed Zustand store with "subscribeWithSelector" support at src/webview/store/index.ts:
  - Use the zustand vanilla store + middleware subscribeWithSelector (or use createStore from 'zustand').
  - Export a hook useStoreSelector<T>(selector: (s: StoreState) => T, equality?: (a:T,b:T)=>boolean): T that internally uses the store's subscribeWithSelector to ensure minimal re-renders.
  - Provide TypeScript types for StoreState and scoped slices (ui, tasks, session).
  - Add small example components under src/webview/components/tests that use useStoreSelector to validate usage.

## 3. Code Review
- [ ] Verify selectors are pure (no inline object/array creation in selector) to avoid false re-renders.
- [ ] Confirm equality comparator default is shallow (import from 'zustand/shallow') and the API allows custom equality.
- [ ] Ensure no broad subscriptions to the entire store are used anywhere in new code.
- [ ] Confirm types are exported and narrow (avoid any) so downstream components are properly typed.

## 4. Run Automated Tests to Verify
- [ ] Run: npm test -- tests/unit/store/selectiveReactivity.test.tsx (or yarn test tests/unit/store/selectiveReactivity.test.tsx). Ensure the test suite asserts render counts as described.

## 5. Update Documentation
- [ ] Add docs/webview/selector-reactivity.md describing: rationale for selector-based subscriptions, example usage of useStoreSelector, recommended equality comparators, and migration notes for existing components.

## 6. Automated Verification
- [ ] Add a micro-benchmark under scripts/benchmark-selective-reactivity.js that mounts two components and performs 1k state updates to a non-subscribed slice; the benchmark should assert subscriber render count remains constant. Include an npm script "bench:selective-reactivity" to run it and assert expected behavior in CI.