# Task: Implement DAG performance test harness (Sub-Epic: 64_DAG_Performance_Base)

## Covered Requirements
- [7_UI_UX_DESIGN-REQ-UI-DES-045], [7_UI_UX_DESIGN-REQ-UI-DES-045-1]

## 1. Initial Test Written
- [ ] Create a Node-level performance test at `tests/perf/dag/forceSimulation.perf.test.ts` (Jest or Vitest). The test must:
  - import { generateDAG } from `tests/perf/helpers/generateGraph`
  - import { computeForceLayout } from `packages/ui/src/layout/forceLayout` (or the planned module path)
  - use deterministic initial positions: set `nodes[i].x` / `nodes[i].y` using a grid layout to avoid random seeds
  - run `computeForceLayout()` for graphs with sizes: `50`, `300`, `1000` and measure durations using Node's performance API (`import { performance } from 'perf_hooks'`)
  - assert that `computeForceLayout` returns nodes with numeric `x` and `y` for every node
  - write durations to `tests/perf/results/latest.json` and compare against `tests/perf/results/baseline.json` if present; if baseline exists, fail when `duration > baseline * 1.5`
  - mark tests as failing until implementation exists (TDD)

## 2. Task Implementation
- [ ] Add the test file and helper imports; add a perf npm script in `package.json`: `"perf:dag": "node scripts/run-dag-perf.js"` that runs the perf test harness and writes `latest.json`
- [ ] Implement `scripts/run-dag-perf.js` that loads the harness test or calls `computeForceLayout` directly and prints a JSON summary to stdout and `tests/perf/results/latest.json`
- [ ] Ensure `tests/perf/helpers/generateGraph.ts` exists (see task 02) and is imported by the perf test

## 3. Code Review
- [ ] Verify tests are deterministic (no `Math.random` leakage), fast to run for small graphs, and isolate heavy tests behind a perf tag or separate script
- [ ] Verify harness writes machine-independent metrics in ms and includes `nodeCount` / `linkCount` in records
- [ ] Confirm no browser-only APIs are used and tests can run in CI (Node environment)

## 4. Run Automated Tests to Verify
- [ ] Run: `npm test -- tests/perf/dag/forceSimulation.perf.test.ts` (or pnpm equivalent) to observe failing tests (expected)
- [ ] Run: `npm run perf:dag` to execute the harness and produce `tests/perf/results/latest.json`

## 5. Update Documentation
- [ ] Create `tests/perf/README.md` documenting how to run the harness, the JSON schema for `baseline/latest` results, and instructions for updating `baseline.json` (only when a measured improvement is verified)

## 6. Automated Verification
- [ ] Add `scripts/verify-dag-perf.js` which:
  - runs the harness
  - reads `baseline.json` if present
  - writes `latest.json`
  - exits non-zero if any measured duration > `baseline * 1.5`
  - prints a compact summary for CI logs
