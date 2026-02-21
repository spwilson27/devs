# Task: Build the Iterative LanceDB Write-Query Drift Simulation Loop (Sub-Epic: 15_Long_Term_Memory_Drift_Investigation)

## Covered Requirements
- [9_ROADMAP-SPIKE-002]

## 1. Initial Test Written
- [ ] Create `packages/memory/src/drift/__tests__/driftSimulation.spec.ts`.
- [ ] Mock the LanceDB client (`@lancedb/lancedb`) and the embedding client (`@devs/embeddings`) using `jest.mock`.
- [ ] Write a test asserting that `DriftSimulation.runIteration(iterationIndex: number)` calls the embedding client exactly once per query in `querySet`.
- [ ] Write a test asserting that `runIteration` writes `syntheticEntries` records to LanceDB before executing queries.
- [ ] Write a test asserting that the `IterationResult` returned by `runIteration` has fields `{ iterationIndex, queriesRun, noisyResultCount, topKResults }`.
- [ ] Write a test asserting that when all cosine similarities are above the noise threshold, `noisyResultCount === 0`.
- [ ] Write a test asserting that when all cosine similarities are below the noise threshold, `noisyResultCount === queriesRun * topK`.

## 2. Task Implementation
- [ ] Create `packages/memory/src/drift/DriftSimulation.ts`.
- [ ] Define and export:
  ```typescript
  export interface IterationResult {
    iterationIndex: number;
    queriesRun: number;
    noisyResultCount: number;
    noiseRatio: number;            // noisyResultCount / (queriesRun * topK)
    topKResults: Array<{
      query: string;
      results: Array<{ id: string; score: number; isNoisy: boolean }>;
    }>;
  }
  ```
- [ ] Implement `DriftSimulation` class accepting:
  ```typescript
  constructor(config: {
    lanceDbClient: LanceDBClient;    // injected LanceDB connection
    embeddingClient: EmbeddingClient; // injected embedding provider
    noiseInjector: NoiseInjector;
    querySet: string[];
    syntheticEntries: number;        // number of fake records to write per iteration
    topK: number;                    // results to retrieve per query (default: 5)
    noiseThreshold: number;          // cosine distance cutoff
  })
  ```
- [ ] Implement `async runIteration(iterationIndex: number): Promise<IterationResult>`:
  1. Generate `syntheticEntries` random text blobs and embed them using `embeddingClient.embed(text)`.
  2. Optionally apply `noiseInjector.inject()` to a fraction of the generated embeddings before writing.
  3. Batch-write the records to LanceDB table `drift_spike` (schema: `{ id: uuid, text: string, vector: float32[], iteration: number }`).
  4. For each query in `querySet`, embed the query and call LanceDB `search(queryVector).limit(topK)`.
  5. Classify each result as noisy if `1 - cosineSimilarity(queryVector, resultVector) > noiseThreshold`.
  6. Return `IterationResult`.
- [ ] Export from `packages/memory/src/drift/index.ts`.

## 3. Code Review
- [ ] Verify LanceDB writes are batched (single `table.add(records)` call per iteration, not one record at a time).
- [ ] Verify the `drift_spike` table is created idempotently (only if it does not already exist).
- [ ] Verify cosine similarity computation is correct: `dot(a, b) / (|a| * |b|)`.
- [ ] Verify no direct LanceDB or embedding SDK imports inside the class — both must be injected.
- [ ] Verify all async paths are properly awaited and no unhandled promise rejections are possible.

## 4. Run Automated Tests to Verify
- [ ] Run `pnpm --filter @devs/memory test -- --testPathPattern=driftSimulation` and confirm all tests pass.

## 5. Update Documentation
- [ ] Add a `### DriftSimulation` subsection to `packages/memory/README.md` describing the iteration loop, the `drift_spike` table schema, and how cosine similarity is used to classify noisy results.
- [ ] Document the dependency injection pattern for `lanceDbClient` and `embeddingClient`.

## 6. Automated Verification
- [ ] Run `pnpm --filter @devs/memory test --coverage -- --testPathPattern=driftSimulation` and confirm statement coverage ≥ 85%.
- [ ] Run `pnpm --filter @devs/memory tsc --noEmit` and confirm zero TypeScript errors.
