# Task: Implement Project Archive Packager (Sub-Epic: 07_Project Handover)

## Covered Requirements
- [4_USER_FEATURES-REQ-087]

## 1. Initial Test Written
- [ ] In `src/export/__tests__/archiver.test.ts`, write unit and integration tests:
  - **Unit – File manifest builder**: Given a mock project directory tree, assert `buildFileManifest(projectPath, options)` returns a list of relative file paths that:
    - Includes source files, `devs.db`, and generated documentation.
    - Excludes `node_modules/`, `.git/`, `*.log`, and any paths in a `.devsexportignore` file if present.
  - **Unit – Archive naming**: Assert `resolveArchiveName(projectPath, format)` returns `<project-name>-devs-export-<ISO-date>.<ext>` (e.g., `my-app-devs-export-2026-02-21.zip`).
  - **Unit – Dry-run mode**: When `options.dryRun === true`, assert `createArchive(...)` returns the manifest and the archive name but writes zero bytes to disk (use a spy on the filesystem write calls).
  - **Integration – zip**: Call `createArchive(fixturePath, outputDir, { format: 'zip' })` against `src/export/__fixtures__/sample-project/`, assert a `.zip` file is created in `outputDir`, that it is a valid zip (use `adm-zip` or `yauzl` to verify), and that it contains `devs.db` and `final-validation-report.md`.
  - **Integration – tar.gz**: Same as above for `format: 'tar.gz'`.

## 2. Task Implementation
- [ ] Create `src/export/archiver.ts` exporting:
  - `buildFileManifest(projectPath: string, options: ArchiveOptions): Promise<string[]>` — walks the directory recursively, applies exclusion rules (hard-coded defaults + `.devsexportignore` parsing), and returns relative paths.
  - `resolveArchiveName(projectPath: string, format: 'zip' | 'tar.gz'): string` — derives archive name from the project directory's base name + current UTC date.
  - `createArchive(projectPath: string, outputDir: string, options: ArchiveOptions): Promise<ArchiveResult>` — orchestrates manifest building and writes the archive file. Uses `archiver` npm package (already likely a dependency; add if not). Injects the Final Validation Report (as `final-validation-report.md`) into the archive root before sealing.
- [ ] Define `ArchiveOptions` (`format`, `dryRun`, `extraExclusions`) and `ArchiveResult` (`archivePath`, `manifest`, `sizeBytes`) in `src/export/types.ts`.
- [ ] Add `.devsexportignore` support: parse the file line-by-line, support glob patterns using `minimatch`.
- [ ] Add a sample `.devsexportignore` template to `src/export/__fixtures__/sample-project/`.

## 3. Code Review
- [ ] Verify the archiver streams files rather than loading them fully into memory (use `archiver`'s streaming API, not `readFileSync`).
- [ ] Confirm the validation report is always included as the **first** entry in the archive for easy extraction.
- [ ] Confirm `buildFileManifest` never resolves paths outside of `projectPath` (no directory traversal).
- [ ] Check that `createArchive` creates `outputDir` if it does not exist (using `fs.mkdir` with `recursive: true`).
- [ ] Ensure error handling: if the archive write fails mid-stream, the partially written file is deleted and an error is thrown.

## 4. Run Automated Tests to Verify
- [ ] Run `npm test -- --testPathPattern="archiver"` and confirm all tests pass.
- [ ] Run `npm run type-check` and confirm no new type errors.

## 5. Update Documentation
- [ ] Add `docs/export/archiver.md` documenting the archive format, default exclusions, and `.devsexportignore` syntax.
- [ ] Update `docs/agent-memory/phase_15.md` noting that the archiver supports `zip` and `tar.gz` and that the validation report is injected into the archive root.

## 6. Automated Verification
- [ ] Run the integration test with: `npm test -- --testPathPattern="archiver" --verbose` and assert both `zip` and `tar.gz` integration tests show `✓ passed`.
- [ ] Verify the produced archive integrity with an OS-level check in CI: `unzip -t <output>.zip && echo "archive_ok"` (or `tar -tzf <output>.tar.gz && echo "archive_ok"`) and assert `archive_ok` is printed.
