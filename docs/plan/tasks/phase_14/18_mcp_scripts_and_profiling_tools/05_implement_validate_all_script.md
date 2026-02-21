# Task: Implement `validate-all` Script to Run the Full Verification Suite (Sub-Epic: 18_MCP Scripts and Profiling Tools)

## Covered Requirements
- [2_TAS-REQ-014]

## 1. Initial Test Written

- [ ] Create `scripts/__tests__/validate-all.test.ts`.
- [ ] Write a unit test that mocks `child_process` (or `execa`) and verifies that running `validateAll()` (exported function) sequentially calls lint (`eslint`), build (`tsc --noEmit` or `npm run build`), and test (`npm test`) sub-commands in exactly that order, and returns `{ passed: true, results: [...] }` when all three exit with code `0`.
- [ ] Write a unit test verifying that if the lint step fails (mocked exit code `1`), `validateAll()` returns `{ passed: false, results: [{ step: 'lint', exitCode: 1, stdout: '...', stderr: '...' }] }` and does NOT proceed to the build or test steps (fail-fast behavior).
- [ ] Write a unit test verifying that `validateAll({ failFast: false })` continues running all steps even if an earlier step fails, accumulating all results.
- [ ] Write a unit test verifying the final JSON report written to `.devs/validation/validate-all-<ISO_TIMESTAMP>.json` contains the full results array and a `summary.passed` boolean.
- [ ] Write an integration test that spawns `node scripts/validate-all.js --dry-run` and verifies it exits `0` and prints a JSON summary to stdout listing the three steps (`lint`, `build`, `test`) with their status as `skipped` (due to dry-run).
- [ ] All tests must fail before implementation (red phase confirmed).

## 2. Task Implementation

- [ ] Create `scripts/validate-all.ts` exporting `validateAll(options?: ValidateAllOptions): Promise<ValidateAllReport>` and providing a CLI entry point when run directly (`if (require.main === module) { ... }`).
- [ ] Define interfaces:
  ```ts
  // [2_TAS-REQ-014]
  export interface ValidateAllOptions {
    failFast?: boolean;       // Default: true
    dryRun?: boolean;         // Default: false
    projectRoot?: string;     // Default: process.cwd()
  }

  export interface StepResult {
    step: 'lint' | 'build' | 'test';
    exitCode: number;
    stdout: string;
    stderr: string;
    durationMs: number;
  }

  export interface ValidateAllReport {
    passed: boolean;
    ranAt: string;            // ISO timestamp
    results: StepResult[];
    summary: { lint: 'pass' | 'fail' | 'skip'; build: 'pass' | 'fail' | 'skip'; test: 'pass' | 'fail' | 'skip' };
  }
  ```
- [ ] Implement the three steps in order:
  1. **Lint**: `npx eslint . --ext .ts,.tsx --max-warnings=0`
  2. **Build**: `npx tsc --noEmit`
  3. **Test**: `npm test -- --ci --forceExit`
- [ ] For each step, capture `stdout`, `stderr`, `exitCode`, and measure `durationMs` using `performance.now()` before/after the call.
- [ ] Respect `failFast` (default `true`): break out of the step loop on first non-zero exit code and mark remaining steps as `skip`.
- [ ] In `dryRun` mode, skip actual command execution; log the command that would be run and record `{ exitCode: 0, status: 'skipped' }` for all steps.
- [ ] After all steps, write the `ValidateAllReport` to `.devs/validation/validate-all-<ISO_TIMESTAMP>.json` using `fs.writeFileSync` (create directory with `{ recursive: true }`).
- [ ] Print the report JSON to stdout (so CI pipelines can capture it).
- [ ] Parse CLI flags: `--fail-fast` / `--no-fail-fast`, `--dry-run`, `--project-root=<path>`.
- [ ] Exit with code `0` if `report.passed === true`, `1` otherwise.
- [ ] Add `// [2_TAS-REQ-014]` requirement tracing comment at the top.
- [ ] Add `"validate-all": "node scripts/validate-all.js"` to the `scripts` section of `package.json`.

## 3. Code Review

- [ ] Verify that `failFast: true` (the default) guarantees no step runs after a failure, preventing misleading partial results.
- [ ] Verify the output JSON report is always written even when `passed === false`, so failures are persisted for post-mortem analysis.
- [ ] Confirm the three sub-commands are derived from the project's actual npm scripts (not hardcoded CLI tool names), so they remain consistent with future toolchain changes.
- [ ] Verify `dryRun` prevents any mutations (no test database changes, no compilation artifacts written).
- [ ] Confirm timestamps are in ISO 8601 UTC format for the report filename and `ranAt` field.

## 4. Run Automated Tests to Verify

- [ ] Run `npm test -- --testPathPattern="validate-all"` and confirm all tests pass.
- [ ] Run `npm run build` to confirm TypeScript compiles without errors.
- [ ] Run `node scripts/validate-all.js --dry-run` and confirm: exit code `0`, JSON output on stdout contains `{ passed: true, summary: { lint: 'skip', build: 'skip', test: 'skip' } }`.
- [ ] Run `node scripts/validate-all.js` (non-dry-run) in CI and confirm the full suite passes and the report file is written under `.devs/validation/`.

## 5. Update Documentation

- [ ] Create `scripts/validate-all.agent.md` documenting: purpose, CLI flags, `ValidateAllReport` JSON schema, report file location, exit codes, and CI integration guidance.
- [ ] Update `README.md` (or `docs/scripts.md`) to include a "Running the Full Verification Suite" section with example usage and expected output.
- [ ] Update `package.json` `devs` section (per `[TAS-006]`) to reference this script under `scripts.validateAll`.
- [ ] Add a note in the devs TDD guide (`docs/tdd-guide.md` or equivalent) showing agents should call `validate-all` after each phase to confirm no regressions.

## 6. Automated Verification

- [ ] Run `npm test -- --testPathPattern="validate-all" --coverage` and verify ≥ 90% line coverage for `scripts/validate-all.ts`.
- [ ] Run `npx tsc --noEmit` and verify exit code `0`.
- [ ] Run `node scripts/validate-all.js --dry-run` and pipe output to `node -e "const r=JSON.parse(require('fs').readFileSync('/dev/stdin','utf8')); if(!r.passed||r.summary.lint!=='skip')process.exit(1)"` to machine-verify the dry-run report schema.
- [ ] Confirm the timestamped `.devs/validation/validate-all-*.json` report file is created on a real (non-dry-run) execution by checking `ls .devs/validation/ | grep validate-all` returns at least one match.
