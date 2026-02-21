# Task: Implement Global Validation Phase Runner (Sub-Epic: 21_TDD and Global Validation Enforcement)

## Covered Requirements
- [9_ROADMAP-REQ-042]

## 1. Initial Test Written
- [ ] In `src/validation/__tests__/globalValidationRunner.test.ts`, write unit and integration tests for a `GlobalValidationRunner` class:
  - Test: `run()` reads all requirement IDs from `requirements.md` and cross-references each one against the task artifact store, returning a `ValidationReport` object.
  - Test: `run()` marks a requirement as `covered` when at least one task artifact references that requirement ID in its `coveredRequirements` field.
  - Test: `run()` marks a requirement as `uncovered` when no task artifact references it.
  - Test: `run()` marks a requirement as `failing` when it is referenced in a task whose test suite has a recorded failure.
  - Test: `ValidationReport.passRate` equals `coveredCount / totalCount` as a float between 0 and 1.
  - Test: `run()` throws `ValidationAbortError` if it cannot read `requirements.md` (file not found).
  - Test: `generateMarkdownReport(report)` produces a GFM markdown string with a summary table listing each requirement ID, its status, and the covering task IDs.
  - All tests must initially FAIL (Red phase).

## 2. Task Implementation
- [ ] Create `src/validation/globalValidationRunner.ts`:
  - Define interfaces: `RequirementStatus = 'covered' | 'uncovered' | 'failing'`, `RequirementResult { id: string; status: RequirementStatus; coveringTaskIds: string[] }`, `ValidationReport { results: RequirementResult[]; passRate: number; generatedAt: string }`.
  - Define `ValidationAbortError extends Error`.
  - Implement `GlobalValidationRunner`:
    - Constructor accepts `requirementsPath: string` (default: `'requirements.md'`) and `artifactStore: ArtifactStore` (interface from existing task artifact layer).
    - `async run(): Promise<ValidationReport>`:
      1. Parse `requirements.md` to extract all `[REQ_ID]` headings using a regex: `/###\s+\*\*\[([^\]]+)\]\*\*/g`.
      2. Query `artifactStore.getAll()` to get all completed task artifacts.
      3. For each requirement ID, find artifacts that include that ID in their `coveredRequirements` array.
      4. If a covering artifact's task has a recorded test failure, mark as `failing`; if covered with no failures, mark as `covered`; otherwise `uncovered`.
      5. Compute `passRate = coveredCount / totalCount` (treat `failing` as not passing).
      6. Return `ValidationReport` with `generatedAt: new Date().toISOString()`.
    - `generateMarkdownReport(report: ValidationReport): string`: produce a GFM table with columns `| Req ID | Status | Covering Tasks |`.
- [ ] Create `src/validation/index.ts` that re-exports `GlobalValidationRunner`, `ValidationReport`, `ValidationAbortError`.

## 3. Code Review
- [ ] Confirm the regex for extracting requirement IDs from `requirements.md` is tested against the actual file format (e.g., `### **[1_PRD-REQ-PIL-003]**`).
- [ ] Confirm `passRate` calculation uses integer division-safe float arithmetic.
- [ ] Confirm `ValidationAbortError` is distinct from generic `Error` so callers can `catch (e) { if (e instanceof ValidationAbortError) ... }`.
- [ ] Confirm there are no hardcoded requirement IDs inside `globalValidationRunner.ts`; all IDs must be dynamically parsed from `requirements.md`.
- [ ] Confirm TypeScript strict mode is satisfied.

## 4. Run Automated Tests to Verify
- [ ] Run `npm test -- --testPathPattern="globalValidationRunner"` and confirm all tests pass.
- [ ] Run `npx tsc --noEmit` and confirm exit code is `0`.

## 5. Update Documentation
- [ ] Create `src/validation/globalValidationRunner.agent.md` documenting:
  - Purpose: performs a full project requirement audit at the end of the implementation phase.
  - How requirement IDs are parsed from `requirements.md`.
  - `ValidationReport` schema.
  - How to interpret `passRate` and `RequirementStatus` values.
  - Example CLI invocation and expected markdown output.
- [ ] Add `globalValidationRunner.agent.md` reference to the root `AGENTS.md` AOD index.

## 6. Automated Verification
- [ ] Run `npm test -- --testPathPattern="globalValidationRunner" --coverage` and confirm:
  - All tests pass.
  - Statement coverage for `globalValidationRunner.ts` is ≥ 95%.
- [ ] Run `npx tsc --noEmit` and confirm exit code is `0`.
- [ ] Run `node -e "require('./dist/validation').GlobalValidationRunner" 2>&1 | grep -v Error` to confirm the compiled module exports are resolvable.
- [ ] Confirm `src/validation/globalValidationRunner.agent.md` exists: `test -f src/validation/globalValidationRunner.agent.md && echo "AOD OK"`.
