# Task: Move Vector Search (LanceDB) to Worker Thread with Background Indexing and CPU Throttling (Sub-Epic: 15_Off-Main-Thread Performance Optimization)

## Covered Requirements
- [8_RISKS-REQ-035], [8_RISKS-REQ-128]

## 1. Initial Test Written
- [ ] Create `src/workers/__tests__/vector-search-worker.test.ts` using Vitest.
- [ ] Write a unit test mocking `WorkerBridge` that calls `vectorSearch(query, topK)` and asserts the call is delegated to `WorkerBridge.post('vector-search', { query, topK })` — NOT executed inline on the main thread.
- [ ] Write a unit test mocking `WorkerBridge` that calls `indexDocument(doc)` and asserts delegation to `WorkerBridge.post('index-document', doc)`.
- [ ] Write an integration test using a real in-memory LanceDB instance (no VSCode dependency): submit a `vector-search` task via `WorkerPool` and assert the results are returned in rank order.
- [ ] Write a test asserting that the `indexDocument` operation runs in the background and the calling `Promise` resolves within 100ms (fire-and-forget semantics with confirmation).
- [ ] Write a CPU-throttling test: spawn the `vector-search.worker.ts` with `niceness: 10` (or equivalent `setpriority` call) and assert that indexing 1,000 documents does not monopolise a simulated CPU (measure elapsed wall clock and assert < 30 seconds for the batch).
- [ ] Write a concurrency safety test: issue 20 concurrent `vectorSearch` calls and assert all 20 promises resolve with valid result arrays (no corruption from concurrent LanceDB reads).

## 2. Task Implementation
- [ ] Create `src/workers/vector-search.worker.ts`:
  - Import `LanceDB` client from `src/memory/lancedb-client.ts`.
  - Handle two message types:
    - `'vector-search'`: receive `{ query: string; topK: number }`, execute `lancedb.search(query, topK)`, post result.
    - `'index-document'`: receive `{ id: string; embedding: number[]; metadata: Record<string, unknown> }`, execute `lancedb.insert(...)`, post acknowledgement.
  - After worker initialization, call `os.setPriority(os.constants.priority.PRIORITY_LOW)` to throttle CPU impact.
  - Annotate: `// [8_RISKS-REQ-035] Vector search runs off-main-thread. [8_RISKS-REQ-128] CPU throttled via PRIORITY_LOW`.
- [ ] Create `src/memory/vector-search-bridge.ts` exporting:
  ```ts
  // [8_RISKS-REQ-035] [8_RISKS-REQ-128]
  export async function vectorSearch(query: string, topK: number): Promise<SearchResult[]>
  export async function indexDocument(doc: IndexableDocument): Promise<void>
  ```
  Both functions delegate to a singleton `WorkerPool` (`maxWorkers: 2`) scoped to `vector-search.worker.ts`.
- [ ] Replace all direct `lancedb.search(...)` and `lancedb.insert(...)` call sites in `src/memory/` and `src/research/` with the bridged functions.
- [ ] Register `vectorSearchPool.drain()` in `src/extension.ts` `deactivate()`.
- [ ] Add a `PRIORITY_LOW` guard: if `os.setPriority` fails (Windows environments may not support it), log a warning and continue — do not crash the worker.

## 3. Code Review
- [ ] Verify no direct LanceDB client calls remain in main-thread code outside `src/memory/lancedb-client.ts` constructor.
- [ ] Confirm `vector-search.worker.ts` does not import `vscode` or `fs/promises` (LanceDB storage path must be passed via `workerData`, not resolved in the worker).
- [ ] Verify `os.setPriority` call is wrapped in `try/catch` with warning log.
- [ ] Confirm `WorkerPool` cap is `maxWorkers: 2` and the choice is documented (LanceDB writes are not concurrent-safe; cap prevents write collisions while still allowing parallel reads).
- [ ] Verify the integration test uses an isolated temporary LanceDB directory (`os.tmpdir()`) so it does not pollute the project database.

## 4. Run Automated Tests to Verify
- [ ] Run `pnpm test src/workers/__tests__/vector-search-worker.test.ts` and confirm all tests pass.
- [ ] Run `pnpm test --coverage src/memory/` and confirm coverage ≥ 85%.
- [ ] Run the research pipeline integration tests: `pnpm run test:research` — confirm search results are still returned correctly.

## 5. Update Documentation
- [ ] Add a `### Vector Search & Indexing` subsection to `docs/architecture/performance.md`, documenting the worker script, the CPU throttling strategy (`PRIORITY_LOW`), and pool size rationale.
- [ ] Update `docs/agent-memory/phase_14_decisions.md` with: "LanceDB vector search and indexing moved to `vector-search.worker.ts`. Main thread MUST NOT call LanceDB search/insert directly after Phase 14. CPU throttled via `os.setPriority(PRIORITY_LOW)`."

## 6. Automated Verification
- [ ] Run `grep -rn "lancedb\.search\|lancedb\.insert" src/ --include="*.ts" | grep -v "lancedb-client.ts" | grep -v "vector-search.worker.ts" | grep -v ".test.ts"` and assert **zero** matches.
- [ ] Run `pnpm test src/workers/__tests__/vector-search-worker.test.ts --reporter=json > /tmp/vector-search-results.json && node -e "const r=require('/tmp/vector-search-results.json'); if(r.numFailedTests>0) process.exit(1)"` and assert exit code 0.
