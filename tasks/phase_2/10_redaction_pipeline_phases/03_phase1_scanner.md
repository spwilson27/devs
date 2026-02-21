# Task: Implement Phase 1 Redaction - Combined Pattern & Entropy Scanner (Sub-Epic: 10_Redaction Pipeline Phases)

## Covered Requirements
- [5_SECURITY_DESIGN-REQ-SEC-SD-050], [8_RISKS-REQ-092], [4_USER_FEATURES-REQ-021]

## 1. Initial Test Written
- [ ] Create `packages/secret-masker/src/__tests__/phase1-scanner.test.ts`.
- [ ] Write a unit test for `phase1Scan(text: string): ScanResult[]` covering:
  - Input containing an AWS access key → result includes a `ScanResult` with `type: "AWS_ACCESS_KEY"`, correct `start`/`end` offsets, and `detectionMethod: "pattern"`.
  - Input containing a high-entropy random string (20+ chars, entropy > 4.5) with no regex match → result includes a `ScanResult` with `type: "HIGH_ENTROPY"` and `detectionMethod: "entropy"`.
  - Input containing both a regex-matched secret and a separate high-entropy string → two `ScanResult` entries are returned.
  - Input with overlapping regex match and entropy detection → deduplicated results (longest span wins, no duplicate ranges).
  - Input containing a known-safe high-entropy string that matches a pattern allowlist (e.g., a git SHA) → result is empty (allowlisted).
  - Input that is completely safe (no secrets, no high entropy) → returns empty array.
  - Large input (>100KB string) with 10 embedded secrets → all 10 are detected with correct offsets.
- [ ] Write a test asserting `ScanResult` contains fields: `{ type, value, start, end, detectionMethod, entropy? }`.
- [ ] Confirm tests fail before implementation: `npx jest packages/secret-masker --testPathPattern=phase1 --no-coverage 2>&1 | grep FAIL`.

## 2. Task Implementation
- [ ] Create `packages/secret-masker/src/phase1-scanner.ts` and export:
  ```ts
  export interface ScanResult {
    type: string;
    value: string;
    start: number;
    end: number;
    detectionMethod: 'pattern' | 'entropy';
    entropy?: number;
  }

  export function phase1Scan(text: string): ScanResult[];
  ```
- [ ] Implementation steps:
  1. Run `findPatternMatches(text)` (from `patterns.ts`) to get all regex hits.
  2. Scan `text` with a sliding window of 20–256 chars; for each window call `isHighEntropySecret`; collect spans where entropy > 4.5. Optimize by only starting a new window at non-alphanumeric boundaries (reduces redundant overlap).
  3. Merge the two sets of spans, deduplicating overlapping ranges (prefer pattern-matched `type` over `HIGH_ENTROPY` when overlapping; prefer the longer span when both are entropy-only).
  4. Apply an allowlist of safe patterns (git SHAs, UUIDs in non-secret contexts, base64-encoded images): skip spans whose full `value` matches an entry in `SAFE_PATTERN_ALLOWLIST`.
  5. Return the sorted, deduplicated `ScanResult[]`.
- [ ] Export `SAFE_PATTERN_ALLOWLIST: RegExp[]` from `phase1-scanner.ts` to allow extension.
- [ ] The entropy sliding window must not be O(n²); implement as a single-pass character-frequency update (add new char, remove dropped char, recompute H in O(alphabet_size) per step).

## 3. Code Review
- [ ] Verify the sliding-window entropy scan is O(n) in time and O(1) in space (alphabet size is constant).
- [ ] Verify deduplication logic has no off-by-one errors (write a specific edge case: two adjacent secrets, one ending at index `i`, next starting at `i+1`).
- [ ] Confirm `SAFE_PATTERN_ALLOWLIST` is exported (so downstream phases can extend it).
- [ ] Confirm the function is pure: no global mutable state, no side effects.
- [ ] Check that `entropy` field is populated only for `detectionMethod: 'entropy'` results.

## 4. Run Automated Tests to Verify
- [ ] Run `npx jest packages/secret-masker --testPathPattern=phase1 --coverage`.
- [ ] Confirm 100% line coverage for `phase1-scanner.ts`.
- [ ] Run the performance smoke test: generate a 500KB string with 50 embedded secrets, assert `phase1Scan` completes in < 500ms.

## 5. Update Documentation
- [ ] Add a `## Phase 1: Pattern & Entropy Detection` section to `packages/secret-masker/README.md` describing the combined strategy, allowlisting mechanism, and performance characteristics.
- [ ] Document the `SAFE_PATTERN_ALLOWLIST` extension point in `packages/secret-masker/docs/allowlist.md`.
- [ ] Update `.agent/memory/phase_2.md` with: "Phase 1 scanner operational. Combines regex + sliding-window entropy. O(n) time. Allowlist-extensible via `SAFE_PATTERN_ALLOWLIST`."

## 6. Automated Verification
- [ ] Run `npx jest packages/secret-masker --testPathPattern=phase1 --json --outputFile=/tmp/phase1_results.json && node -e "const r=require('/tmp/phase1_results.json'); process.exit(r.numFailedTests > 0 ? 1 : 0)"`.
- [ ] Run the benchmark script `node packages/secret-masker/scripts/benchmark-phase1.js` (create this script as part of the task) that generates 500KB input and asserts scan time < 500ms, exiting with code 1 on failure.
