# Task: Loop Detection Logic via SAOP Hash Comparison (Sub-Epic: 14_Entropy Detection and Pivot)

## Covered Requirements
- [3_MCP-TAS-019]

## 1. Initial Test Written
- [ ] Create `src/reliability/entropy/__tests__/EntropyDetector.test.ts`.
- [ ] Write a unit test that instantiates `EntropyDetector` (wrapping a `SaopHashTracker`) and asserts `isLooping()` returns `false` when fewer than 3 observations have been recorded.
- [ ] Write a unit test that records 3 identical SAOP payloads and asserts `isLooping()` returns `true`.
- [ ] Write a unit test that records 3 payloads where only 2 are identical and asserts `isLooping()` returns `false`.
- [ ] Write a unit test that records 3 distinct payloads and asserts `isLooping()` returns `false`.
- [ ] Write a unit test that records 4 identical payloads (ring buffer evicts first), and asserts `isLooping()` still returns `true` (last 3 are identical).
- [ ] Write a unit test that records 3 identical payloads then 1 different payload and asserts `isLooping()` returns `false` (loop broken).
- [ ] Write a unit test verifying `reset()` causes `isLooping()` to return `false` even after a detected loop.

## 2. Task Implementation
- [ ] Create `src/reliability/entropy/EntropyDetector.ts`.
- [ ] Import `SaopHashTracker` from `./SaopHashTracker`.
- [ ] Define `EntropyDetector` class:
  - Constructor accepts an optional `SaopHashTracker` instance (default: `new SaopHashTracker()`), enabling dependency injection for testing.
  - `recordObservation(payload: string): void` — delegates to the tracker.
  - `isLooping(): boolean` — retrieves `getHashes()`, checks if length equals the tracker's capacity (3), and returns `true` if and only if all hashes are identical (i.e., `new Set(hashes).size === 1`).
  - `reset(): void` — delegates to `tracker.reset()`.
- [ ] Export `EntropyDetector` as a named export.
- [ ] Add `EntropyDetector` to the barrel export in `src/reliability/entropy/index.ts`.

## 3. Code Review
- [ ] Confirm `isLooping()` uses a `Set`-based uniqueness check (not manual loops) for clarity and correctness.
- [ ] Confirm the detector does not own its own hashing logic — it fully delegates to `SaopHashTracker`.
- [ ] Confirm dependency injection is used so the tracker can be mocked in tests.
- [ ] Confirm the capacity (3) is not hardcoded in `EntropyDetector` — it reads it from the tracker's returned array length.
- [ ] Confirm all edge cases (empty buffer, partial buffer) return `false`.

## 4. Run Automated Tests to Verify
- [ ] Run `npm test -- --testPathPattern="EntropyDetector"` and verify all tests pass with zero failures.
- [ ] Run `npm run lint src/reliability/entropy/EntropyDetector.ts` and confirm zero lint errors.

## 5. Update Documentation
- [ ] Append to `src/reliability/entropy/entropy.agent.md` a section describing `EntropyDetector`: the hash-comparison algorithm, the 3-observation window, and the `isLooping()` semantics.
- [ ] Document that the window size is controlled by `SaopHashTracker`'s `capacity` parameter.

## 6. Automated Verification
- [ ] Run `npm test -- --coverage --testPathPattern="EntropyDetector"` and confirm 100% branch coverage for `EntropyDetector.ts`.
- [ ] Run `grep -r "EntropyDetector" src/reliability/entropy/index.ts` to confirm the barrel export exists.
