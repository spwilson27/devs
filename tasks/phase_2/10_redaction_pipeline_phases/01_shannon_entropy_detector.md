# Task: Implement Shannon Entropy Calculator and High-Entropy String Detector (Sub-Epic: 10_Redaction Pipeline Phases)

## Covered Requirements
- [8_RISKS-REQ-092], [5_SECURITY_DESIGN-REQ-SEC-SD-050]

## 1. Initial Test Written
- [ ] Create `packages/secret-masker/src/__tests__/entropy.test.ts`.
- [ ] Write a unit test `calculateShannonEntropy(str: string): number` verifying:
  - Low-entropy string `"aaaaaaaaaaaaaaaaaaaaaa"` (22 chars) returns entropy ≈ 0.
  - High-entropy string `"aB3$xQ9!mK2#nP7@vL5%wR"` (22 chars) returns entropy > 4.5.
  - A typical English sentence of 20+ chars returns entropy < 4.0.
  - Empty string returns 0.
- [ ] Write a unit test `isHighEntropySecret(str: string): boolean` verifying:
  - Returns `true` for a 20+-char string with entropy > 4.5.
  - Returns `false` for a 19-char string (below length threshold), even with high entropy.
  - Returns `false` for a 20+-char string with entropy ≤ 4.5.
  - Returns `false` for an empty string.
- [ ] All tests must be written before any implementation exists; confirm they fail on first run (`npx jest packages/secret-masker --testPathPattern=entropy --no-coverage 2>&1 | grep FAIL`).

## 2. Task Implementation
- [ ] Create `packages/secret-masker/src/entropy.ts` and export:
  ```ts
  export function calculateShannonEntropy(str: string): number;
  export function isHighEntropySecret(str: string, minLength?: number, entropyThreshold?: number): boolean;
  ```
- [ ] `calculateShannonEntropy`: iterate character frequencies, compute `H = -Σ p(c) * log2(p(c))`.
- [ ] `isHighEntropySecret`: default `minLength = 20`, default `entropyThreshold = 4.5`; return `str.length >= minLength && calculateShannonEntropy(str) > entropyThreshold`.
- [ ] Export both functions from `packages/secret-masker/src/index.ts`.
- [ ] Ensure the module has no external runtime dependencies (pure TypeScript/Node built-ins only).

## 3. Code Review
- [ ] Verify `calculateShannonEntropy` handles the single-character case (entropy = 0) without `log2(0)` errors.
- [ ] Verify `isHighEntropySecret` parameters use named defaults, not magic numbers in implementation body.
- [ ] Confirm the file is pure functional (no class, no side effects, no I/O).
- [ ] Check that exported function signatures match the interfaces defined in `packages/secret-masker/src/types.ts` (create `types.ts` if it doesn't exist yet).

## 4. Run Automated Tests to Verify
- [ ] Run `npx jest packages/secret-masker --testPathPattern=entropy --coverage` and confirm all tests pass with 100% line coverage for `entropy.ts`.

## 5. Update Documentation
- [ ] Add a `## Entropy Detection` section to `packages/secret-masker/README.md` explaining the algorithm, default thresholds (`minLength=20`, `entropyThreshold=4.5`), and how to override them.
- [ ] Update the agent memory file `.agent/memory/phase_2.md` with: "Shannon entropy detector implemented in `@devs/secret-masker`. Thresholds: 20 chars, >4.5 bits."

## 6. Automated Verification
- [ ] Run `npx jest packages/secret-masker --testPathPattern=entropy --json --outputFile=/tmp/entropy_results.json && node -e "const r=require('/tmp/entropy_results.json'); process.exit(r.numFailedTests > 0 ? 1 : 0)"` to assert zero failures.
- [ ] Run `npx tsc --project packages/secret-masker/tsconfig.json --noEmit` to assert zero TypeScript compilation errors.
