# Task: Architectural Decision Vectorization Pipeline (Sub-Epic: 05_Long_Term_Memory_Implementation)

## Covered Requirements
- [TAS-057], [8_RISKS-REQ-013]

## 1. Initial Test Written

- [ ] In `packages/memory/src/__tests__/architectural-vectorizer.test.ts`, write a test suite `describe('ArchitecturalDecisionVectorizer')` that:
  - Mocks the `text-embedding-004` embedding call (via `@google/generative-ai` or the internal `EmbeddingClient`) to return a deterministic `Float32Array` of dimension 768.
  - Mocks the `LanceDBClient.table.add()` method.
  - Tests `vectorizeArchitecturalDecision(decision: ArchitecturalDecision): Promise<VectorMemoryRecord>`:
    - Asserts that the decision's `content` field is embedded via `embedText(decision.content)`.
    - Asserts that the returned `VectorMemoryRecord` has `type === 'ARCHITECTURAL_DECISION'`.
    - Asserts that `record.project_id` equals the supplied `projectId`.
    - Asserts that `record.source_task_id` and `record.source_epic_id` are correctly populated from the input.
    - Asserts that `record.checksum` equals the SHA-256 of `decision.content`.
    - Asserts that `record.tags` includes the decision's `category` field (e.g., `'security'`, `'performance'`, `'architecture'`).
  - Tests `persistDecision(decision: ArchitecturalDecision, client: LanceDBClient): Promise<void>`:
    - Asserts that `client.table.add([record])` is called exactly once with a correctly typed `VectorMemoryRecord`.
    - Asserts that a duplicate decision (same `checksum`) is NOT added again (idempotent insert): mocks a `table.search()` call returning an existing record with the same checksum and asserts `add()` is NOT called.
  - Tests `vectorizeDecisionsFromTaskOutcome(outcome: TaskOutcome): Promise<VectorMemoryRecord[]>`:
    - Asserts that if `outcome.architecturalDecisions` is an array of 3 decisions, exactly 3 `VectorMemoryRecord`s are returned.
    - Asserts that all returned records have `type === 'ARCHITECTURAL_DECISION'`.

## 2. Task Implementation

- [ ] Create `packages/memory/src/vectorization/types.ts` defining:
  ```typescript
  export interface ArchitecturalDecision {
    content: string;
    category: 'architecture' | 'security' | 'performance' | 'tooling' | 'testing' | 'data' | 'other';
    rationale: string;
    source_task_id: string;
    source_epic_id: string;
    project_id: string;
    decided_at: number; // Unix ms
  }
  export interface TaskOutcome {
    task_id: string;
    epic_id: string;
    project_id: string;
    status: 'completed' | 'failed';
    architecturalDecisions: ArchitecturalDecision[];
    summary: string;
  }
  ```
- [ ] Create `packages/memory/src/embedding/client.ts` exporting `EmbeddingClient` class:
  - Constructor accepts `{ apiKey: string; model?: string }` (default model: `'text-embedding-004'`).
  - Method `embedText(text: string): Promise<Float32Array>`:
    - Calls the Google Generative AI embedContent API.
    - Validates that the returned vector has exactly 768 dimensions; throws `EmbeddingDimensionError` if not.
    - Returns a `Float32Array` from the embedding values.
  - Method `embedBatch(texts: string[]): Promise<Float32Array[]>`:
    - Batches embed calls in groups of 100 (API limit) with a 200ms delay between batches to prevent rate limiting.
- [ ] Create `packages/memory/src/vectorization/architectural-vectorizer.ts` exporting:
  - `vectorizeArchitecturalDecision(decision: ArchitecturalDecision, embeddingClient: EmbeddingClient): Promise<VectorMemoryRecord>`:
    - Embed `decision.content + '\n\nRationale: ' + decision.rationale` (concatenated for richer semantic signal).
    - Compute `checksum` of `decision.content`.
    - Construct and return `VectorMemoryRecord`.
  - `persistDecision(decision: ArchitecturalDecision, client: LanceDBClient, embeddingClient: EmbeddingClient): Promise<void>`:
    - First search for existing record with matching `checksum` via `client.table.search(...).where(`checksum = '${checksum}'`).limit(1).execute()`.
    - If no existing record found, call `vectorizeArchitecturalDecision` and `client.table.add([record])`.
    - If existing record found, skip insertion and log a debug message.
  - `vectorizeDecisionsFromTaskOutcome(outcome: TaskOutcome, client: LanceDBClient, embeddingClient: EmbeddingClient): Promise<VectorMemoryRecord[]>`:
    - Iterate `outcome.architecturalDecisions`, calling `persistDecision` for each.
    - Return the array of `VectorMemoryRecord`s that were actually persisted (excluding duplicates).
- [ ] Create `packages/memory/src/vectorization/index.ts` re-exporting all public symbols.
- [ ] Register a hook in the task lifecycle runner (in the `@devs/orchestrator` package or equivalent) to call `vectorizeDecisionsFromTaskOutcome` after a task is marked `completed`.

## 3. Code Review

- [ ] Verify that the content embedded is the concatenation of `decision.content` and `decision.rationale`, not just `content` alone, to maximize semantic richness.
- [ ] Verify that duplicate detection uses `checksum` comparison (not content substring matching) to avoid O(N) scans.
- [ ] Verify that `EmbeddingClient.embedBatch` enforces the 100-text batch limit and includes inter-batch throttling.
- [ ] Verify that all `add` and `search` calls on the LanceDB table are wrapped in try/catch with descriptive error re-throws.
- [ ] Verify that `vectorizeDecisionsFromTaskOutcome` does NOT fail the entire task if vectorization of one decision fails—it must log the error and continue (partial success).

## 4. Run Automated Tests to Verify

- [ ] Run `pnpm --filter @devs/memory test -- --testPathPattern="architectural-vectorizer"` and confirm all tests pass.
- [ ] Run `pnpm --filter @devs/memory build` and confirm zero TypeScript errors.
- [ ] Verify that the `EmbeddingClient` correctly validates dimension via: `node -e "import('@devs/memory').then(m => console.log(typeof m.EmbeddingClient))"` outputs `function`.

## 5. Update Documentation

- [ ] Add a section `## Architectural Decision Vectorization` to `packages/memory/README.md` documenting:
  - The `ArchitecturalDecision` interface fields.
  - How to call `vectorizeDecisionsFromTaskOutcome`.
  - Duplicate detection via SHA-256 checksum.
  - The embedding concatenation strategy (`content + rationale`).
- [ ] Update agent memory: "Architectural decisions are auto-vectorized into LanceDB after task completion. Duplicate detection uses SHA-256 checksum. Embedding: content + rationale concatenated. [TAS-057] [8_RISKS-REQ-013]."

## 6. Automated Verification

- [ ] Run `pnpm --filter @devs/memory test -- --testPathPattern="architectural-vectorizer" --reporter=json > test-results/architectural-vectorizer.json` and assert exit code `0`.
- [ ] Assert `jq '[.testResults[].assertionResults[] | select(.status == "failed")] | length' test-results/architectural-vectorizer.json` equals `0`.
- [ ] Assert `jq '[.testResults[].assertionResults[] | select(.status == "passed")] | length' test-results/architectural-vectorizer.json` is greater than `5` (at minimum the defined test cases).
