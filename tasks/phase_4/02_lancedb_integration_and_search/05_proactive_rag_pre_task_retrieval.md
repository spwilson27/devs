# Task: Proactive RAG Pre-Task Memory Retrieval (Sub-Epic: 02_LanceDB_Integration_and_Search)

## Covered Requirements
- [4_USER_FEATURES-REQ-019], [3_MCP-TAS-011]

## 1. Initial Test Written

- [ ] Create `packages/memory/src/vector/__tests__/rag-retriever.test.ts`.
- [ ] Mock `VectorStore` using `jest.mock` — configure `search` to return a fixed array of `SearchResult` objects.
- [ ] Write a unit test for `RagRetriever.retrieveForTask(task: TaskContext): Promise<RetrievedContext>`:
  - Provide a `TaskContext` object with fields: `taskId`, `taskTitle`, `taskDescription`, `phaseId`, `projectId`.
  - Assert the method calls `vectorStore.search` at least once.
  - Assert the `search` call passes a query string composed from the `taskTitle` and `taskDescription` (concatenated).
  - Assert the `search` call includes `filter: { project_id: task.projectId }`.
  - Assert the returned `RetrievedContext.records` is an array of `MemoryRecord` objects from the search results.
- [ ] Write a unit test verifying that `retrieveForTask` calls `search` with `topK: 10` (the default for pre-task retrieval).
- [ ] Write a unit test verifying that if `search` returns records from multiple `source` types (`'prd'`, `'tas'`, `'decision'`), the results are grouped by `source` in the returned `RetrievedContext.bySource` map.
- [ ] Write a unit test verifying the `RetrievedContext.formattedContext` field:
  - Assert it is a non-empty string.
  - Assert it includes each record's `content` field.
  - Assert it includes the `source` label for each group (e.g., `## TAS Decisions`, `## PRD Requirements`).
- [ ] Write a unit test asserting that if `search` returns zero results, `RetrievedContext.records` is an empty array and `formattedContext` is an empty string (no error thrown).
- [ ] All tests must fail initially (red phase).

## 2. Task Implementation

- [ ] Create `packages/memory/src/vector/rag-retriever.ts`:
  - Export interface `TaskContext`:
    ```ts
    interface TaskContext {
      taskId: string;
      taskTitle: string;
      taskDescription: string;
      phaseId: number;
      projectId: string;
    }
    ```
  - Export interface `RetrievedContext`:
    ```ts
    interface RetrievedContext {
      records: MemoryRecord[];
      bySource: Map<MemoryRecord['source'], MemoryRecord[]>;
      formattedContext: string;
    }
    ```
  - Export class `RagRetriever`:
    - Constructor: `constructor(private vectorStore: VectorStore)`.
    - `async retrieveForTask(task: TaskContext, topK = 10): Promise<RetrievedContext>`:
      1. Compose `queryText = \`${task.taskTitle}\n${task.taskDescription}\``.
      2. Call `this.vectorStore.search(queryText, { topK, filter: { project_id: task.projectId } })`.
      3. Extract `records` from the `SearchResult[]`.
      4. Build `bySource: Map<source, MemoryRecord[]>` by grouping records.
      5. Build `formattedContext` string: for each source group, emit a `## {Source Label}` header followed by each record's `content` separated by `\n\n---\n\n`. Source label mapping: `prd` → `PRD Requirements`, `tas` → `TAS Decisions`, `decision` → `Architectural Decisions`, `task_outcome` → `Past Task Outcomes`, `rca` → `Root Cause Analyses`.
      6. Return `{ records, bySource, formattedContext }`.
- [ ] Update `packages/memory/src/vector/index.ts` to re-export `RagRetriever`, `TaskContext`, and `RetrievedContext`.

## 3. Code Review

- [ ] Verify that `retrieveForTask` does not hardcode the `project_id` — it must always be sourced from the `TaskContext` argument.
- [ ] Verify that the formatted context output will not exceed a single-turn context budget — add a `maxChars?: number` option (default: `50_000`) that truncates the `formattedContext` string with a `\n[... truncated]` suffix if exceeded.
- [ ] Verify that the `bySource` map preserves insertion order (i.e., records within a group appear in descending similarity score order, as returned by `VectorStore.search`).
- [ ] Verify no implementation logic is duplicated from `VectorStore.search` — `RagRetriever` must only orchestrate and format; it must not re-implement filtering or embedding.
- [ ] Confirm the module has zero runtime dependencies outside of `@devs/memory`'s own package — no direct imports of embedding clients or LanceDB.

## 4. Run Automated Tests to Verify

- [ ] Run: `pnpm --filter @devs/memory test -- --testPathPattern=rag-retriever`
- [ ] All tests in `rag-retriever.test.ts` must pass (green phase).
- [ ] Run `pnpm --filter @devs/memory build` and assert zero TypeScript errors.

## 5. Update Documentation

- [ ] Create `packages/memory/src/vector/rag-retriever.agent.md` documenting: the purpose of `RagRetriever` (proactive RAG before each task), the `TaskContext` input fields, the `RetrievedContext` output structure, the `formattedContext` format and source-label mapping, and the `maxChars` truncation behavior.
- [ ] Update `packages/memory/README.md` with a `## Proactive RAG Retrieval` section showing how the orchestrator should call `RagRetriever.retrieveForTask` before dispatching a task to a developer agent.
- [ ] Update the devs orchestrator agent memory file (`packages/orchestrator/orchestrator.agent.md`, or equivalent) to include a note: "Before dispatching any task, call `RagRetriever.retrieveForTask` and prepend `RetrievedContext.formattedContext` to the task prompt to ensure architectural consistency."

## 6. Automated Verification

- [ ] Run `pnpm --filter @devs/memory test --coverage -- --testPathPattern=rag-retriever` and confirm ≥ 90% branch coverage on `rag-retriever.ts`.
- [ ] Run `pnpm --filter @devs/memory test` (full suite) and assert zero regressions.
- [ ] Run `pnpm --filter @devs/memory build` and assert exit code is `0`.
- [ ] Assert that `packages/memory/src/vector/index.ts` exports `RagRetriever` by running: `node -e "const m = require('./packages/memory/dist'); console.assert(typeof m.RagRetriever === 'function')"` from the repo root after building.
