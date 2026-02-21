# Task: Task-to-Task Handoff & TaskSummary Generation (Sub-Epic: 12_Agent Turn Management & Error Recovery)

## Covered Requirements
- [3_MCP-TAS-098]

## 1. Initial Test Written
- [ ] In `packages/core/src/orchestrator/__tests__/task-handoff.test.ts`, write unit tests covering:
  - `TaskHandoffManager.generateSummary(completedTask)` returns a `TaskSummary` object with fields: `taskId`, `completedAt` (ISO timestamp), `requirementsFulfilled: string[]`, `decisionsLog: DecisionEntry[]`, `artifactsProduced: string[]`, `openIssues: string[]`.
  - `TaskHandoffManager.generateSummary()` throws `HandoffValidationError` when `requirementsFulfilled` is empty (a task must fulfill at least one requirement).
  - `TaskHandoffManager.persistSummary(summary)` writes the `TaskSummary` as a JSON file to `<projectRoot>/.devs/task-summaries/<taskId>.json`.
  - `TaskHandoffManager.loadSummary(taskId)` reads and validates a previously persisted summary; throws `SummaryNotFoundError` if the file does not exist.
  - `TaskHandoffManager.injectIntoNextContext(summary, nextTurnContext)` merges the summary's `decisionsLog` and `openIssues` into `nextTurnContext.priorDecisions` and `nextTurnContext.openIssues` respectively.
- [ ] Write integration tests in `packages/core/src/__tests__/task-handoff.integration.test.ts`:
  - Simulate completion of task A followed by start of task B; verify task B's `TurnContext` contains task A's `decisionsLog` entries via `injectIntoNextContext`.
  - Verify the `.devs/task-summaries/` directory is created if it does not exist.

## 2. Task Implementation
- [ ] Create `packages/core/src/orchestrator/task-summary.types.ts`:
  - Export interfaces: `DecisionEntry { timestamp: string; description: string; rationale: string }`, `TaskSummary { taskId: string; completedAt: string; requirementsFulfilled: string[]; decisionsLog: DecisionEntry[]; artifactsProduced: string[]; openIssues: string[] }`.
  - Add `// REQ: 3_MCP-TAS-098` comment at file top.
- [ ] Create `packages/core/src/orchestrator/task-handoff-manager.ts`:
  - Export class `TaskHandoffManager` with constructor `{ projectRoot: string; logger: ILogger; fs: IFileSystem }`.
  - Implement `generateSummary(context: CompletedTaskContext): TaskSummary` — extract requirements, decisions, and artifacts from the completed task's `TurnContext` and `FlightRecorder` entries.
  - Implement `async persistSummary(summary: TaskSummary): Promise<void>` — serialize to JSON and write to `<projectRoot>/.devs/task-summaries/<taskId>.json`, creating the directory if missing.
  - Implement `async loadSummary(taskId: string): Promise<TaskSummary>` — read, parse, and validate using `TaskSummarySchema` (Zod); throw `SummaryNotFoundError` if absent.
  - Implement `injectIntoNextContext(summary: TaskSummary, ctx: TurnContext): TurnContext` — returns a new `TurnContext` with prior decisions and open issues merged in (immutable merge, do not mutate input).
  - Export `HandoffValidationError` and `SummaryNotFoundError` extending `Error`.
- [ ] In `packages/core/src/orchestrator/orchestrator.ts`, after a task's Reviewer Agent signals completion, call `TaskHandoffManager.generateSummary()`, `persistSummary()`, and `injectIntoNextContext()` before dispatching the next task.
- [ ] Emit log events `{ event: 'TASK_SUMMARY_GENERATED', taskId }` and `{ event: 'TASK_HANDOFF_INJECTED', fromTaskId, toTaskId }` via `ILogger`.

## 3. Code Review
- [ ] Verify `injectIntoNextContext` is a pure function (no mutations, returns new object) to preserve immutability of `TurnContext`.
- [ ] Confirm `TaskSummary` JSON files are written atomically (write to `.tmp` then rename) to prevent partial writes visible to other processes.
- [ ] Verify `HandoffValidationError` is thrown early before any file I/O when `requirementsFulfilled` is empty.
- [ ] Confirm `// REQ: 3_MCP-TAS-098` annotation appears in `task-summary.types.ts` and `task-handoff-manager.ts`.
- [ ] Ensure `loadSummary` validates the schema with Zod rather than blindly parsing to catch schema drift between versions.

## 4. Run Automated Tests to Verify
- [ ] Run `pnpm --filter @devs/core test -- --testPathPattern="task-handoff"` and confirm all tests pass.
- [ ] Run `pnpm --filter @devs/core test` (full suite) and confirm zero regressions.

## 5. Update Documentation
- [ ] Create `packages/core/src/orchestrator/task-handoff-manager.agent.md` documenting:
  - `TaskSummary` schema with all fields.
  - Persistence location `<projectRoot>/.devs/task-summaries/`.
  - Handoff injection behavior and immutability guarantees.
  - Introspection points: `TASK_SUMMARY_GENERATED`, `TASK_HANDOFF_INJECTED` log events.
- [ ] Update `docs/architecture/agent-lifecycle.md` with the task handoff section, including a Mermaid sequence diagram of the handoff flow.
- [ ] Append to `packages/core/src/orchestrator/index.agent.md` an entry for `TaskHandoffManager`.

## 6. Automated Verification
- [ ] Run `pnpm --filter @devs/core test --coverage` and assert `task-handoff-manager.ts` has ≥ 90% branch coverage.
- [ ] Run `grep -rn "REQ: 3_MCP-TAS-098" packages/core/src/orchestrator/task-summary.types.ts packages/core/src/orchestrator/task-handoff-manager.ts` and assert exit code 0 with ≥ 2 matches.
- [ ] Run `pnpm --filter @devs/core build` and confirm zero TypeScript errors.
- [ ] After integration test run, assert that `.devs/task-summaries/` directory exists under the test project root and contains at least one `.json` file.
