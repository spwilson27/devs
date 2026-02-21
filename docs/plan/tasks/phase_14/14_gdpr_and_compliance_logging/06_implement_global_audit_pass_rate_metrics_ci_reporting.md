# Task: Implement Global Audit Pass Rate Metric and CI Reporting (Sub-Epic: 14_GDPR and Compliance Logging)

## Covered Requirements
- [9_ROADMAP-REQ-040]

## 1. Initial Test Written
- [ ] Create `src/validation/__tests__/audit-metrics.reporter.test.ts`.
- [ ] Write a unit test for `AuditMetricsReporter.generateReport(auditResults: GlobalAuditResult[])`:
  - Feed three results with `passRate` of `1.0`, `1.0`, and `0.9` and assert the returned report contains: `{ averagePassRate: 0.967, runs: 3, allPassed: false, failedRuns: 1 }` (rounded to 3 decimal places).
  - Assert the returned report object matches the `AuditMetricsReport` interface exactly (use `expect(report).toMatchObject(...)`).
- [ ] Write a unit test for `AuditMetricsReporter.writeJunitXml(report, outputPath)`:
  - Assert the written XML file contains a `<testsuite name="global-audit">` element.
  - Assert `failures` attribute equals the number of `failedRuns` from the report.
  - Assert `tests` attribute equals `report.runs`.
- [ ] Write a unit test that asserts `AuditMetricsReporter.generateReport([])` returns `{ averagePassRate: null, runs: 0, allPassed: true, failedRuns: 0 }`.

## 2. Task Implementation
- [ ] Create `src/validation/audit-metrics.reporter.ts`:
  ```ts
  export interface AuditMetricsReport {
    averagePassRate: number | null;
    runs: number;
    allPassed: boolean;
    failedRuns: number;
    generatedAt: string; // ISO-8601
  }

  @injectable()
  export class AuditMetricsReporter {
    generateReport(results: GlobalAuditResult[]): AuditMetricsReport {
      if (results.length === 0) return { averagePassRate: null, runs: 0, allPassed: true, failedRuns: 0, generatedAt: new Date().toISOString() };
      const failedRuns = results.filter(r => r.passRate < 1.0).length;
      const avg = results.reduce((sum, r) => sum + r.passRate, 0) / results.length;
      return {
        averagePassRate: Math.round(avg * 1000) / 1000,
        runs: results.length,
        allPassed: failedRuns === 0,
        failedRuns,
        generatedAt: new Date().toISOString(),
      };
    }

    writeJunitXml(report: AuditMetricsReport, outputPath: string): void {
      const xml = `<?xml version="1.0" encoding="UTF-8"?>
<testsuites>
  <testsuite name="global-audit" tests="${report.runs}" failures="${report.failedRuns}" timestamp="${report.generatedAt}">
    ${report.failedRuns > 0 ? `<testcase name="global-audit-run"><failure message="Pass rate ${report.averagePassRate} below 1.0"/></testcase>` : '<testcase name="global-audit-run"/>'}
  </testsuite>
</testsuites>`;
      fs.writeFileSync(outputPath, xml, 'utf-8');
    }
  }
  ```
- [ ] Add `--junit-output <path>` option to `devs validate --global` CLI command. If provided, call `AuditMetricsReporter.writeJunitXml(report, path)` after the audit completes.
- [ ] Create `scripts/ci-global-audit.sh`:
  ```sh
  #!/usr/bin/env bash
  set -euo pipefail
  node dist/cli/index.js validate --global --junit-output reports/global-audit.xml
  echo "Global Audit passed. Report written to reports/global-audit.xml"
  ```
  Make it executable (`chmod +x`).
- [ ] Register `AuditMetricsReporter` in the DI container.

## 3. Code Review
- [ ] Confirm `writeJunitXml` uses `fs.writeFileSync` (synchronous) so CI can immediately read the file after the process exits.
- [ ] Confirm `averagePassRate` is rounded to 3 decimal places — not truncated — to avoid floating point misrepresentation in CI dashboards.
- [ ] Confirm `allPassed` is `true` only when `failedRuns === 0`, not when `averagePassRate === 1.0` (edge case: `0` runs should return `allPassed: true` but `averagePassRate: null`).
- [ ] Confirm the JUnit XML structure is compatible with GitHub Actions test reporter format (standard `<testsuites><testsuite>` nesting).

## 4. Run Automated Tests to Verify
- [ ] Run `npm test -- --testPathPattern=audit-metrics.reporter` and confirm all tests pass.
- [ ] Run `npm run lint` and confirm no new errors.
- [ ] Run `npm run build` to confirm TypeScript compilation succeeds.

## 5. Update Documentation
- [ ] Update `docs/global-audit.md` with a section "CI Reporting" explaining: JUnit XML output location, how to configure GitHub Actions to read it, and what `averagePassRate` and `allPassed` mean for the global audit KPI from REQ-040.
- [ ] Add requirement mapping comment to `src/validation/audit-metrics.reporter.ts`: `// REQ: 9_ROADMAP-REQ-040`.
- [ ] Update `CHANGELOG.md`: "feat(validation): add AuditMetricsReporter with JUnit XML output for CI integration".
- [ ] Update `docs/agent-memory/phase_14.agent.md`: note `AuditMetricsReporter` generates JUnit XML at `reports/global-audit.xml`; CI script is `scripts/ci-global-audit.sh`.

## 6. Automated Verification
- [ ] Run `scripts/ci-global-audit.sh` in a test environment and assert exit code 0.
- [ ] Assert `reports/global-audit.xml` exists and validate it against the JUnit XML schema: `xmllint --noout --schema junit.xsd reports/global-audit.xml`.
- [ ] Run `npm test -- --coverage --testPathPattern=audit-metrics.reporter` and confirm line coverage ≥ 90% for `audit-metrics.reporter.ts`.
