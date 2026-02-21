# Task: Build KPI Aggregation Dashboard for Sandbox and Entropy Metrics (Sub-Epic: 28_Sandbox Provisioning and Entropy KPIs)

## Covered Requirements
- [1_PRD-REQ-MET-009], [1_PRD-REQ-MET-016], [9_ROADMAP-REQ-044], [9_ROADMAP-REQ-046], [1_PRD-REQ-GOAL-006]

## 1. Initial Test Written
- [ ] In `src/dashboard/__tests__/kpi-aggregator.test.ts`, write unit tests for a `KpiAggregator` class:
  - `describe('KpiAggregator.getSandboxProvisioningReport()')`:
    - Mock `SandboxProvisioningKPI` to return synthetic rows; assert the report includes `p95LatencyDocker`, `p95LatencyWebcontainer`, `slaBreachCount`, `totalProvisions`.
    - Assert `slaStatus` is `'green'` when `p95LatencyDocker < 30_000` and `p95LatencyWebcontainer < 10_000`.
    - Assert `slaStatus` is `'red'` when either threshold is exceeded.
  - `describe('KpiAggregator.getEscapeReport()')`:
    - Mock `SandboxEscapeKPI` to return 0 escapes; assert `{ escapeCount: 0, status: 'green' }`.
    - Mock 1 escape; assert `{ escapeCount: 1, status: 'critical' }`.
  - `describe('KpiAggregator.getEntropyReport()')`:
    - Mock `EntropyDetector` to have fired 2 times in the last hour; assert `{ loopsDetected: 2, avgTurnsToDetection: number }`.
  - `describe('KpiAggregator.getBufferReport()')`:
    - Mock `EntropyBuffer.getUsageReport()`; assert the aggregated report reflects the correct `bufferUtilizationPercent` and `pivotCount`.
  - `describe('KpiAggregator.getFullReport()')`:
    - Assert it combines all four sub-reports into a single `KpiFullReport` object with no missing fields.
- [ ] In `src/dashboard/__tests__/kpi-aggregator.integration.test.ts`:
  - Using a real in-memory SQLite DB with seeded data for provisioning and escape tables, assert `getFullReport()` returns the correct computed values end-to-end.

## 2. Task Implementation
- [ ] Create `src/dashboard/kpi-aggregator.ts`:
  - Export interfaces: `ProvisioningReport`, `EscapeReport`, `EntropyDetectionReport`, `BufferReport`, `KpiFullReport`.
  - Implement `KpiAggregator` that accepts `{ provisioningKpi: SandboxProvisioningKPI; escapeKpi: SandboxEscapeKPI; entropyDetector: EntropyDetector; entropyBuffer: EntropyBuffer }` via constructor.
  - `getSandboxProvisioningReport(): ProvisioningReport`:
    - Calls `provisioningKpi.getP95Latency('docker')` and `provisioningKpi.getP95Latency('webcontainer')`.
    - Queries `sandbox_provisioning_kpis` for `slaBreachCount` and `totalProvisions`.
    - Derives `slaStatus: 'green' | 'yellow' | 'red'` using `SLA_LIMITS` from `provisioning-latency.ts`.
  - `getEscapeReport(): EscapeReport`:
    - Calls `escapeKpi.getEscapeCount()`.
    - Derives `status: 'green' | 'critical'` (critical if count > 0).
  - `getEntropyReport(): EntropyDetectionReport`:
    - Queries an internal in-memory log (maintained by `EntropyDetector`) of past `LoopDetectedPayload` events.
    - Returns `{ loopsDetected: number; avgTurnsToDetection: number; lastLoopAt: Date | null }`.
  - `getBufferReport(): BufferReport`:
    - Calls `entropyBuffer.getUsageReport()`.
    - Computes `bufferUtilizationPercent = ((reservedTokens - remainingBufferTokens) / reservedTokens) * 100`.
    - Returns `{ pivotCount: bufferConsumptionLog.length; bufferUtilizationPercent; remainingBufferTokens; status: 'ok' | 'warning' | 'exhausted' }`.
  - `getFullReport(): KpiFullReport` — composes all four sub-reports.
- [ ] Create `src/dashboard/kpi-renderer.ts`:
  - Implement `renderKpiReport(report: KpiFullReport): string` that produces a human-readable CLI table (using `cli-table3` or plain ASCII) suitable for `devs status` output.
  - Implement `renderKpiReportJson(report: KpiFullReport): string` that returns `JSON.stringify(report, null, 2)`.
- [ ] Wire `KpiAggregator` into the `devs status` CLI command (e.g., `src/cli/commands/status.ts`) so running `devs status --kpis` prints the full KPI report.

## 3. Code Review
- [ ] Verify `KpiAggregator` does not hold mutable state — it reads from KPI objects on each call (no caching that could serve stale data).
- [ ] Confirm `slaStatus` derivation handles edge cases: exactly at threshold (30,000ms) must be `'green'`, not `'red'` (inclusive lower bound, exclusive upper).
- [ ] Ensure `getFullReport()` never partially fails — if one sub-report throws, it must be caught and represented as `{ status: 'error', message }` in the full report rather than crashing the CLI.
- [ ] Verify `renderKpiReport` respects terminal width by clamping detail columns.
- [ ] Confirm requirement comments appear above each method: `// [1_PRD-REQ-MET-009]`, `// [1_PRD-REQ-MET-016]`, `// [9_ROADMAP-REQ-044]`, `// [9_ROADMAP-REQ-046]`, `// [1_PRD-REQ-GOAL-006]`.

## 4. Run Automated Tests to Verify
- [ ] Run `pnpm test src/dashboard/__tests__/kpi-aggregator.test.ts` — all unit tests pass.
- [ ] Run `pnpm test src/dashboard/__tests__/kpi-aggregator.integration.test.ts` — integration tests pass.
- [ ] Run `pnpm tsc --noEmit` — zero TypeScript errors.
- [ ] Run `devs status --kpis` in a local dev environment and confirm the CLI output renders without errors.

## 5. Update Documentation
- [ ] Create `src/dashboard/kpi-aggregator.agent.md` documenting: all four sub-reports, the `KpiFullReport` schema, how to extend with new KPI sources, and the CLI integration point.
- [ ] Update `docs/architecture/kpis.md` with a top-level section "KPI Full Report" showing the composed schema and the `devs status --kpis` command usage.
- [ ] Update `docs/cli/status-command.md` (create if absent) documenting the `--kpis` flag and example output.

## 6. Automated Verification
- [ ] Run `pnpm test --coverage src/dashboard` and confirm coverage ≥ 90% for `kpi-aggregator.ts` and `kpi-renderer.ts`.
- [ ] Run `pnpm run validate-all` and confirm exit code 0.
- [ ] Execute `node -e "const r = require('./dist/dashboard/kpi-aggregator'); console.assert(typeof r.KpiAggregator === 'function', 'KpiAggregator must export a class'); console.log('ok')"` to verify the compiled output exports correctly.
- [ ] Confirm the `devs status --kpis --json` flag outputs valid JSON by piping to `node -e "process.stdin.resume(); let d=''; process.stdin.on('data',c=>d+=c); process.stdin.on('end',()=>{ JSON.parse(d); console.log('valid json'); })"`.
