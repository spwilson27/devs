# Task: Implement Synthetic Memory Noise Injection Pipeline (Sub-Epic: 15_Long_Term_Memory_Drift_Investigation)

## Covered Requirements
- [9_ROADMAP-SPIKE-002]

## 1. Initial Test Written
- [ ] Create `packages/memory/src/drift/__tests__/noiseInjector.spec.ts`.
- [ ] Write a unit test that imports `NoiseInjector` and asserts it can be instantiated with `{ vectorDimension: number, noiseStrategy: 'gaussian' | 'random_replace' | 'semantic_shuffle' }`.
- [ ] Write a test asserting that `NoiseInjector.inject(vector: number[])` returns a `number[]` of the same length.
- [ ] Write a test asserting that when `noiseStrategy = 'gaussian'` and `stddev = 0`, the output vector equals the input vector (identity case).
- [ ] Write a test asserting that when `noiseStrategy = 'random_replace'` with `replaceRatio = 1.0`, every element differs from the original.
- [ ] Write a test asserting that `NoiseInjector.batchInject(vectors: number[][], count: number)` returns exactly `count` injected vectors.

## 2. Task Implementation
- [ ] Create `packages/memory/src/drift/NoiseInjector.ts`.
- [ ] Define and export `NoiseInjectorConfig`:
  ```typescript
  export interface NoiseInjectorConfig {
    vectorDimension: number;
    noiseStrategy: 'gaussian' | 'random_replace' | 'semantic_shuffle';
    stddev?: number;        // For 'gaussian' (default: 0.1)
    replaceRatio?: number;  // For 'random_replace' (default: 0.2) – fraction of elements to randomize
    seed?: number;          // Optional RNG seed for reproducibility
  }
  ```
- [ ] Implement `NoiseInjector` class:
  - `constructor(config: NoiseInjectorConfig)` — validates `vectorDimension > 0`.
  - `inject(vector: number[]): number[]` — applies the configured noise strategy:
    - `gaussian`: adds zero-mean Gaussian noise with the configured `stddev` to each element, then L2-normalizes.
    - `random_replace`: randomly replaces `replaceRatio` fraction of elements with values drawn from `[-1, 1]`, then L2-normalizes.
    - `semantic_shuffle`: shuffles a `replaceRatio` fraction of element positions.
  - `batchInject(vectors: number[][], count: number): number[][]` — calls `inject` on `count` sampled vectors (sampling with replacement if `count > vectors.length`).
- [ ] Use a seeded LCG or `seedrandom` (already in devDependencies) for reproducible randomness when `seed` is provided.
- [ ] Export from `packages/memory/src/drift/index.ts`.

## 3. Code Review
- [ ] Verify all three noise strategies produce L2-normalized output vectors (length ≈ 1.0 ± 0.001).
- [ ] Verify `batchInject` does not mutate the input `vectors` array.
- [ ] Verify no `any` types; all arithmetic operates on `number[]`.
- [ ] Verify that `seed` reproducibility is honored: two calls with the same seed and same input produce identical output.

## 4. Run Automated Tests to Verify
- [ ] Run `pnpm --filter @devs/memory test -- --testPathPattern=noiseInjector` and confirm all tests pass.

## 5. Update Documentation
- [ ] Add a `### NoiseInjector` subsection under the `## Drift Investigation Harness` section in `packages/memory/README.md` describing the three noise strategies and configuration options.
- [ ] Document the L2-normalization guarantee and the reproducible-seed behavior.

## 6. Automated Verification
- [ ] Run `pnpm --filter @devs/memory test --coverage -- --testPathPattern=noiseInjector` and confirm branch coverage ≥ 85% for `NoiseInjector.ts`.
- [ ] Run `pnpm --filter @devs/memory tsc --noEmit` and confirm zero errors.
