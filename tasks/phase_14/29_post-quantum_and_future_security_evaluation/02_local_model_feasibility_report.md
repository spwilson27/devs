# Task: Local-Only Model Feasibility Evaluation Report (Sub-Epic: 29_Post-Quantum and Future Security Evaluation)

## Covered Requirements
- [5_SECURITY_DESIGN-REQ-SEC-QST-001]

## 1. Initial Test Written
- [ ] In `src/evaluation/__tests__/local-model-feasibility.test.ts`, write unit tests that:
  - Assert `LocalModelFeasibilityReport` is a well-typed data class with fields: `supportedRuntimes: string[]`, `performanceBenchmarks: BenchmarkResult[]`, `securityTrustReduction: TrustReductionSummary`, `enterpriseAdoptionBarriers: string[]`, `recommendation: 'adopt' | 'defer' | 'reject'`, `generatedAt: Date`.
  - Assert the `generateFeasibilityReport(config)` function returns a `LocalModelFeasibilityReport` and never throws when given valid inputs.
  - Assert `generateFeasibilityReport` calls `LocalModelProvider.healthCheck()` and records the result in `supportedRuntimes`.
  - Assert that `performanceBenchmarks` contains at least one entry for latency (ms/token) measured by `benchmarkLatency()`.
  - Assert `securityTrustReduction.eliminatesExternalApiKey` is `true` when provider is `'local'`.
  - Assert the report serializes to valid JSON with `JSON.stringify(report)`.
  - Assert the report can be written to `docs/evaluations/local-model-feasibility.json` via `writeFeasibilityReport(report, outputPath)`.
  - Write a test that the `recommendation` field is set to `'adopt'` when health check passes and median latency < 2000ms.
  - Write a test that `recommendation` is `'defer'` when median latency >= 2000ms.

## 2. Task Implementation
- [ ] Create `src/evaluation/local-model-feasibility.ts`:
  - Define TypeScript interfaces: `BenchmarkResult`, `TrustReductionSummary`, `LocalModelFeasibilityReport`.
  - Implement `benchmarkLatency(provider: IModelProvider, samplePrompt: string, runs: number): Promise<BenchmarkResult>` — sends `runs` completions and records min/median/p95 latency in ms.
  - Implement `generateFeasibilityReport(config: LocalModelConfig): Promise<LocalModelFeasibilityReport>` — orchestrates health check, latency benchmark, and trust reduction analysis.
  - Set `recommendation` based on: health check passed AND median latency < 2000ms → `'adopt'`; health passed but slow → `'defer'`; health failed → `'reject'`.
  - Add `// REQ: 5_SECURITY_DESIGN-REQ-SEC-QST-001` comment at top of file.
- [ ] Create `src/evaluation/write-feasibility-report.ts`:
  - Implement `writeFeasibilityReport(report: LocalModelFeasibilityReport, outputPath: string): Promise<void>` using `fs/promises.writeFile` with formatted JSON.
  - Ensure the output directory is created with `fs/promises.mkdir({ recursive: true })`.
- [ ] Add a CLI subcommand `devs evaluate local-model` in `src/cli/commands/evaluate.ts` that:
  - Reads `local` config from `devs.config.json`.
  - Calls `generateFeasibilityReport` and `writeFeasibilityReport`.
  - Prints a summary table to stdout.
- [ ] Commit an initial placeholder report at `docs/evaluations/local-model-feasibility.json` with schema version and `"status": "pending"`.

## 3. Code Review
- [ ] Verify `benchmarkLatency` uses wall-clock time (`performance.now()`) not CPU time.
- [ ] Verify `generateFeasibilityReport` does not make any calls to cloud AI endpoints — only to the configured local endpoint.
- [ ] Verify the CLI command gracefully degrades if no `local` config exists (prints actionable error, exits with code 1).
- [ ] Verify output JSON is deterministically ordered (sort keys) for reproducible diffs in version control.
- [ ] Verify TypeScript strict mode compliance; no `any`.

## 4. Run Automated Tests to Verify
- [ ] Run `npm test -- --testPathPattern="local-model-feasibility"` and confirm all tests pass.
- [ ] Run `npx ts-node src/cli/index.ts evaluate local-model --dry-run` (using a mocked provider) and confirm a JSON report is written to `docs/evaluations/local-model-feasibility.json`.
- [ ] Run `npm run typecheck` — zero errors.
- [ ] Run `npm run lint` — zero warnings/errors.

## 5. Update Documentation
- [ ] Create `docs/evaluations/local-model-feasibility.md` summarizing the evaluation methodology, criteria, and how to re-run (`devs evaluate local-model`).
- [ ] Create `src/evaluation/local-model-feasibility.agent.md` (AOD file) documenting inputs, outputs, and recommendation logic.
- [ ] Update `docs/security.md` to reference the feasibility report as evidence of `[5_SECURITY_DESIGN-REQ-SEC-QST-001]` fulfillment.
- [ ] Add changelog entry: `feat: local-model feasibility evaluation report and CLI command (REQ-SEC-QST-001)`.

## 6. Automated Verification
- [ ] Run `npm run validate-all` and confirm exit code 0.
- [ ] Run `node -e "const r = require('./docs/evaluations/local-model-feasibility.json'); console.assert(r.schemaVersion, 'missing schemaVersion')"` — no assertion error.
- [ ] Run `grep -r "REQ-SEC-QST-001" src/evaluation/` — confirm at least one match.
- [ ] Run `npm run test:coverage -- --testPathPattern="local-model-feasibility"` — line coverage ≥ 90%.
