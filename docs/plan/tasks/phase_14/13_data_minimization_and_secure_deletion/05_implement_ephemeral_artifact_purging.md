# Task: Implement Ephemeral Artifact Purging Between Epics (Sub-Epic: 13_Data Minimization and Secure Deletion)

## Covered Requirements
- [8_RISKS-REQ-033]

## 1. Initial Test Written
- [ ] Create `src/core/orchestrator/__tests__/epicTransition.test.ts`:
  - Mock `fs/promises` (`rm`, `readdir`, `stat`) and `glob` (or `fast-glob`).
  - Test `EphemeralArtifactPurger.purge(projectRoot: string, epicNumber: number): Promise<PurgeReport>`:
    - Asserts it removes `node_modules/.cache/` inside the sandbox project root (uses `rm` with `{ recursive: true, force: true }`).
    - Asserts it removes all `*.log` files inside `.devs/build-logs/` matching the completed epic number.
    - Asserts it removes all paths matching `**/.devs/tmp/**` and `**/tmp/devs-*`.
    - Asserts it removes Jest/Vitest cache directories: `.devs/test-cache/` and any `coverage/` directories under the sandbox root.
    - Asserts that `node_modules/` itself (the production deps) is NOT removed — only `.cache` subdirectory.
    - Asserts that the returned `PurgeReport` contains: `{ epicNumber, filesRemoved: number, bytesFreed: number, durationMs: number, errors: string[] }`.
    - Asserts that individual file removal errors are collected into `errors[]` and do NOT abort the entire purge (resilient iteration).
    - Test `EphemeralArtifactPurger.scheduleAfterEpic(orchestrator: Orchestrator)`: asserts it registers a listener on the `EpicCompleteEvent` and calls `purge()` automatically.
  - Test `buildPurgeGlobs(projectRoot: string): string[]` — asserts it returns the correct glob patterns for all artifact categories.

## 2. Task Implementation
- [ ] Create `src/core/orchestrator/ephemeralArtifactPurger.ts`:
  - Import `fs/promises`, `path`, `fast-glob` (or `glob`).
  - Export `ARTIFACT_GLOB_PATTERNS: readonly string[]`:
    ```typescript
    const ARTIFACT_GLOB_PATTERNS = [
      'node_modules/.cache/**',
      '.devs/build-logs/epic-{epicNumber}/**',
      '.devs/test-cache/**',
      '.devs/tmp/**',
      'tmp/devs-*',
      'coverage/**',
    ] as const;
    // [8_RISKS-REQ-033] Ephemeral artifact purging between Epics.
    ```
  - Export `buildPurgeGlobs(projectRoot: string, epicNumber: number): string[]` — substitutes `{epicNumber}` and resolves paths relative to `projectRoot`.
  - Implement `EphemeralArtifactPurger` class:
    - `async purge(projectRoot: string, epicNumber: number): Promise<PurgeReport>`:
      1. Resolve glob patterns via `buildPurgeGlobs`.
      2. Use `fast-glob` with `{ onlyFiles: false, markDirectories: true, dot: true }` to enumerate all matching paths.
      3. Sort by path depth (deepest first) to avoid removing parent before child.
      4. For each path: call `fs.stat` to get `size`, then `fs.rm({ recursive: true, force: true })`. Catch per-path errors and push to `errors[]`.
      5. Accumulate `filesRemoved` and `bytesFreed`.
      6. Return `PurgeReport`.
    - `scheduleAfterEpic(orchestrator: Orchestrator): void`:
      - Subscribe to `EpicCompleteEvent` on the event bus.
      - On event: call `this.purge(event.projectRoot, event.epicNumber)` and log the resulting `PurgeReport` at `INFO` level.
- [ ] Export `EphemeralArtifactPurger` from `src/core/orchestrator/index.ts`.
- [ ] Call `ephemeralArtifactPurger.scheduleAfterEpic(orchestrator)` in the Orchestrator bootstrap (`src/core/orchestrator/orchestrator.ts`).
- [ ] Add `PurgeReport` interface to `src/core/orchestrator/types.ts`.

## 3. Code Review
- [ ] Verify `node_modules/` (root) is never matched — confirm glob patterns are scoped to `node_modules/.cache/**` only.
- [ ] Verify per-path errors are non-fatal and accumulated — the purger must not `throw` on partial failure.
- [ ] Verify the `scheduleAfterEpic` subscription is registered once (not per-purge call) — confirm no event listener leak.
- [ ] Verify glob patterns use `dot: true` to catch hidden directories like `.devs/tmp`.
- [ ] Verify `PurgeReport` is emitted as a `MetricEvent` to the monitoring bus for observability.

## 4. Run Automated Tests to Verify
- [ ] Run `npx jest src/core/orchestrator/__tests__/epicTransition.test.ts --coverage` and confirm all tests pass with ≥ 90% branch coverage.
- [ ] Run `npx tsc --noEmit` and confirm zero TypeScript errors.
- [ ] Run integration smoke test: `node scripts/e2e/verify-ephemeral-purge.js` (see section 6).

## 5. Update Documentation
- [ ] Add `docs/operations/ephemeral-artifact-purging.md` documenting: which artifact categories are purged, the `ARTIFACT_GLOB_PATTERNS` list, the `PurgeReport` schema, and how to configure custom additional glob patterns via `devs.config.json` `purge.additionalGlobs` array.
- [ ] Update `docs/agent-memory/phase_14_decisions.md` with: "Ephemeral artifact purging (REQ-033) runs automatically after each Epic via `EpicCompleteEvent`. Cleans: node_modules/.cache, build-logs, test-cache, tmp. Non-fatal per-file errors."

## 6. Automated Verification
- [ ] Create `scripts/e2e/verify-ephemeral-purge.js`:
  - Creates a temp project root with stub directories: `node_modules/.cache/dummy.bin`, `.devs/build-logs/epic-1/output.log`, `.devs/test-cache/jest-haste-map`.
  - Instantiates `EphemeralArtifactPurger` and calls `purge(tmpRoot, 1)`.
  - Asserts all stub files are gone.
  - Asserts `node_modules/` (root) is still present (only `.cache` was removed).
  - Asserts `PurgeReport.filesRemoved > 0` and `PurgeReport.errors.length === 0`.
  - Exit code 0 = pass, 1 = fail.
- [ ] Confirm `npm run validate-all` passes.
