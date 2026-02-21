# Task: Implement Final Validation Report Generator (Sub-Epic: 07_Project Handover)

## Covered Requirements
- [4_USER_FEATURES-REQ-087]

## 1. Initial Test Written
- [ ] In `src/export/__tests__/validation-report.test.ts`, write unit and integration tests:
  - **Unit – RTI calculation**: Given a mock set of requirements (total: 20, covered: 18), assert `calculateRTI()` returns `0.9` and the report section lists the 2 uncovered requirement IDs.
  - **Unit – Test-suite summary**: Given mock Jest/Pytest JSON output (e.g., `{ numPassedTests: 95, numFailedTests: 2, … }`), assert `summariseTestResults(rawOutput)` returns a typed `TestSummary` object with `passed`, `failed`, `skipped`, and `coverage` fields.
  - **Unit – Requirement-to-task mapping**: Given a mock `devs.db` with `tasks` and `requirements` tables linked by `task_requirements`, assert `buildTraceabilityMatrix(db)` returns a map where every requirement ID points to one or more task IDs.
  - **Unit – Report serialisation**: Assert `renderReport(reportData)` produces valid Markdown containing headings: `# Final Validation Report`, `## Requirement Traceability Index`, `## Test Suite Summary`, `## Failed Requirements`, `## Archive Manifest`.
  - **Integration**: Point the function at a real fixture project directory (in `src/export/__fixtures__/sample-project/`) containing a prepopulated `devs.db` and stub test output JSON; assert the returned report string contains the correct RTI percentage and all expected sections.

## 2. Task Implementation
- [ ] Create `src/export/validation-report.ts` exporting:
  - `calculateRTI(db: Database): { index: number; covered: string[]; uncovered: string[] }` — queries the `requirements` table joined with `task_requirements` to compute the Requirement Traceability Index.
  - `summariseTestResults(rawTestOutput: string): TestSummary` — parses the JSON test runner output (support Jest JSON reporter format and Pytest JSON report format; detect by structure).
  - `buildTraceabilityMatrix(db: Database): Map<string, string[]>` — returns a map of `requirementId → taskId[]`.
  - `renderReport(data: ValidationReportData): string` — assembles the full Markdown report from the above data structures.
- [ ] Define `ValidationReportData` and `TestSummary` TypeScript interfaces in `src/export/types.ts`.
- [ ] Create `src/export/__fixtures__/sample-project/devs.db` as a minimal SQLite database with at least 5 requirements and 3 tasks for use in integration tests.
- [ ] Create `src/export/__fixtures__/sample-project/test-results.json` with a representative Jest JSON output structure.

## 3. Code Review
- [ ] Confirm `calculateRTI` uses a single SQL JOIN query rather than loading full tables into memory.
- [ ] Confirm `renderReport` does not perform any I/O — it must be a pure function taking data and returning a string.
- [ ] Confirm all exported functions are pure or take explicit dependency-injected parameters (no module-level singletons).
- [ ] Confirm the Markdown output of `renderReport` passes a Markdown lint check (`markdownlint` or equivalent) with no errors.
- [ ] Verify TypeScript strict mode is satisfied (no `any` types in public API surface).

## 4. Run Automated Tests to Verify
- [ ] Run `npm test -- --testPathPattern="validation-report"` and confirm all tests pass.
- [ ] Run `npm run type-check` (or `tsc --noEmit`) and confirm no type errors are introduced.

## 5. Update Documentation
- [ ] Add a section `docs/export/validation-report.md` describing the report format, all sections, and how RTI is computed.
- [ ] Update `docs/agent-memory/phase_15.md` noting that the validation report generator is implemented and the SQLite schema fields it depends on.

## 6. Automated Verification
- [ ] Run the integration test with coverage: `npm test -- --testPathPattern="validation-report" --coverage` and assert `validation-report.ts` has ≥ 90% line coverage in the output.
- [ ] Execute a smoke test by calling the report generator directly against the fixture: `node -e "const {renderReport}=require('./dist/export/validation-report'); console.log(renderReport.toString())"` and assert it does not throw.
