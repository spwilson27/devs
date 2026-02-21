# Task: Design the Long-Term Memory Drift Investigation Harness (Sub-Epic: 15_Long_Term_Memory_Drift_Investigation)

## Covered Requirements
- [9_ROADMAP-SPIKE-002]

## 1. Initial Test Written
- [ ] Create `packages/memory/src/drift/__tests__/driftHarness.spec.ts`.
- [ ] Write a unit test that imports `DriftHarness` and asserts it can be instantiated with a `DriftHarnessConfig` object containing `{ lanceDbPath: string, embeddingModel: string, iterations: number, querySet: string[] }`.
- [ ] Write a test that asserts `DriftHarness.run()` returns a `DriftReport` object with fields: `{ totalEntries: number, noisyEntries: number, noiseRatioByIteration: number[], firstDegradationIteration: number | null }`.
- [ ] Write a test asserting that if `lanceDbPath` does not exist, the constructor throws a `DriftHarnessConfigError`.
- [ ] Write a test that asserts the harness records a `noiseRatioByIteration` array with one entry per iteration.

## 2. Task Implementation
- [ ] Create `packages/memory/src/drift/DriftHarness.ts`.
- [ ] Define and export the `DriftHarnessConfig` interface:
  ```typescript
  export interface DriftHarnessConfig {
    lanceDbPath: string;       // Absolute path to the .devs/memory.lancedb directory
    embeddingModel: string;    // e.g., "text-embedding-004"
    iterations: number;        // Number of write+query cycles to simulate
    querySet: string[];        // Baseline queries used to probe memory quality
    noiseThreshold?: number;   // Cosine distance threshold above which a result is "noisy" (default: 0.35)
  }
  ```
- [ ] Define and export the `DriftReport` interface:
  ```typescript
  export interface DriftReport {
    totalEntries: number;
    noisyEntries: number;
    noiseRatioByIteration: number[];
    firstDegradationIteration: number | null;  // Iteration index where noiseRatio first exceeds threshold
    metadata: {
      lanceDbPath: string;
      embeddingModel: string;
      iterations: number;
      noiseThreshold: number;
      runAt: string;  // ISO timestamp
    };
  }
  ```
- [ ] Define and export the `DriftHarnessConfigError` class extending `Error`.
- [ ] Implement `DriftHarness` class with:
  - `constructor(config: DriftHarnessConfig)` — validates config, throws `DriftHarnessConfigError` if `lanceDbPath` does not exist.
  - `async run(): Promise<DriftReport>` — orchestrates the iteration loop (stub for now; populate in subsequent tasks).
- [ ] Export all public types and the class from `packages/memory/src/drift/index.ts`.
- [ ] Add `drift` to the barrel export of `packages/memory/src/index.ts`.

## 3. Code Review
- [ ] Verify `DriftHarnessConfig` and `DriftReport` are fully typed with no `any`.
- [ ] Verify `DriftHarnessConfigError` includes a descriptive message with the offending `lanceDbPath`.
- [ ] Verify barrel exports are consistent with the rest of `@devs/memory` package conventions.
- [ ] Confirm no business logic leaks into the constructor; it should only validate and store config.

## 4. Run Automated Tests to Verify
- [ ] Run `pnpm --filter @devs/memory test -- --testPathPattern=driftHarness` and confirm all tests pass with no skipped assertions.

## 5. Update Documentation
- [ ] Add a `## Drift Investigation Harness` section to `packages/memory/README.md` describing `DriftHarnessConfig`, `DriftReport`, and the purpose of the harness.
- [ ] Update `docs/architecture/memory.md` to reference the spike investigation harness and the `[9_ROADMAP-SPIKE-002]` requirement.

## 6. Automated Verification
- [ ] Run `pnpm --filter @devs/memory test --coverage -- --testPathPattern=driftHarness` and confirm coverage of `DriftHarness.ts` is ≥ 90%.
- [ ] Run `pnpm --filter @devs/memory tsc --noEmit` and confirm zero TypeScript errors.
