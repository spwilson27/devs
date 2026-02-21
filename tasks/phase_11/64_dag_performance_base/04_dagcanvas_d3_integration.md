# Task: Integrate `computeForceLayout` into `DAGCanvas` and add integration tests (Sub-Epic: 64_DAG_Performance_Base)

## Covered Requirements
- [7_UI_UX_DESIGN-REQ-UI-DES-045], [7_UI_UX_DESIGN-REQ-UI-DES-045-1]

## 1. Initial Test Written
- [ ] Create an integration test at `tests/components/DAGCanvas/DAGCanvas.layout.integration.test.tsx` using React Testing Library + Jest/Vitest that:
  - imports `generateDAG` to create a deterministic graph of `50` nodes
  - mounts `<DAGCanvas nodes={nodes} links={links} />` (import path likely `src/components/DAGCanvas/DAGCanvas`)
  - either mocks `computeForceLayout` (jest.mock) to return a short list of positions, or calls the real `computeForceLayout` with `simulateSync: true` to run deterministically in test
  - waits for the component to emit or call a `onLayoutComplete` callback (expose a prop for tests) or polls for node DOM elements to have `data-x`/`data-y` attributes or `transform` updated
  - asserts that every rendered node DOM element has a corresponding layout position applied (e.g., `getByTestId('node-<id>')` has attribute or style matching returned x/y)

## 2. Task Implementation
- [ ] Add or update `src/components/DAGCanvas/hooks/useForceLayout.ts` (or nearest hook) to:
  - call `computeForceLayout(nodes, links, { simulateSync: isTest || options.simulateSync })` where `isTest` can be detected from `options` or a prop override
  - expose an `onLayoutComplete(positions)` callback prop that is called when layout finishes (essential for deterministic integration tests)
  - avoid per-tick React setState churn: use a `ref` to apply transform attributes in `requestAnimationFrame`, batching updates to DOM elements rather than re-rendering full tree on every tick
  - ensure cleanup on unmount: cancel RAF, stop simulation, remove listeners
- [ ] Add a prop `layoutServiceOverride` to `DAGCanvas` so tests can inject a synchronous mock layout for integration scenarios
- [ ] Update stories or example usage to show `onLayoutComplete` usage for debugging

## 3. Code Review
- [ ] Check that:
  - Rendering changes are applied via refs/attributes rather than constant React re-renders per simulation tick
  - The hook/service boundary is clear: `DAGCanvas` delegates layout responsibilities to `computeForceLayout` (or injected override)
  - The `onLayoutComplete` callback is called exactly once per layout run and receives a plain serializable array of `{ id, x, y }`
  - All resources are cleaned up on unmount

## 4. Run Automated Tests to Verify
- [ ] Run: `npm test -- tests/components/DAGCanvas/DAGCanvas.layout.integration.test.tsx` and ensure passing tests
- [ ] Run component smoke story tests (if Storybook test harness exists) to confirm DAGCanvas renders with mocked layout

## 5. Update Documentation
- [ ] Update `src/components/DAGCanvas/README.md` describing how to inject `layoutServiceOverride`, the `onLayoutComplete` prop, and recommended rendering strategy (refs + RAF) for high-performance updates

## 6. Automated Verification
- [ ] Add a small integration script `scripts/verify-dagcanvas-layout.js` that mounts the component in a headless environment (jsdom) with `simulateSync: true`, waits for `onLayoutComplete`, verifies node attributes have numeric positions, and exits non-zero if not
