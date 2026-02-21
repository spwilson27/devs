# Task: Implement Stateless Orchestrator and `devs resume` CLI Command (Sub-Epic: 06_Crash Recovery and Resume)

## Covered Requirements
- [1_PRD-REQ-SYS-002]

## 1. Initial Test Written
- [ ] In `src/orchestrator/__tests__/statelessResume.test.ts`, write unit and integration tests for the `devs resume` flow:
  - **Unit — `OrchestratorGraph.resume()`**: mock `SqliteCheckpointer.getTuple()` returning a stored checkpoint at node `implementation_agent`; assert that the graph picks up from that node (i.e., the mock `implementation_agent` node function is called, but not the earlier `test_writer` node function).
  - **Unit — fresh start with no checkpoint**: `SqliteCheckpointer.getTuple()` returns `null`; assert the graph starts from the entry node.
  - **Unit — CLI `resume` command parsing**: call `parseArgs(['resume'])` and assert the resulting command object has `command: 'resume'` and no extra flags that would reset state.
  - **Integration — crash and resume**: run a minimal LangGraph graph to the second of three nodes, mock a crash (interrupt after node 2 completes but before node 3 starts), then create a new graph instance pointing to the same `state.sqlite`, call `resume()`, and assert only node 3 executes (tracked via a call counter spy).
  - **Integration — `devs resume` is idempotent**: resume a fully completed graph (all nodes done); assert no node is re-executed and the process exits cleanly with code 0.

## 2. Task Implementation
- [ ] Ensure `OrchestratorGraph` in `src/orchestrator/OrchestratorGraph.ts` is **stateless** — it must derive all state from the `SqliteCheckpointer` and the `Database` instance, holding no in-memory mutable state between runs.
  - Remove any module-level or singleton in-memory state variables from the orchestrator class.
  - Add `async resume(threadId: string): Promise<void>` method that calls `graph.stream(null, { configurable: { thread_id: threadId }, streamMode: 'updates' })` — passing `null` as input signals LangGraph to resume from the last checkpoint for the given thread.
- [ ] In `src/cli/commands/resume.ts`, implement the `resume` command handler:
  - Read `threadId` from `src/persistence/ProjectState.getActiveThreadId()` (queries `SELECT thread_id FROM project_state WHERE key = 'active_thread_id'` from `state.sqlite`).
  - If no `threadId` exists, print `"No active session found. Run 'devs run' to start a new project."` and exit with code 1.
  - Instantiate `DatabaseManager`, `SqliteCheckpointer`, and `OrchestratorGraph`.
  - Call `await orchestrator.resume(threadId)`.
  - On success, print `"Session resumed successfully."`.
- [ ] Register the `resume` command in `src/cli/index.ts` alongside existing commands (`init`, `run`, `status`, etc.).
- [ ] Ensure `ProjectState.setActiveThreadId(threadId)` is called when a new orchestration run starts (in `src/cli/commands/run.ts`), so `resume` can always locate the correct `thread_id`.

## 3. Code Review
- [ ] Verify `OrchestratorGraph` holds zero in-process mutable state — all state is read from `state.sqlite` via `SqliteCheckpointer` on each instantiation.
- [ ] Confirm `resume` passes `null` (not a re-initialized state object) as the graph input, matching the LangGraph resume contract.
- [ ] Verify the CLI `resume` command correctly handles the "no active session" edge case with a user-friendly message and non-zero exit code.
- [ ] Confirm `ProjectState.setActiveThreadId` and `getActiveThreadId` use prepared SQLite statements and the singleton `Database` instance.

## 4. Run Automated Tests to Verify
- [ ] Run `npm test -- --testPathPattern=statelessResume` and confirm all unit and integration tests pass.
- [ ] Run `npx tsc --noEmit` and confirm zero type errors.
- [ ] Run `node dist/cli/index.js resume` in a directory with no `state.sqlite` and assert exit code 1 with the expected message.

## 5. Update Documentation
- [ ] Add `src/orchestrator/OrchestratorGraph.agent.md` (or update if it exists) with a section on stateless design: explain that all state is sourced from `SqliteCheckpointer`, and document the `resume(threadId)` method.
- [ ] Update `docs/cli-reference.md` to add the `devs resume` command with usage, description, and exit codes.
- [ ] Update `docs/architecture/orchestrator.md` to reflect the stateless orchestrator design and reference `1_PRD-REQ-SYS-002`.

## 6. Automated Verification
- [ ] Run `npm test -- --testPathPattern=statelessResume --coverage` and assert line coverage ≥ 90% for `OrchestratorGraph.ts` and `src/cli/commands/resume.ts`.
- [ ] Run the CLI integration test suite (`npm run test:e2e -- --grep "resume"`) and assert all E2E resume scenarios pass.
