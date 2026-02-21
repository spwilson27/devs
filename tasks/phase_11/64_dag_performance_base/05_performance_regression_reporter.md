# Task: Add automated performance regression reporter and CI integration (Sub-Epic: 64_DAG_Performance_Base)

## Covered Requirements
- [7_UI_UX_DESIGN-REQ-UI-DES-045], [7_UI_UX_DESIGN-REQ-UI-DES-045-1]

## 1. Initial Test Written
- [ ] Add a regression verification test at `tests/perf/regression/regression.test.ts` that:
  - ensures `scripts/verify-dag-perf.js` runs and exits `0` when `tests/perf/results/baseline.json` is present and `latest` durations are within threshold
  - if `baseline.json` is missing, the test should skip or mark as inconclusive, advising to run the harness locally to generate baseline

## 2. Task Implementation
- [ ] Implement `scripts/verify-dag-perf.js` that:
  - imports `generateDAG` and `computeForceLayout` (or invokes `scripts/run-dag-perf.js` to produce `latest.json`)
  - runs predefined scenarios: `{ nodeCount: 50 }, { nodeCount: 300 }, { nodeCount: 1000 }` using `simulateSync: true` where possible (to make CI deterministic)
  - measures durations using `performance.now()` and writes `tests/perf/results/latest.json` with shape:
    ```json
    {
      "timestamp": "...",
      "nodeVersion": "...",
      "scenarios": [{"nodeCount":50,"links":...,"durationMs":123}, ...]
    }
    ```
  - compares `latest` results against `tests/perf/results/baseline.json` when present; if any `latest.durationMs > baseline.durationMs * 1.5`, exit with non-zero and print compact failure summary
  - return exit code 0 on success and non-zero on regression
- [ ] Add `package.json` script `perf:verify` = `node scripts/verify-dag-perf.js`
- [ ] (Optional, documented only) Add a CI workflow snippet (e.g., `.github/workflows/perf.yml`) that runs `npm run perf:verify` on a scheduled/nightly job and uploads `tests/perf/results/latest.json` as artifact for historical tracking

## 3. Code Review
- [ ] Confirm the reporter script is:
  - Deterministic when `simulateSync` is used
  - Produces stable JSON artifact with scenario metadata
  - Clear about thresholds and how to update `baseline.json` when improvements are validated
- [ ] Ensure the script is lightweight and marked to run in a separate perf job (not in the regular PR unit test job) unless the team opts in

## 4. Run Automated Tests to Verify
- [ ] Run locally: `node scripts/verify-dag-perf.js` (or `npm run perf:verify`) and inspect `tests/perf/results/latest.json`
- [ ] If `baseline.json` exists and regression threshold is exceeded, the script should exit non-zero

## 5. Update Documentation
- [ ] Update `tests/perf/README.md` to document:
  - How to interpret `latest.json`
  - How to record a new `baseline.json` (manual review required)
  - CI guidance for adding `perf:verify` as an optional/nightly check

## 6. Automated Verification
- [ ] The `scripts/verify-dag-perf.js` script must be usable by CI and should:
  - exit non-zero on regression
  - print machine-identifying metadata (node version, os) and attach `latest.json` as artifact in CI
  - be idempotent and safe to run repeatedly (doesn't mutate source files)
