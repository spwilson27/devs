# Task: Embedding Service Integration with text-embedding-004 (Sub-Epic: 02_LanceDB_Integration_and_Search)

## Covered Requirements
- [9_ROADMAP-TAS-104], [3_MCP-TAS-011]

## 1. Initial Test Written

- [ ] Create `packages/memory/src/vector/__tests__/embedder.test.ts`.
- [ ] Mock the Google Generative AI SDK (`@google/generative-ai`) using `jest.mock`. Configure the mock so that calling `embedContent` with any string returns a fixed 768-element Float32Array of all `0.1` values.
- [ ] Write a unit test for `EmbeddingService.embed(text: string): Promise<Float32Array>`:
  - Verify the return type is a `Float32Array`.
  - Verify its length is exactly `768`.
  - Verify the underlying `embedContent` call uses model `text-embedding-004`.
  - Verify the `taskType` parameter passed to the API is `RETRIEVAL_DOCUMENT` for document indexing calls.
- [ ] Write a unit test for `EmbeddingService.embedQuery(text: string): Promise<Float32Array>`:
  - Same assertions but verify `taskType` is `RETRIEVAL_QUERY` for search/retrieval calls.
- [ ] Write a unit test that triggers the retry logic by making the mock throw a `429 Resource Exhausted` error on the first call and return a valid embedding on the second call. Assert the function resolves successfully and retried exactly once.
- [ ] Write a unit test asserting that after 3 consecutive failures the function throws an `EmbeddingError` with message containing `"Failed to generate embedding after 3 attempts"`.
- [ ] All tests must fail initially (red phase).

## 2. Task Implementation

- [ ] Add `@google/generative-ai` to `packages/memory/package.json` dependencies if not already present. Run `pnpm install`.
- [ ] Create `packages/memory/src/vector/embedder.ts`:
  - Export class `EmbeddingService`:
    - Constructor accepts `{ apiKey: string; maxRetries?: number }` (default `maxRetries: 3`).
    - Internally instantiates `GoogleGenerativeAI` and the `text-embedding-004` model.
    - `async embed(text: string): Promise<Float32Array>` — calls `embedContent` with `taskType: TaskType.RETRIEVAL_DOCUMENT`. Converts the returned `number[]` to `Float32Array`.
    - `async embedQuery(text: string): Promise<Float32Array>` — same as above but with `taskType: TaskType.RETRIEVAL_QUERY`.
    - Both methods implement exponential backoff retry logic: wait `2^attempt * 100ms` between retries on `429` or `503` status codes.
    - On exhausted retries, throw a typed `EmbeddingError extends Error`.
  - Export `class EmbeddingError extends Error`.
- [ ] Create `packages/memory/src/vector/embedder-factory.ts` that exports `createEmbeddingService(config: DevsCoreConfig): EmbeddingService`. It reads `config.googleApiKey` and instantiates `EmbeddingService`. This decouples secret management from the class itself.
- [ ] Update `packages/memory/src/vector/index.ts` to re-export `EmbeddingService`, `EmbeddingError`, and `createEmbeddingService`.

## 3. Code Review

- [ ] Confirm the `taskType` distinction (`RETRIEVAL_DOCUMENT` vs `RETRIEVAL_QUERY`) is correctly applied — this is critical for embedding quality with `text-embedding-004`.
- [ ] Confirm no API key is ever logged or included in error messages.
- [ ] Confirm the `Float32Array` conversion does not silently truncate or pad the 768-element array.
- [ ] Confirm retry logic only retries on transient errors (`429`, `503`), not on `400` (bad request) or `401` (auth failure).
- [ ] Confirm the exponential backoff does not exceed 8 seconds per attempt.

## 4. Run Automated Tests to Verify

- [ ] Run: `pnpm --filter @devs/memory test -- --testPathPattern=embedder`
- [ ] All tests in `embedder.test.ts` must pass (green phase).
- [ ] Run `pnpm --filter @devs/memory build` and assert zero TypeScript compilation errors.

## 5. Update Documentation

- [ ] Create `packages/memory/src/vector/embedder.agent.md` documenting: the `text-embedding-004` model choice, the `RETRIEVAL_DOCUMENT` vs `RETRIEVAL_QUERY` task type distinction and why it matters, the retry policy, and the `EmbeddingService` API.
- [ ] Update `packages/memory/README.md` with a `## Embedding Service` section showing a usage example.

## 6. Automated Verification

- [ ] Run `pnpm --filter @devs/memory test --coverage -- --testPathPattern=embedder` and confirm 100% branch coverage on the retry logic in `embedder.ts`.
- [ ] Verify that no test makes a live network call — confirm with: `grep -r "googleapis.com" packages/memory/src/vector/__tests__/` returns no results.
- [ ] Run `pnpm --filter @devs/memory build` and assert exit code is `0`.
