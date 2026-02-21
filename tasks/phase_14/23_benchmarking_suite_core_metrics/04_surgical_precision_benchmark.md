# Task: Surgical Precision Benchmark for surgical_edit Tool (Sub-Epic: 23_Benchmarking Suite Core Metrics)

## Covered Requirements
- [9_ROADMAP-REQ-022]

## 1. Initial Test Written
- [ ] Create `src/benchmarking/__tests__/suites/SurgicalPrecisionSuite.test.ts`.
- [ ] Write a test asserting `SurgicalPrecisionSuite` implements `IBenchmarkSuite` with `name === 'SurgicalPrecisionSuite'` and `requirmentIds` containing `'9_ROADMAP-REQ-022'`.
- [ ] Write a test asserting `execute()` loads the "Large File Refactor" fixture (`largeFileRefactor.fixture.ts`) and applies the edit plan to it.
- [ ] Write a test asserting that when `surgical_edit` is given a valid edit plan with exactly 20 non-contiguous edits, the suite reports `metrics.editsApplied === 20` and `metrics.syntaxErrors === 0`.
- [ ] Write a test asserting `status === 'pass'` when `editsApplied >= 20 && syntaxErrors === 0`.
- [ ] Write a test asserting `status === 'fail'` when the output file contains at least one syntax error (simulate by injecting a bad edit).
- [ ] Write a test asserting `status === 'fail'` when fewer than 20 edits were successfully applied.

## 2. Task Implementation
- [ ] Create `src/benchmarking/fixtures/largeFileRefactor.fixture.ts`:
  - A TypeScript source file ≥ 500 lines containing at minimum 20 syntactically distinct, non-contiguous edit targets spread throughout the file (e.g., variable renames, function signature changes, import reordering, comment updates, type annotation changes).
  - Each edit target must be on a non-adjacent line (minimum 5-line gap between consecutive targets).
- [ ] Create `src/benchmarking/fixtures/largeFileRefactor.editPlan.json`:
  - A JSON array of exactly 20 edit descriptors, each with shape `{ "targetLine": number; "oldText": string; "newText": string; "description": string }` corresponding to the 20 edit targets in the fixture file.
- [ ] Create `src/benchmarking/fixtures/largeFileRefactor.expected.ts`:
  - The fixture file with all 20 edits pre-applied; used as ground-truth for diff comparison.
- [ ] Create `src/benchmarking/suites/SurgicalPrecisionSuite.ts` implementing `IBenchmarkSuite`:
  - `name = 'SurgicalPrecisionSuite'`
  - `requirmentIds = ['9_ROADMAP-REQ-022']`
  - `execute()`:
    1. Load fixture source from `largeFileRefactor.fixture.ts` into memory (do not modify the file on disk; copy to a temp path).
    2. Load `largeFileRefactor.editPlan.json`.
    3. Call `surgical_edit(tempFilePath, editPlan)` (import from the `tools/surgical_edit` module).
    4. Read the result file and count `editsApplied` by diffing against the original (lines changed matching expected targets).
    5. Run TypeScript syntax validation on the result file using `ts.createSourceFile()` and check `diagnostics` for syntax errors; record `syntaxErrors` count.
    6. Diff the result file against `largeFileRefactor.expected.ts` to compute `matchScore` (0.0–1.0; 1.0 = perfect match).
    7. Return `SuiteResult` with `metrics: { editsApplied, syntaxErrors, matchScore, totalEditsRequested: 20 }`.
    8. `status = editsApplied >= 20 && syntaxErrors === 0 ? 'pass' : 'fail'`.
    9. Include `details`: `"Applied {editsApplied}/20 edits. Syntax errors: {syntaxErrors}. Match score: {matchScore:.2f}"`.
- [ ] Register `SurgicalPrecisionSuite` in `src/benchmarking/index.ts`.
- [ ] Clean up the temporary file in a `finally` block after the suite completes.

## 3. Code Review
- [ ] Verify the suite never modifies the original fixture file (always works on a temp copy).
- [ ] Verify `ts.createSourceFile()` is used with `ts.ScriptTarget.Latest` and `/* setParentNodes */ true`; check `sourceFile.parseDiagnostics` for syntax errors.
- [ ] Verify the diff algorithm correctly identifies non-contiguous edits (do not simply compare line counts).
- [ ] Verify the temp file is created in `os.tmpdir()` with a unique suffix to avoid conflicts in parallel test runs.

## 4. Run Automated Tests to Verify
- [ ] Run `npm test -- --testPathPattern="src/benchmarking/__tests__/suites/SurgicalPrecisionSuite"` and confirm all tests pass.
- [ ] Run `npm run build` and confirm zero TypeScript errors.

## 5. Update Documentation
- [ ] Create `src/benchmarking/suites/surgical-precision.agent.md` documenting: how to extend the edit plan, how the fixture is structured, what "non-contiguous" means in this context, and the pass/fail criteria.

## 6. Automated Verification
- [ ] Run `npm test -- --testPathPattern="src/benchmarking/__tests__/suites/SurgicalPrecisionSuite" --coverage` and confirm ≥ 90% line coverage for `SurgicalPrecisionSuite.ts`.
- [ ] Run `node -e "const p = require('./src/benchmarking/fixtures/largeFileRefactor.editPlan.json'); console.assert(p.length >= 20, 'Edit plan too small'); console.log('Edit plan OK:', p.length, 'edits')"` and confirm no assertion error.
- [ ] Run `npx tsc --noEmit` and confirm zero errors.
