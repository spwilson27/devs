# Task: Implement ContextRefresh Service with PRD/TAS/Task Injection (Sub-Epic: 09_Active_File_Pinning_and_Context_Injection)

## Covered Requirements
- [9_ROADMAP-REQ-010], [3_MCP-TAS-048]

## 1. Initial Test Written
- [ ] Create `packages/orchestrator/src/context/__tests__/ContextRefresh.test.ts`.
- [ ] Write a unit test that `ContextRefreshService` is instantiable with a mocked `ActiveFilePinManager`, mocked `SpecLoader` (reads PRD + TAS), and mocked `TaskRequirementsLoader`.
- [ ] Write a test that `buildContextPayload(taskId: string): Promise<ContextPayload>` returns an object with:
  - `prd: string` — the full text of the PRD document.
  - `tas: string` — the full text of the TAS document.
  - `activeTaskRequirements: string` — the requirements block for `taskId` extracted from the requirements manifest.
  - `pinnedFiles: PinnedFileContent[]` — array of `{ absolutePath, content }` for all currently pinned files.
  - `totalTokenEstimate: number` — sum of token estimates across all included items.
- [ ] Write a test that `buildContextPayload` still succeeds when `listPinnedFiles()` returns an empty array (no pinned files).
- [ ] Write a test that `buildContextPayload` reads each pinned file's content from disk using `fs.promises.readFile` (mocked) and includes it.
- [ ] Write a test that if a pinned file has been deleted from disk, `buildContextPayload` removes it from the store via `unpinFile` and logs a warning, then continues without throwing.
- [ ] Write an integration test that the `ContextRefreshService` is called at the start of each agent turn loop iteration by the `Orchestrator`, using a spy on `buildContextPayload` to verify it is called exactly once per turn.

## 2. Task Implementation
- [ ] Create `packages/orchestrator/src/context/ContextRefreshService.ts`:
  - `PinnedFileContent`: `{ absolutePath: string; content: string; tokenEstimate: number }`.
  - `ContextPayload`: `{ prd: string; tas: string; activeTaskRequirements: string; pinnedFiles: PinnedFileContent[]; totalTokenEstimate: number }`.
  - `ContextRefreshService` class:
    - Constructor: `(pinManager: ActiveFilePinManager, specLoader: SpecLoader, taskReqLoader: TaskRequirementsLoader, logger: Logger)`.
    - `async buildContextPayload(taskId: string): Promise<ContextPayload>`:
      1. Await `specLoader.loadPRD()` and `specLoader.loadTAS()` in parallel using `Promise.all`.
      2. Await `taskReqLoader.loadRequirements(taskId)`.
      3. Get `pinManager.listPinnedFiles()`.
      4. For each pinned file, read content from disk; on `ENOENT`, call `pinManager.unpinFile(path)`, log warning, and skip.
      5. Compute `totalTokenEstimate`.
      6. Return the assembled `ContextPayload`.
- [ ] Create `packages/orchestrator/src/context/SpecLoader.ts`:
  - Reads `docs/specs/1_prd.md` and `docs/specs/2_tas.md` from the project root (resolved at runtime via `process.env.DEVS_PROJECT_ROOT`).
  - Implements `loadPRD(): Promise<string>` and `loadTAS(): Promise<string>`.
  - Caches the result in memory (simple `Map<string, string>`) and refreshes on a configurable `cacheTtlMs` (default `300_000` ms = 5 min).
- [ ] Create `packages/orchestrator/src/context/TaskRequirementsLoader.ts`:
  - `loadRequirements(taskId: string): Promise<string>` — reads the task markdown file from the tasks directory and returns its raw text.
- [ ] In `packages/orchestrator/src/Orchestrator.ts`, call `contextRefreshService.buildContextPayload(currentTaskId)` at the **top** of the per-turn execution loop (before invoking the agent), and inject the resulting `ContextPayload` into the agent's system prompt.
- [ ] Export all types and classes from `packages/orchestrator/src/context/index.ts`.

## 3. Code Review
- [ ] Confirm `Promise.all` is used for the PRD and TAS loads (they are independent I/O operations and must not run sequentially).
- [ ] Confirm the `SpecLoader` cache invalidation uses `Date.now()` and is not based on file system watchers (to avoid fs-event complexity in this task).
- [ ] Confirm that a missing `DEVS_PROJECT_ROOT` environment variable causes `SpecLoader` to throw a descriptive `ConfigurationError` at load time, not a silent `undefined`.
- [ ] Confirm `ContextRefreshService` has no knowledge of the agent's prompt format; it returns a pure data object (`ContextPayload`) and is decoupled from prompt serialization.
- [ ] Verify TypeScript strict mode: `pnpm tsc --noEmit` in `packages/orchestrator`.

## 4. Run Automated Tests to Verify
- [ ] Run `pnpm --filter @devs/orchestrator test -- --testPathPattern="ContextRefresh"` and confirm all tests pass.
- [ ] Confirm ≥ 90% branch coverage on `ContextRefreshService.ts`.
- [ ] Run the integration test: `pnpm --filter @devs/orchestrator test -- --testPathPattern="ContextRefresh.integration"` and confirm the spy assertions pass.

## 5. Update Documentation
- [ ] Create `packages/orchestrator/src/context/ContextRefreshService.agent.md`:
  - Describes the `ContextPayload` shape and each field's source.
  - Documents the per-turn injection contract: "called once, before every agent invocation."
  - Lists environment variables required: `DEVS_PROJECT_ROOT`.
  - Documents the deleted-file handling behavior.
- [ ] Update `packages/orchestrator/README.md` to add the `ContextRefreshService` to the architecture overview diagram.

## 6. Automated Verification
- [ ] Execute `pnpm --filter @devs/orchestrator test --ci` and confirm exit code `0`.
- [ ] Run `node scripts/validate-context-injection.js` which starts the orchestrator in dry-run mode against a fixture project, captures the first agent prompt, and asserts it contains the strings `"PRD"`, `"TAS"`, and the fixture task ID's requirement text.
- [ ] Confirm `pnpm tsc --noEmit` exits `0` in `packages/orchestrator`.
