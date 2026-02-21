# Task: Wire Export Orchestrator and End-to-End Integration (Sub-Epic: 07_Project Handover)

## Covered Requirements
- [4_USER_FEATURES-REQ-087]

## 1. Initial Test Written
- [ ] In `src/export/__tests__/index.test.ts`, write end-to-end integration tests using the fixture project:
  - **E2E – zip export**: Call `runExport(fixturePath, { outputDir, format: 'zip', dryRun: false })` and assert:
    - The function resolves without throwing.
    - `<outputDir>/<archive-name>.zip` exists on disk.
    - The zip contains `final-validation-report.md` and `onboarding-manifest.md` and `onboarding-manifest.json` at the archive root.
    - The zip contains `devs.db` at its original relative path.
    - The returned `ExportResult` has `rti >= 0` and `archiveSizeBytes > 0`.
  - **E2E – dry-run mode**: Call with `dryRun: true` and assert:
    - No files are written to `outputDir`.
    - The returned `ExportResult.dryRun === true` and `ExportResult.manifest` is a non-empty array.
  - **E2E – invalid project path**: Call with a path that contains no `devs.db` or `.devs/` directory and assert the promise rejects with an error message matching `/not a valid devs project/i`.
  - **E2E – tar.gz export**: Same as zip test but for `format: 'tar.gz'`; assert the `.tar.gz` file exists and is non-empty.
- [ ] In `src/cli/__tests__/export.e2e.test.ts`, write a CLI-level E2E test:
  - Spawn a child process running `node dist/cli/index.js export <fixturePath> --output <tmpDir> --format zip`.
  - Assert the process exits with code 0.
  - Assert stdout contains `Export complete` and the archive path.
  - Assert the archive file exists in `<tmpDir>`.

## 2. Task Implementation
- [ ] Create `src/export/index.ts` exporting:
  - `runExport(projectPath: string, options: ExportOptions): Promise<ExportResult>` — the top-level orchestrator that:
    1. Validates `projectPath` (presence of `devs.db` or `.devs/` directory); throws `InvalidProjectError` if invalid.
    2. Opens the SQLite `devs.db` using `better-sqlite3`.
    3. Runs the validation report: calls `calculateRTI`, `summariseTestResults`, `buildTraceabilityMatrix`, and `renderReport` from `src/export/validation-report.ts`.
    4. Generates the onboarding manifest: calls `buildOnboardingManifest`, `renderManifestAsMarkdown`, and `renderManifestAsJson` from `src/export/onboarding-manifest.ts`.
    5. Writes the report and manifest as temp files (or passes them as in-memory strings) to `createArchive` in `src/export/archiver.ts`.
    6. Returns an `ExportResult` object.
- [ ] Define `ExportOptions` (`outputDir`, `format`, `dryRun`) and `ExportResult` (`archivePath`, `manifest`, `rti`, `archiveSizeBytes`, `dryRun`) in `src/export/types.ts`.
- [ ] Emit structured progress events via Node's `EventEmitter` (or a provided `onProgress` callback in `ExportOptions`) so the CLI layer can display a progress spinner; events: `'validating'`, `'building-report'`, `'building-manifest'`, `'archiving'`, `'done'`.
- [ ] Update `src/cli/commands/export.command.ts` (from Task 01) to:
  - Subscribe to progress events and render a spinner/status line via `ora` or equivalent.
  - Print `Export complete: <archivePath> (<size>)` on success.

## 3. Code Review
- [ ] Confirm `runExport` closes the SQLite database handle in a `finally` block regardless of success or failure.
- [ ] Confirm the orchestrator does not duplicate logic already in `validation-report.ts`, `archiver.ts`, or `onboarding-manifest.ts` — it must only compose them.
- [ ] Verify progress events are emitted before (not after) the corresponding operation so UI feedback is timely.
- [ ] Confirm `InvalidProjectError` is a named subclass of `Error` (not a plain `throw new Error(...)`) so callers can use `instanceof` checks.
- [ ] Ensure the E2E test cleans up temp directories in an `afterEach` hook.

## 4. Run Automated Tests to Verify
- [ ] Run `npm test -- --testPathPattern="src/export/__tests__/index"` and confirm all E2E tests pass.
- [ ] Run `npm test -- --testPathPattern="export.e2e"` and confirm CLI-level E2E tests pass.
- [ ] Run the full test suite `npm test` and confirm no regressions.

## 5. Update Documentation
- [ ] Update `docs/export/README.md` (create if absent) with an architecture diagram (Mermaid) showing how the orchestrator composes the three sub-modules (validation-report, onboarding-manifest, archiver).
- [ ] Update `docs/cli-reference.md` with the full `devs export` output format description (archive contents, exit codes, stdout format).
- [ ] Update `docs/agent-memory/phase_15.md` to mark Sub-Epic 07_Project Handover as fully implemented, referencing all four tasks and the requirement `4_USER_FEATURES-REQ-087`.

## 6. Automated Verification
- [ ] Run the full test suite with coverage: `npm test -- --coverage` and assert `src/export/index.ts` has ≥ 90% line coverage.
- [ ] Run the CLI E2E smoke test in CI by executing: `node dist/cli/index.js export src/export/__fixtures__/sample-project --output /tmp/devs-export-smoke --format zip && unzip -t /tmp/devs-export-smoke/*.zip | grep -q "No errors detected" && echo "smoke_ok"` and assert `smoke_ok` is printed with exit code 0.
