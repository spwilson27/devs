# Task: Implement TDD Fidelity Benchmark and Global Validation Report in CI (Sub-Epic: 21_TDD and Global Validation Enforcement)

## Covered Requirements
- [1_PRD-REQ-PIL-003], [9_ROADMAP-REQ-042]

## 1. Initial Test Written
- [ ] In `src/validation/__tests__/tddFidelityBenchmark.test.ts`, write unit and integration tests:
  - Test: `TDDFidelityBenchmark.compute(taskArtifacts)` returns a `FidelityReport` where `score` equals the percentage of tasks that completed all three TDD phases (red, green, refactor) in the correct order.
  - Test: A task with phases recorded out of order (green before red) is counted as `non_compliant`.
  - Test: A task with all three phases recorded in order is counted as `compliant`.
  - Test: `FidelityReport.score` is `1.0` when all tasks are `compliant`.
  - Test: `FidelityReport.score` is `0.0` when no tasks are `compliant`.
  - Test: `generateCIAnnotation(report)` returns a string in the GitHub Actions annotation format (`::warning` or `::error`) when `score < 1.0`, and an empty string when `score === 1.0`.
  - Test: The CI integration script exits with code `1` when `FidelityReport.score < 1.0`.
  - All tests must initially FAIL (Red phase).

## 2. Task Implementation
- [ ] Create `src/validation/tddFidelityBenchmark.ts`:
  - Define `TDDComplianceStatus = 'compliant' | 'non_compliant' | 'incomplete'`.
  - Define `FidelityReport { totalTasks: number; compliantCount: number; score: number; nonCompliantTaskIds: string[] }`.
  - Implement `TDDFidelityBenchmark`:
    - `compute(taskArtifacts: TaskArtifact[]): FidelityReport`:
      1. For each artifact, inspect its `tddPhaseLog: Array<{ phase: TDDPhase; recordedAt: string }>`.
      2. A task is `compliant` if the log contains `red`, then `green`, then `refactor` in strictly ascending `recordedAt` order.
      3. Compute `score = compliantCount / totalTasks`.
    - `generateCIAnnotation(report: FidelityReport): string`:
      - If `score === 1.0`, return `''`.
      - If `score < 0.8`, return a `::error` annotation listing `nonCompliantTaskIds`.
      - If `score >= 0.8`, return a `::warning` annotation.
- [ ] Create `src/scripts/ciValidateAll.ts`:
  - Run `GlobalValidationRunner.run()` and `TDDFidelityBenchmark.compute()` in parallel.
  - Print the markdown requirement audit report to stdout.
  - Print the `FidelityReport` summary to stdout.
  - Print any CI annotations (from `generateCIAnnotation`) to stdout (GitHub Actions will parse them).
  - Exit with `1` if either `ValidationReport.passRate < 1.0` or `FidelityReport.score < 1.0`.
  - Exit with `0` only if both pass.
- [ ] Add `"ci:validate": "ts-node src/scripts/ciValidateAll.ts"` to `package.json` scripts.

## 3. Code Review
- [ ] Confirm `TDDFidelityBenchmark.compute` does not mutate the input `taskArtifacts` array.
- [ ] Confirm `generateCIAnnotation` only produces GitHub Actions annotation syntax; it must not throw on edge cases (empty array, all compliant, none compliant).
- [ ] Confirm `ciValidateAll.ts` uses `Promise.all` for parallelism and handles individual rejections without short-circuiting the other check.
- [ ] Confirm the exit code logic is exhaustive: the script always exits via `process.exit`, never falls off the end of the script.
- [ ] Ensure TypeScript strict mode is satisfied.

## 4. Run Automated Tests to Verify
- [ ] Run `npm test -- --testPathPattern="tddFidelityBenchmark"` and confirm all tests pass.
- [ ] Run `npx tsc --noEmit` and confirm exit code is `0`.
- [ ] Run `npm run ci:validate` in a test environment with a mock artifact store and confirm the exit code and stdout match expected output.

## 5. Update Documentation
- [ ] Create `src/validation/tddFidelityBenchmark.agent.md` documenting:
  - Purpose: measures TDD process compliance across all completed tasks.
  - `FidelityReport` schema and `score` interpretation.
  - `generateCIAnnotation` output format and thresholds.
- [ ] Update CI pipeline documentation (`.github/workflows/README.md` or equivalent) to include the `ci:validate` step and its meaning.
- [ ] Add `tddFidelityBenchmark.agent.md` to the root `AGENTS.md` AOD index.

## 6. Automated Verification
- [ ] Run `npm test -- --testPathPattern="tddFidelityBenchmark" --coverage` and confirm all tests pass with ≥ 95% statement coverage on `tddFidelityBenchmark.ts`.
- [ ] Run `npx tsc --noEmit` and confirm exit code is `0`.
- [ ] Confirm `ci:validate` script is in `package.json`: `node -e "const p=require('./package.json'); process.exit(p.scripts['ci:validate'] ? 0 : 1)"`.
- [ ] Confirm `src/validation/tddFidelityBenchmark.agent.md` exists: `test -f src/validation/tddFidelityBenchmark.agent.md && echo "AOD OK"`.
