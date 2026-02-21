# Task: Inject Project-Wide Architectural Context (TAS) into Every Agent Task (Sub-Epic: 13_User_Directive_and_Feedback)

## Covered Requirements
- [1_PRD-REQ-NEED-AGENT-01]

## 1. Initial Test Written
- [ ] In `packages/orchestrator/src/__tests__/architecturalContextInjector.test.ts`, write unit tests for an `ArchitecturalContextInjector` class:
  - Test `buildTaskContext(taskId: string, projectId: string): Promise<ContextBlock[]>`:
    - Assert the returned `ContextBlock[]` includes a block with `type: "tas_summary"` on every call.
    - Assert the TAS block is loaded from `.devs/<projectId>/docs/2_tas.md` (mock the file system).
    - Assert that if the TAS file is missing, a `TASNotFoundError` is thrown (not silently omitted).
    - Assert the TAS block appears before `tool_result` and `agent_thought` blocks in the returned array.
    - Assert the TAS block is NOT re-fetched from disk on every call within the same task session (it is cached after first read, using an in-memory LRU cache keyed on `projectId`).
  - Test `refreshTASCache(projectId: string): Promise<void>`:
    - Assert that after `refreshTASCache` is called, the next `buildTaskContext` call re-reads from disk (cache is invalidated).
  - Write integration tests in `packages/orchestrator/src/__tests__/architecturalContextInjector.integration.test.ts`:
    - Create a temporary project directory with a `2_tas.md` fixture.
    - Call `buildTaskContext` 3 times and assert disk reads occur only once (via spy on `fs.readFile`).
    - Call `refreshTASCache` and then `buildTaskContext` and assert disk read occurs again.

## 2. Task Implementation
- [ ] Create `packages/orchestrator/src/architecturalContextInjector.ts` exporting `ArchitecturalContextInjector`:
  - Constructor accepts `{ projectRootPath: string; cacheMaxSize?: number }`.
  - Maintains an LRU cache (`Map<projectId, { content: string; loadedAt: number }>`) with configurable max size (default: 10 projects).
  - `buildTaskContext(taskId, projectId): Promise<ContextBlock[]>`:
    1. Attempt to load TAS from cache; if not present, read `.devs/${projectId}/docs/2_tas.md` from disk.
    2. If file not found, throw `TASNotFoundError(projectId)`.
    3. Store content in cache.
    4. Construct a `ContextBlock` with `type: "tas_summary"`, `content: tasContent`, `pinned: true`.
    5. Return `[tasBlock]` — other blocks (short-term memory, tool results) are merged by the orchestrator's `ContextAssembler`.
  - `refreshTASCache(projectId)`: delete the cache entry for `projectId`.
- [ ] Define `TASNotFoundError` in `packages/orchestrator/src/errors.ts`.
- [ ] Update the orchestrator's `ContextAssembler` (`packages/orchestrator/src/contextAssembler.ts`) to:
  - Call `architecturalContextInjector.buildTaskContext(taskId, projectId)` at the start of every task turn.
  - Merge the returned TAS block into the context using `ShortTermMemoryManager.buildContext()`, ensuring TAS block is placed after `user_directive` blocks but before all other types.
- [ ] Register `ArchitecturalContextInjector` as a singleton in the orchestrator's dependency injection container (`packages/orchestrator/src/container.ts`).
- [ ] Export `ArchitecturalContextInjector` and `TASNotFoundError` from `packages/orchestrator/src/index.ts`.

## 3. Code Review
- [ ] Verify `ArchitecturalContextInjector` never hard-codes the TAS file path; it always derives the path from `projectRootPath` and `projectId`.
- [ ] Verify the LRU cache is bounded (does not grow unboundedly across many projects in a long-running daemon).
- [ ] Verify `TASNotFoundError` is descriptive — it must include the expected file path in its message.
- [ ] Verify the TAS block's `pinned: true` flag prevents it from being pruned by `ShortTermMemoryManager.pruneToTokenBudget`.
- [ ] Verify `refreshTASCache` is wired to the file watcher: any change to `2_tas.md` on disk should automatically call `refreshTASCache` (via `packages/fs-watcher` or equivalent).
- [ ] Verify the ordering contract in `ContextAssembler`: user directives → TAS → everything else.

## 4. Run Automated Tests to Verify
- [ ] Run `pnpm --filter @devs/orchestrator test` and confirm all `ArchitecturalContextInjector` unit and integration tests pass with 0 failures.
- [ ] Run `pnpm --filter @devs/orchestrator test --coverage` and assert line coverage for `architecturalContextInjector.ts` is ≥ 90%.
- [ ] Run `pnpm lint` and confirm no linting errors.

## 5. Update Documentation
- [ ] Update `packages/orchestrator/README.md` with a section "Architectural Context Injection" describing:
  - The guarantee that TAS is injected into every agent task turn.
  - Cache behavior and `refreshTASCache` API.
  - Context ordering contract (user directives → TAS → other).
- [ ] Update `docs/user-guide/memory.md` with a note: "The Technical Architecture Specification (TAS) document is automatically injected into every agent task. Keep `.devs/<projectId>/docs/2_tas.md` up to date for best results."
- [ ] Update agent memory file `.devs/memory/decisions.md` with entry: `[1_PRD-REQ-NEED-AGENT-01] ArchitecturalContextInjector implemented in @devs/orchestrator; TAS is read from .devs/<projectId>/docs/2_tas.md, LRU-cached per project, and injected as a pinned ContextBlock (type=tas_summary) into every agent task turn. Ordering: user directives → TAS → other.`

## 6. Automated Verification
- [ ] Run `pnpm --filter @devs/orchestrator test 2>&1 | grep -E "PASS|FAIL"` and assert output contains only `PASS`.
- [ ] Execute scenario script `scripts/verify_tas_injection.sh` which:
  1. Creates a temporary project with a known `2_tas.md` containing the marker string `TAS_MARKER_XYZ`.
  2. Invokes `buildTaskContext("task-001", "<projectId>")` via a Node.js script.
  3. Asserts the returned context array contains a block with `content` matching `TAS_MARKER_XYZ`.
  4. Invokes `buildTaskContext` a second time and asserts `fs.readFile` was NOT called again (cache hit).
  5. Exits with code 0 on success, non-zero on failure.
- [ ] Assert CI pipeline (`pnpm ci`) exits with code 0.
