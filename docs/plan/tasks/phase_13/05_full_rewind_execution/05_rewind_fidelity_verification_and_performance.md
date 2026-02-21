# Task: Implement Rewind Fidelity Verification and Performance Benchmark (Sub-Epic: 05_Full Rewind Execution)

## Covered Requirements
- [9_ROADMAP-REQ-038], [9_ROADMAP-REQ-047]

## 1. Initial Test Written
- [ ] In `src/rewind/__tests__/rewind.fidelity.verifier.test.ts`, write unit tests for `RewindFidelityVerifier`:
  - Mock `GitFilesystemResetter`, `SqliteRelationalStateResetter`, and the filesystem hash utility.
  - Test that `verify(taskId, repoPath)` computes SHA-256 checksums of all Git-tracked files after reset and compares them against the stored checksum manifest for that `taskId`.
  - Test that `verify` throws `FidelityMismatchError` if any file checksum does not match, including the mismatched file path and both expected/actual hashes in the error.
  - Test that `verify` resolves with `{ matched: true, fileCount: N }` when all checksums match.
  - Test that `verify` correctly handles an empty repository (0 tracked files) — resolves with `{ matched: true, fileCount: 0 }`.
- [ ] In `src/rewind/__tests__/rewind.performance.test.ts`, write a performance regression test:
  - Mock all three reset steps (`FilesystemResetter`, `RelationalStateResetter`, `VectorMemoryPruner`) with stubs that resolve in < 10ms each.
  - Run `RewindOrchestrator.execute(taskId)` 10 times and assert that the 99th-percentile `durationMs` from `RewindResult` is < 2000ms.
  - This validates [9_ROADMAP-REQ-047]: State Recovery Time < 2s.
- [ ] In `src/rewind/__tests__/rewind.fidelity.e2e.test.ts`, write an E2E fidelity test using real subsystems:
  - Create a temp Git repo, seed an in-memory SQLite DB with tasks, and run a full `RewindOrchestrator.execute('task_2')` with real `GitFilesystemResetter` and `SqliteRelationalStateResetter` (with mocked `VectorMemoryPruner`).
  - After the orchestrator completes, call `RewindFidelityVerifier.verify('task_2', repoPath)` and assert `matched: true`.
  - Assert that the total wall-clock time from `execute()` start to `verify()` end is < 2000ms for a repository with ≤ 500 files, satisfying [9_ROADMAP-REQ-047].

## 2. Task Implementation
- [ ] Create `src/rewind/rewind.fidelity.verifier.ts`:
  - Export class `RewindFidelityVerifier`.
  - Constructor accepts `{ db: Database; hashUtil: FileHashUtil }`.
  - Implement `async verify(taskId: string, repoPath: string): Promise<FidelityResult>`:
    1. Query `tasks` table for the checksum manifest JSON stored in the `filesystem_checksum_manifest` column for `taskId`. (This column must be populated by the `CommitNode` when tasks are committed — see note below.)
    2. Enumerate all files currently in `repoPath` using `git ls-files` (to list only tracked files).
    3. For each file, compute SHA-256 and compare against the manifest.
    4. If any mismatch, throw `FidelityMismatchError` listing all mismatches.
    5. Return `{ matched: true, fileCount: N }`.
  - **Note:** If `filesystem_checksum_manifest` column does not yet exist in the `tasks` table, create and apply a migration: `ALTER TABLE tasks ADD COLUMN filesystem_checksum_manifest TEXT DEFAULT NULL`. Add this migration to the project's migration runner.
- [ ] Create `src/rewind/file.hash.util.ts`:
  - Export function `computeFileHash(filePath: string): Promise<string>` using Node.js `crypto.createHash('sha256')` streaming over the file.
  - Export function `buildChecksumManifest(repoPath: string, trackedFiles: string[]): Promise<Record<string, string>>`.
- [ ] Add `FidelityMismatchError extends Error` to `src/rewind/errors.ts` with `mismatches: Array<{ file: string; expected: string; actual: string }>`.
- [ ] Add `FidelityResult` to `src/rewind/types.ts`: `{ matched: boolean; fileCount: number }`.
- [ ] Update `RewindOrchestrator.execute()` to call `RewindFidelityVerifier.verify(taskId, repoPath)` as a final step after all three resets complete, and include `fidelityResult` in the returned `RewindResult`.
- [ ] Update `RewindResult` in `src/rewind/types.ts` to include `fidelityResult: FidelityResult`.
- [ ] Instrument `RewindOrchestrator.execute()` to record `durationMs` using `performance.now()` and include it in logs and the returned `RewindResult`, enabling performance monitoring against the < 2s KPI.

## 3. Code Review
- [ ] Verify `git ls-files` is run via `execFile` (not shell interpolation) and its output is parsed line by line.
- [ ] Confirm `computeFileHash` uses streaming (not `readFileSync`) to handle large files without blocking the event loop.
- [ ] Verify `FidelityMismatchError` collects ALL mismatches (not just the first) before throwing, so the developer gets a complete picture.
- [ ] Confirm the `filesystem_checksum_manifest` DB migration is idempotent (safe to run multiple times).
- [ ] Verify the performance test uses real wall-clock time (`Date.now()` or `performance.now()`) and not mocked timers.
- [ ] Confirm `durationMs` in `RewindResult` reflects the total time from the start of `execute()` to the end of `verify()`, inclusive.

## 4. Run Automated Tests to Verify
- [ ] Run `npm test -- --testPathPattern="rewind.fidelity.verifier|rewind.performance"` and confirm all tests pass.
- [ ] Run the E2E fidelity test: `npm test -- --testPathPattern="rewind.fidelity.e2e" --runInBand` and confirm the < 2s wall-clock assertion passes.
- [ ] Run `npm run lint` and `npm run build` with zero errors.

## 5. Update Documentation
- [ ] Update `src/rewind/REWIND.agent.md` with a section on `RewindFidelityVerifier`:
  - Document the `filesystem_checksum_manifest` schema and when it is populated.
  - Document the `FidelityMismatchError` fields.
  - Document the `FidelityResult` type.
- [ ] Update `docs/architecture/rewind.md` with a "Fidelity Verification & Performance" subsection:
  - State the 100% checksum match requirement from [9_ROADMAP-REQ-038].
  - State the < 2s recovery time KPI from [9_ROADMAP-REQ-047] and how it is measured.
  - Explain the `filesystem_checksum_manifest` column and its lifecycle.
- [ ] Update `CHANGELOG.md` or release notes to record the addition of the `filesystem_checksum_manifest` column migration.

## 6. Automated Verification
- [ ] Run the E2E fidelity test in CI and assert exit code 0: `npm test -- --testPathPattern="rewind.fidelity.e2e" --runInBand`.
- [ ] Run the performance test and assert the 99th-percentile assertion within the test itself passes: `npm test -- --testPathPattern="rewind.performance"`.
- [ ] After a full rewind in the integration environment, query the `RewindResult.durationMs` value from logs and assert it is < 2000, surfacing a CI failure if the KPI is exceeded.
