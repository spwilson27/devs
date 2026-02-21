# Task: Implement `validate-all` CLI Script for Global Requirement Audit (Sub-Epic: 21_TDD and Global Validation Enforcement)

## Covered Requirements
- [9_ROADMAP-REQ-042]

## 1. Initial Test Written
- [ ] In `src/scripts/__tests__/validateAll.test.ts`, write integration tests for the `validate-all` script:
  - Test: Running `validate-all` with a fully satisfied artifact store exits with code `0` and prints a markdown report to stdout.
  - Test: Running `validate-all` with one or more `uncovered` requirements exits with code `1` and the markdown report lists the uncovered requirement IDs.
  - Test: Running `validate-all` with one or more `failing` requirements exits with code `2` and the markdown report lists the failing requirement IDs.
  - Test: Running `validate-all --output report.md` writes the markdown report to `report.md` on the filesystem instead of stdout.
  - Test: Running `validate-all` when `requirements.md` is missing exits with code `3` and prints a `ValidationAbortError` message to stderr.
  - All tests must initially FAIL (Red phase). Use a mock/stub for `GlobalValidationRunner` and the filesystem.

## 2. Task Implementation
- [ ] Create `src/scripts/validateAll.ts`:
  - Parse CLI arguments using Node.js built-in `parseArgs` (or `minimist` if already a project dependency):
    - `--output <filepath>`: optional path to write the markdown report.
    - `--requirements <filepath>`: optional path to `requirements.md` (default: `requirements.md`).
  - Instantiate `GlobalValidationRunner` with the resolved paths and the production `ArtifactStore`.
  - Call `runner.run()` and `runner.generateMarkdownReport(report)`.
  - If `--output` is set, write the report to the specified file with `fs.promises.writeFile`.
  - Otherwise, print the report to stdout.
  - Exit codes:
    - `0`: all requirements covered and passing.
    - `1`: one or more requirements uncovered.
    - `2`: one or more requirements failing.
    - `3`: `ValidationAbortError` (e.g., missing `requirements.md`).
- [ ] Add a `validate-all` entry to `package.json` under the `scripts` section: `"validate-all": "ts-node src/scripts/validateAll.ts"`.
- [ ] Also add `validate-all` to the `devs` section of `package.json` (per [TAS-006]) with a description field.

## 3. Code Review
- [ ] Confirm the exit-code logic is exhaustive: no code path exits with `0` when there are uncovered or failing requirements.
- [ ] Confirm the `--output` path is validated to be within the project directory (no path traversal).
- [ ] Confirm the script does not `process.exit` inside library code; `process.exit` is only called at the top-level script boundary.
- [ ] Ensure TypeScript strict mode is satisfied.

## 4. Run Automated Tests to Verify
- [ ] Run `npm test -- --testPathPattern="validateAll"` and confirm all tests pass.
- [ ] Run `npx tsc --noEmit` and confirm exit code is `0`.
- [ ] Run `npm run validate-all -- --help` (or with no artifacts) and confirm it produces output without throwing an unhandled error.

## 5. Update Documentation
- [ ] Update `README.md` (or `docs/scripts.md`) to document the `validate-all` script:
  - Purpose, usage syntax, flags, and all exit codes.
- [ ] Create `src/scripts/validateAll.agent.md` documenting:
  - When this script is invoked in the CI pipeline (after each phase completion).
  - What the exit codes mean for downstream agents.
  - How to interpret the markdown report output.

## 6. Automated Verification
- [ ] Run `npm test -- --testPathPattern="validateAll" --coverage` and confirm all tests pass.
- [ ] Run `npx tsc --noEmit` and confirm exit code is `0`.
- [ ] Confirm the script is listed in `package.json` scripts: `node -e "const p=require('./package.json'); process.exit(p.scripts['validate-all'] ? 0 : 1)"`.
- [ ] Confirm `src/scripts/validateAll.agent.md` exists: `test -f src/scripts/validateAll.agent.md && echo "AOD OK"`.
