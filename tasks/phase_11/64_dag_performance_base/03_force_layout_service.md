# Task: Implement d3-force layout service `computeForceLayout` (Sub-Epic: 64_DAG_Performance_Base)

## Covered Requirements
- [7_UI_UX_DESIGN-REQ-UI-DES-045], [7_UI_UX_DESIGN-REQ-UI-DES-045-1]

## 1. Initial Test Written
- [ ] Create unit tests at `tests/unit/forceLayout.test.ts` that:
  - import `computeForceLayout` from `packages/ui/src/layout/forceLayout` (or `src/components/DAGCanvas/layout/forceLayout` depending on repo layout)
  - use `generateDAG(10, 2)` from the synthetic generator to create a small deterministic graph
  - call `await computeForceLayout(nodes, links, { simulateSync: true, maxIterations: 200 })`
  - assert that returned nodes have numeric `x` and `y` for all nodes and that positions differ from the provided initial positions (layout moved nodes)
  - assert the Promise resolves within a sensible timeout (e.g., 500ms in CI local env)

## 2. Task Implementation
- [ ] Implement `computeForceLayout(nodes, links, options)` at `packages/ui/src/layout/forceLayout.ts` with the following characteristics:
  - Pure, DOM-free module that can run in Node and be serialized for Web Worker use
  - Use `d3-force` primitives:
    ```js
    import { forceSimulation, forceLink, forceManyBody, forceCenter, forceCollide } from 'd3-force'
    ```
  - Defaults: `linkDistance = options.linkDistance || 120`, `charge = options.charge || -30`, `maxIterations = options.maxIterations || 300`, `nodeRadius = options.nodeRadius || 32`.
  - Behavior:
    - If nodes lack `x`/`y`, bootstrap them with a deterministic grid (same as generateDAG) to avoid randomness
    - Create simulation, attach `forceLink(links).id(d => d.id)`, `forceManyBody().strength(charge)`, `forceCollide(nodeRadius)`, and optional center force
    - Provide `options.simulateSync` flag: when true, loop `for (let i = 0; i < maxIterations; i++) simulation.tick()` and then resolve with node positions (deterministic and fast for tests)
    - Otherwise, run simulation normally and resolve when `alpha() < 0.001` or after `maxIterations` ticks
    - Ensure `simulation.stop()` and any event listeners are cleaned up to avoid memory leaks
  - Export API shape: `async function computeForceLayout(nodes, links, options) => Promise<{ nodes: PositionedNode[] }>`
  - Add minimal TypeScript types or JSDoc comments
- [ ] Update `package.json` (workspace package) dev/runtime deps to include `d3-force` (and `@types/d3-force` if TypeScript) or document dependency requirement in the task

## 3. Code Review
- [ ] Confirm the module is:
  - Pure and free of DOM access
  - Serializable (no captured closures) so it can be moved into a worker later
  - Properly typed (TS) or documented (JSDoc) for consumer clarity
  - Clean in lifecycle: simulation is stopped, listeners removed on resolve
- [ ] Verify default force parameters are reasonable and configurable for tuning in later tasks

## 4. Run Automated Tests to Verify
- [ ] Run: `npm test -- tests/unit/forceLayout.test.ts` and ensure tests pass
- [ ] Run the perf harness `npm run perf:dag` to confirm `computeForceLayout` is invoked and metrics are produced (may be recorded in `tests/perf/results/latest.json`)

## 5. Update Documentation
- [ ] Add `packages/ui/src/layout/README.md` describing `computeForceLayout` API, options, recommended defaults for DAGCanvas, and an example usage snippet

## 6. Automated Verification
- [ ] Add a unit-level performance smoke test at `tests/unit/forceLayout.perf.test.ts` that calls `computeForceLayout` on `generateDAG(300)` with `simulateSync: true`, records duration, and writes to `tests/perf/results/latest.json` (used by `scripts/verify-dag-perf.js`)
