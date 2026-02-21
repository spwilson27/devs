# Task: Implement Drift Report Aggregation and Threshold Detection (Sub-Epic: 15_Long_Term_Memory_Drift_Investigation)

## Covered Requirements
- [9_ROADMAP-SPIKE-002]

## 1. Initial Test Written
- [ ] Create `packages/memory/src/drift/__tests__/driftReportAggregator.spec.ts`.
- [ ] Write a unit test that imports `DriftReportAggregator` and asserts `aggregate(results: IterationResult[]): DriftReport` returns a valid `DriftReport` when given an empty `results` array (all numeric fields = 0, `firstDegradationIteration = null`).
- [ ] Write a test asserting that `noiseRatioByIteration` length equals the number of `IterationResult` entries provided.
- [ ] Write a test asserting that `totalEntries` equals `syntheticEntriesPerIteration * results.length`.
- [ ] Write a test asserting that `noisyEntries` is the sum of `noisyResultCount` across all iterations.
- [ ] Write a test asserting that `firstDegradationIteration` is the index of the first iteration whose `noiseRatio` exceeds `degradationThreshold`.
- [ ] Write a test asserting that when no iteration exceeds the threshold, `firstDegradationIteration === null`.

## 2. Task Implementation
- [ ] Create `packages/memory/src/drift/DriftReportAggregator.ts`.
- [ ] Define and export `AggregatorConfig`:
  ```typescript
  export interface AggregatorConfig {
    syntheticEntriesPerIteration: number;
    degradationThreshold: number;  // noiseRatio above which reasoning degradation is declared
    metadata: DriftReport['metadata'];
  }
  ```
- [ ] Implement `DriftReportAggregator` class:
  - `constructor(config: AggregatorConfig)`
  - `aggregate(results: IterationResult[]): DriftReport`:
    1. Compute `noiseRatioByIteration = results.map(r => r.noiseRatio)`.
    2. Compute `totalEntries = syntheticEntriesPerIteration * results.length`.
    3. Compute `noisyEntries = sum(results.map(r => r.noisyResultCount))`.
    4. Find `firstDegradationIteration`: the first index `i` where `noiseRatioByIteration[i] > degradationThreshold`, or `null` if none.
    5. Return the fully populated `DriftReport` (import from task 01's types).
- [ ] Wire `DriftReportAggregator` into `DriftHarness.run()` (task 01):
  - Instantiate `DriftSimulation` and `DriftReportAggregator` inside `run()`.
  - Run `iterations` cycles, collecting `IterationResult[]`.
  - Call `aggregator.aggregate(iterationResults)` to produce and return the final `DriftReport`.
- [ ] Export from `packages/memory/src/drift/index.ts`.

## 3. Code Review
- [ ] Verify `aggregate` is a pure function: same input always produces identical output with no side effects.
- [ ] Verify `firstDegradationIteration` uses strict `>` (not `>=`) comparison against `degradationThreshold`, matching the documented semantics.
- [ ] Verify the integration inside `DriftHarness.run()` passes `metadata.noiseThreshold` through correctly to `AggregatorConfig.degradationThreshold`.
- [ ] Verify no mutation of the input `results` array inside `aggregate`.

## 4. Run Automated Tests to Verify
- [ ] Run `pnpm --filter @devs/memory test -- --testPathPattern=driftReportAggregator` and confirm all tests pass.
- [ ] Run `pnpm --filter @devs/memory test -- --testPathPattern=driftHarness` to confirm the integration in `DriftHarness.run()` still passes all original harness tests.

## 5. Update Documentation
- [ ] Add a `### DriftReportAggregator` subsection to `packages/memory/README.md` describing aggregation logic, `degradationThreshold`, and `firstDegradationIteration` semantics.
- [ ] Document the `DriftReport` type in full in `docs/architecture/memory.md`.

## 6. Automated Verification
- [ ] Run `pnpm --filter @devs/memory test --coverage -- --testPathPattern="driftReportAggregator|driftHarness"` and confirm coverage ≥ 90% for `DriftReportAggregator.ts`.
- [ ] Run `pnpm --filter @devs/memory tsc --noEmit` and confirm zero errors.
