# Task: Implement Operational Metrics Benchmark Runner & Report (Sub-Epic: 26_Benchmarking Suite Operational Metrics)

## Covered Requirements
- [9_ROADMAP-REQ-041], [1_PRD-REQ-MET-004], [1_PRD-REQ-MET-013]

## 1. Initial Test Written
- [ ] Create `src/benchmarks/__tests__/operational-metrics-runner.test.ts`.
- [ ] Write a unit test `runOperationalMetrics aggregates AOD density, AFS folder, AFS dependency, and approval latency results into a single OperationalMetricsReport object` by mocking all four sub-benchmark functions (`scanAodDensity`, `compareFolderStructure`, `compareDependencyGraph`, `getApprovalLatencyStats`) with canned return values; assert the report contains `aodDensity`, `afsFolderStructure`, `afsDependencyGraph`, and `approvalLatency` keys.
- [ ] Write a unit test `runOperationalMetrics sets overallPass=true only when all sub-benchmarks pass their targets`.
- [ ] Write a unit test `runOperationalMetrics sets overallPass=false when any single sub-benchmark fails its target`.
- [ ] Write a unit test `formatOperationalMetricsReport returns a valid JSON string containing all metric keys`.
- [ ] Write a unit test `formatOperationalMetricsReport returns a Markdown table string when format="markdown"` asserting the output contains `| Metric |` and a row for `AOD Density`.
- [ ] Use `vitest` with `vi.mock` for all sub-benchmark modules.

## 2. Task Implementation
- [ ] Create `src/benchmarks/operational-metrics-runner.ts`.
- [ ] Define and export the top-level report interface:
  ```ts
  export interface OperationalMetricsReport {
    generatedAt: string;          // ISO 8601 timestamp
    aodDensity: AodDensityResult;
    afsFolderStructure: AfsFolderResult;
    afsDependencyGraph: AfsDependencyResult;
    approvalLatency: ApprovalLatencyStats;
    overallPass: boolean;         // true iff all sub-benchmarks pass their targets
  }
  ```
- [ ] Implement `async function runOperationalMetrics(opts: { projectRoot: string; db: Database; tasFolderSpec: AfsFolderSpec; tasDependencySpec: AfsDependencySpec; }): Promise<OperationalMetricsReport>`:
  1. Run all four sub-benchmarks in parallel using `Promise.all([...])`.
  2. Compute `overallPass = aod.passesTarget && afsFolder.passesTarget && afsDep.passesTarget` (note: `ApprovalLatencyStats` has no `passesTarget`; approval latency is informational only in this runner—do not gate `overallPass` on it).
  3. Return the `OperationalMetricsReport`.
- [ ] Implement `function formatOperationalMetricsReport(report: OperationalMetricsReport, format: 'json' | 'markdown' = 'json'): string`:
  - For `'json'`: return `JSON.stringify(report, null, 2)`.
  - For `'markdown'`: return a GFM table with columns `| Metric | Value | Target | Pass |` containing one row each for AOD Density ratio, AFS Folder variance%, AFS Dependency variance%, and Approval Latency avg ms.
- [ ] Wire the runner into the existing CLI command `devs benchmark` (if it exists) or create a new `devs benchmark operational` subcommand in `src/cli/commands/benchmark.ts` that calls `runOperationalMetrics` and prints the markdown report.
- [ ] Add `export { runOperationalMetrics, formatOperationalMetricsReport } from './operational-metrics-runner';` to `src/benchmarks/index.ts`.
- [ ] Add `// [9_ROADMAP-REQ-041] [1_PRD-REQ-MET-004] [1_PRD-REQ-MET-013]` traceability comments at top of file below imports.

## 3. Code Review
- [ ] Confirm all four sub-benchmarks are run with `Promise.all` (not sequentially) to minimize total benchmark latency.
- [ ] Confirm `overallPass` does NOT gate on `approvalLatency` (approval latency is a measurement KPI, not a pass/fail gate at this stage).
- [ ] Confirm the markdown output contains exactly four metric rows and a header row.
- [ ] Confirm `generatedAt` is an ISO 8601 string (use `new Date().toISOString()`).
- [ ] Confirm all three traceability comments are present.

## 4. Run Automated Tests to Verify
- [ ] Run `npx vitest run src/benchmarks/__tests__/operational-metrics-runner.test.ts` and confirm all tests pass with zero failures.
- [ ] Run `npx tsc --noEmit` and confirm zero TypeScript compiler errors.
- [ ] Run `npx vitest run src/benchmarks/__tests__/` (the full benchmarks test suite) and confirm all tests across all benchmark test files pass.

## 5. Update Documentation
- [ ] Create `src/benchmarks/operational-metrics-runner.agent.md` documenting:
  - Purpose: top-level runner that executes all operational metric benchmarks and produces a unified `OperationalMetricsReport`.
  - Requirements covered: `[9_ROADMAP-REQ-041]`, `[1_PRD-REQ-MET-004]`, `[1_PRD-REQ-MET-013]`.
  - `overallPass` semantics: true only when AOD density = 1:1 AND AFS folder variance < 5% AND AFS dependency variance < 5%.
  - CLI usage: `devs benchmark operational [--format json|markdown]`.
- [ ] Update `docs/benchmarks/README.md` with a top-level "Operational Metrics Runner" section summarizing all four metrics, their thresholds, and the `overallPass` gating logic.

## 6. Automated Verification
- [ ] Run `npx vitest run src/benchmarks/__tests__/ --reporter=verbose 2>&1 | grep -E "Tests|PASS|FAIL"` and confirm all benchmark tests pass.
- [ ] Run `grep -rn "9_ROADMAP-REQ-041\|1_PRD-REQ-MET-004\|1_PRD-REQ-MET-013" src/benchmarks/ | grep -v ".test.ts" | grep -v ".agent.md"` and confirm at least one non-test, non-doc source file contains each of the three requirement IDs.
