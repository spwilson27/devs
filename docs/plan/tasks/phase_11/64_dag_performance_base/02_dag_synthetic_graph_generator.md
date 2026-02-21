# Task: Implement deterministic synthetic DAG graph generator for perf tests (Sub-Epic: 64_DAG_Performance_Base)

## Covered Requirements
- [7_UI_UX_DESIGN-REQ-UI-DES-045], [7_UI_UX_DESIGN-REQ-UI-DES-045-1]

## 1. Initial Test Written
- [ ] Write unit tests at `tests/perf/helpers/generateGraph.test.ts` that:
  - import `generateDAG` from `tests/perf/helpers/generateGraph`
  - verify for `nodeCount` 50 and 300 that:
    - returns `nodes` array length === `nodeCount`
    - every node has deterministic numeric `x` and `y` values
    - `links` array forms a DAG (no cycles) — simple check: each link.source index < link.target index
    - average out-degree approximates requested `avgOutDegree` within a small tolerance

## 2. Task Implementation
- [ ] Implement `tests/perf/helpers/generateGraph.ts` exporting `generateDAG(nodeCount: number, avgOutDegree = 2, options?)` that returns `{ nodes, links }`:
  - nodes shape: `{ id: string, x: number, y: number, meta?: Record<string, any> }`
  - links shape: `{ source: string|number, target: string|number, weight?: number }`
  - Deterministic positioning: grid layout calculated with `cols = Math.ceil(Math.sqrt(nodeCount))`, `spacing = options.spacing || 120` and `x = (i % cols) * spacing`, `y = Math.floor(i / cols) * spacing`
  - Link generation: for each node `i`, connect to up to `avgOutDegree` nodes with index `> i` using a deterministic selection strategy (e.g., `(i + k * 7) % nodeCount`, skip targets <= i). This guarantees acyclicity.
  - Keep implementation pure and synchronous, export simple JS/TS types or JSDoc to help callers.
  - Place module under `tests/perf/helpers/` so tests import via relative path.

## 3. Code Review
- [ ] Confirm generator uses deterministic arithmetic rather than `Math.random`.
- [ ] Confirm produced graphs are acyclic by construction (targets > source by index)
- [ ] Confirm positions are well-bounded and suitable for layout bootstrapping

## 4. Run Automated Tests to Verify
- [ ] Run: `npm test -- tests/perf/helpers/generateGraph.test.ts` and ensure passing tests.

## 5. Update Documentation
- [ ] Add `tests/perf/helpers/README.md` documenting the API, deterministic guarantees, and recommended parameters for perf runs (50 / 300 / 1000)

## 6. Automated Verification
- [ ] Add a smoke check in `scripts/run-dag-perf.js` that imports `generateDAG`, verifies the generated graph shape, and exits non-zero if verification fails
