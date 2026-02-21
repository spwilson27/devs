# Task: RCA-Driven Learning Injection into LanceDB (Sub-Epic: 05_Long_Term_Memory_Implementation)

## Covered Requirements
- [3_MCP-TAS-097], [8_RISKS-REQ-013]

## 1. Initial Test Written

- [ ] In `packages/memory/src/__tests__/learning-injection.test.ts`, write a test suite `describe('LearningInjection')` that:
  - Mocks `EmbeddingClient.embedText()` to return a deterministic 768-dimensional `Float32Array`.
  - Mocks `LanceDBClient.table.add()` and `LanceDBClient.table.search()`.
  - Tests `injectRCALesson(rca: RCAReport, client: LanceDBClient, embeddingClient: EmbeddingClient): Promise<VectorMemoryRecord>`:
    - Asserts that the generated `VectorMemoryRecord` has `type === 'RCA_LESSON'`.
    - Asserts that `record.content` contains a structured summary including the `rca.rootCause`, `rca.failedStrategies`, and `rca.correctiveAction` fields (all three must be present in the string).
    - Asserts that `record.tags` includes `'rca'`, plus all tags from `rca.tags`.
    - Asserts that `record.source_task_id` equals `rca.task_id`.
    - Asserts that `record.source_epic_id` equals `rca.epic_id`.
    - Asserts that `record.checksum` is the SHA-256 of `record.content`.
    - Asserts `client.table.add([record])` is called exactly once when no duplicate exists.
  - Tests idempotency: when `client.table.search()` returns an existing record with the same `checksum`, assert `table.add()` is NOT called.
  - Tests `injectTaskOutcomeLesson(outcome: FailedTaskOutcome, client: LanceDBClient, embeddingClient: EmbeddingClient): Promise<VectorMemoryRecord | null>`:
    - Asserts it returns `null` if `outcome.status !== 'failed'` (no lesson to inject for successful tasks without RCA).
    - Asserts it returns a `VectorMemoryRecord` with `type === 'RCA_LESSON'` when `outcome.status === 'failed'` and `outcome.rca` is defined.
    - Asserts that `outcome.rca.failedStrategies` are stored in `record.tags` prefixed with `'failed_strategy:'`.
  - Tests `buildLessonContent(rca: RCAReport): string` as a pure function:
    - Asserts the output is a deterministic Markdown-formatted string containing all required RCA fields.
    - Asserts that the string begins with `# RCA Lesson:` followed by `rca.title`.

## 2. Task Implementation

- [ ] Create `packages/memory/src/learning/types.ts` defining:
  ```typescript
  export interface RCAReport {
    title: string;
    task_id: string;
    epic_id: string;
    project_id: string;
    rootCause: string;
    failedStrategies: string[];
    correctiveAction: string;
    preventionNotes: string;
    tags: string[];
    created_at: number; // Unix ms
  }
  export interface FailedTaskOutcome {
    task_id: string;
    epic_id: string;
    project_id: string;
    status: 'completed' | 'failed';
    rca?: RCAReport;
    summary: string;
  }
  ```
- [ ] Create `packages/memory/src/learning/lesson-builder.ts` exporting `buildLessonContent(rca: RCAReport): string`:
  - Output a Markdown string in the format:
    ```
    # RCA Lesson: {rca.title}

    ## Root Cause
    {rca.rootCause}

    ## Failed Strategies
    {rca.failedStrategies.map(s => `- ${s}`).join('\n')}

    ## Corrective Action
    {rca.correctiveAction}

    ## Prevention Notes
    {rca.preventionNotes}
    ```
  - This pure function must have no side effects.
- [ ] Create `packages/memory/src/learning/learning-injector.ts` exporting:
  - `injectRCALesson(rca: RCAReport, client: LanceDBClient, embeddingClient: EmbeddingClient): Promise<VectorMemoryRecord>`:
    - Build lesson content string via `buildLessonContent(rca)`.
    - Compute `checksum` of lesson content.
    - Check for existing record with this checksum via `client.table.search(embedding).where(`checksum = '${checksum}'`).limit(1).execute()`.
    - If not found: embed the lesson content, construct `VectorMemoryRecord` with `type: 'RCA_LESSON'`, tags `['rca', ...rca.tags, ...rca.failedStrategies.map(s => `failed_strategy:${s}`)]`, and call `client.table.add([record])`.
    - Return the `VectorMemoryRecord` regardless of whether it was newly inserted or already existed.
  - `injectTaskOutcomeLesson(outcome: FailedTaskOutcome, client: LanceDBClient, embeddingClient: EmbeddingClient): Promise<VectorMemoryRecord | null>`:
    - Return `null` if `outcome.status !== 'failed'` or `!outcome.rca`.
    - Otherwise call `injectRCALesson(outcome.rca, client, embeddingClient)`.
- [ ] Register a lifecycle hook in the task runner (in `@devs/orchestrator` or the task execution module) that calls `injectTaskOutcomeLesson` after every task completes (both success and failure—the function handles filtering internally).
- [ ] Create `packages/memory/src/learning/index.ts` re-exporting all public symbols.
- [ ] Re-export from `packages/memory/src/index.ts`.

## 3. Code Review

- [ ] Verify that `buildLessonContent` is a pure function with zero side effects and is independently unit-testable.
- [ ] Verify that `failedStrategies` are stored in `tags` with the `failed_strategy:` prefix to enable future tag-based filtering queries.
- [ ] Verify that the embedding is computed on the full `buildLessonContent` output (not just `rootCause`) to capture full semantic context.
- [ ] Verify that `injectRCALesson` never throws on duplicate detection—it must silently skip and return the existing record reference.
- [ ] Verify that the lifecycle hook registration in the orchestrator is a loosely coupled event subscription (e.g., `taskEventEmitter.on('task:completed', handler)`) and not a hard-coded function call, to maintain separation of concerns.

## 4. Run Automated Tests to Verify

- [ ] Run `pnpm --filter @devs/memory test -- --testPathPattern="learning-injection"` and confirm all tests pass with zero failures.
- [ ] Run `pnpm --filter @devs/memory build` and confirm zero TypeScript compilation errors.
- [ ] Run `pnpm --filter @devs/orchestrator test` (if lifecycle hook registration was added there) and confirm no regressions.

## 5. Update Documentation

- [ ] Add a section `## RCA Learning Injection` to `packages/memory/README.md` documenting:
  - The `RCAReport` interface fields and their purpose.
  - The Markdown template format produced by `buildLessonContent`.
  - Tag naming convention (`failed_strategy:` prefix).
  - How the lifecycle hook triggers automatic injection after task failure.
- [ ] Add to agent memory: "RCA lessons are auto-injected into LanceDB as `RCA_LESSON` type entries after every failed task. Failed strategies are tagged as `failed_strategy:<strategy>`. Idempotent via SHA-256 checksum. [3_MCP-TAS-097] [8_RISKS-REQ-013]."

## 6. Automated Verification

- [ ] Run `pnpm --filter @devs/memory test -- --testPathPattern="learning-injection" --reporter=json > test-results/learning-injection.json` and assert exit code `0`.
- [ ] Assert `jq '[.testResults[].assertionResults[] | select(.status == "failed")] | length' test-results/learning-injection.json` equals `0`.
- [ ] Assert `jq '[.testResults[].assertionResults[] | select(.status == "passed")] | length' test-results/learning-injection.json` is greater than `6`.
- [ ] Verify the pure function: `node -e "import('@devs/memory').then(m => { const out = m.buildLessonContent({ title: 'T', rootCause: 'RC', failedStrategies: ['S1'], correctiveAction: 'CA', preventionNotes: 'PN', tags: [], task_id: 't1', epic_id: 'e1', project_id: 'p1', created_at: 0 }); console.assert(out.includes('# RCA Lesson: T'), 'FAIL: title missing'); console.assert(out.includes('RC'), 'FAIL: rootCause missing'); console.log('PASS'); })"` outputs `PASS`.
