# Task: Implement Deterministic Entropy Hashing in the Entropy Detector (Sub-Epic: 14_Multi-Agent & Distributed Execution)

## Covered Requirements
- [3_MCP-REQ-SYS-004]

## 1. Initial Test Written
- [ ] In `packages/core/src/protocol/__tests__/entropy-detector.test.ts`, write the following tests:
  - Test that `EntropyDetector.hash(errorOutput: string): string` returns a hex-encoded SHA-256 digest of the input string.
  - Test that hashing the same `errorOutput` string on two separate `EntropyDetector` instances returns the identical hash (determinism across instances).
  - Test that hashing the same input 1000 times returns the same hash every time (pure determinism, no random salting).
  - Test that `hash('')` (empty string) returns the known SHA-256 hex of the empty string (`'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'`) rather than throwing.
  - Test that `hash` treats its input as UTF-8 (not platform-dependent encoding): the string `'naïve'` must produce the same hash on Linux and macOS (both should produce the UTF-8 SHA-256).
  - Test that `EntropyDetector.detect(errors: string[]): EntropyReport` groups duplicate errors by their hash and returns a `EntropyReport` with counts, where an array of 3 identical errors yields one entry with `count: 3`.
  - Test that `EntropyReport` entries include `hash`, `count`, and `sample` (the first occurrence of the error string).

## 2. Task Implementation
- [ ] Create `packages/core/src/protocol/entropy-detector.ts`:
  - Import Node.js built-in `crypto` module (no external dependencies).
  - Implement `EntropyDetector` class:
    - `hash(errorOutput: string): string` — returns `crypto.createHash('sha256').update(errorOutput, 'utf8').digest('hex')`. Must use `'utf8'` encoding explicitly to ensure cross-platform consistency.
    - `detect(errors: string[]): EntropyReport` — builds a `Map<hash, { count, sample }>` by calling `this.hash(e)` for each error; returns `EntropyReport` with entries sorted descending by `count`.
- [ ] Define `EntropyReport` type:
  ```ts
  interface EntropyReportEntry {
    hash: string;
    count: number;
    sample: string;
  }
  interface EntropyReport {
    totalErrors: number;
    uniqueErrors: number;
    entries: EntropyReportEntry[];
  }
  ```
- [ ] Export `EntropyDetector`, `EntropyReport`, and `EntropyReportEntry` from `packages/core/src/index.ts`.

## 3. Code Review
- [ ] Verify the `hash` method explicitly passes `'utf8'` as the encoding to `crypto.createHash(...).update(input, 'utf8')` — **never** rely on the default encoding.
- [ ] Confirm the implementation uses only Node.js built-in `crypto` (no `sha.js`, `hash.js`, or other third-party hashing libraries) to avoid environment-specific differences.
- [ ] Check that `detect` sorts `EntropyReport.entries` by `count` descending.
- [ ] Verify `EntropyDetector` has no mutable state (all methods are pure) so it is safe to share a single instance across concurrent calls.

## 4. Run Automated Tests to Verify
- [ ] Run `pnpm --filter @devs/core test -- --testPathPattern entropy-detector` and confirm all tests pass.
- [ ] Specifically confirm the UTF-8 test passes (the `'naïve'` string test) — this is the cross-platform guard.
- [ ] Run coverage: `pnpm --filter @devs/core test -- --coverage --testPathPattern entropy-detector` and confirm 100% line coverage for `entropy-detector.ts` (it should be simple enough to achieve full coverage).

## 5. Update Documentation
- [ ] Add a "Entropy Detector" section to `packages/core/src/protocol/README.md`:
  - Explain that SHA-256 was chosen for stability and availability as a Node.js built-in (requirement [3_MCP-REQ-SYS-004]).
  - Document the `EntropyReport` schema.
  - Provide a code example showing how to use `EntropyDetector.detect` to identify looping/repeating errors.
- [ ] Update `index.agent.md` to record that all error output fingerprinting MUST use `EntropyDetector.hash` (SHA-256, UTF-8, hex output) and never ad-hoc string comparison.

## 6. Automated Verification
- [ ] Run `pnpm --filter @devs/core build` (exit code 0).
- [ ] Run `pnpm --filter @devs/core test` (exit code 0).
- [ ] Run `pnpm --filter @devs/core tsc --noEmit` (exit code 0).
- [ ] Inline sanity check: `node -e "const c=require('crypto');console.log(c.createHash('sha256').update('','utf8').digest('hex'))"` should print `e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855` — confirms the algorithm baseline.
