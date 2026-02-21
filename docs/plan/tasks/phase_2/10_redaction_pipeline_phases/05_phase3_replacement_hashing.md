# Task: Implement Phase 3 Redaction - Secret Replacement with Consistent Hashing (Sub-Epic: 10_Redaction Pipeline Phases)

## Covered Requirements
- [5_SECURITY_DESIGN-REQ-SEC-SD-052], [4_USER_FEATURES-REQ-021]

## 1. Initial Test Written
- [ ] Create `packages/secret-masker/src/__tests__/phase3-replacer.test.ts`.
- [ ] Write unit tests for `phase3Replace(text: string, confirmed: ValidatedResult[]): RedactionResult`:
  - A single confirmed AWS key in `text` → returned `redactedText` contains `[REDACTED_AWS_ACCESS_KEY_<8-char-hash>]` at the correct position; original `text` is unchanged.
  - Two confirmed secrets of different types → both replaced with correctly typed placeholders.
  - The same secret value appearing twice in `text` → both occurrences replaced with **identical** placeholders (same hash → same placeholder, ensuring consistency).
  - A `ValidatedResult` with `confirmed: false` → that span is NOT replaced in `redactedText`.
  - Empty `confirmed` array → `redactedText === text`.
  - `redactionMap` contains entries mapping each placeholder to the original value (for audit trail).
- [ ] Write a test asserting `RedactionResult` shape: `{ redactedText: string, redactionMap: Map<string, string>, replacementCount: number }`.
- [ ] Write a test asserting that the hash suffix is exactly 8 hex characters (derived from SHA-256 of the secret value, truncated).
- [ ] Write a test asserting placeholder format: `[REDACTED_<TYPE>_<8-HEX>]` using regex `\[REDACTED_[A-Z_]+_[0-9a-f]{8}\]`.
- [ ] Confirm tests fail before implementation: `npx jest packages/secret-masker --testPathPattern=phase3 --no-coverage 2>&1 | grep FAIL`.

## 2. Task Implementation
- [ ] Create `packages/secret-masker/src/phase3-replacer.ts` and export:
  ```ts
  export interface RedactionResult {
    redactedText: string;
    redactionMap: Map<string, string>;  // placeholder -> original value
    replacementCount: number;
  }

  export function phase3Replace(text: string, confirmed: ValidatedResult[]): RedactionResult;
  export function buildPlaceholder(type: string, value: string): string;
  ```
- [ ] `buildPlaceholder` implementation:
  1. Compute SHA-256 of `value` (use Node.js `crypto.createHash('sha256')`).
  2. Take the first 8 hex characters of the digest.
  3. Return `` `[REDACTED_${type.toUpperCase()}_${hash}]` ``.
- [ ] `phase3Replace` implementation:
  1. Sort `confirmed` by `start` offset descending (to safely replace from end → start without offset drift).
  2. For each `ValidatedResult` where `confirmed === true`:
     - Compute `placeholder = buildPlaceholder(result.type, result.value)`.
     - Replace `text.slice(result.start, result.end)` with `placeholder` using string slicing (not `String.replace` with regex, to avoid re-interpretation of the secret as a regex).
     - Record `redactionMap.set(placeholder, result.value)`.
  3. Return `{ redactedText, redactionMap, replacementCount }`.
- [ ] Export from `packages/secret-masker/src/index.ts`.
- [ ] Use only Node.js built-in `crypto` — no third-party hashing library.

## 3. Code Review
- [ ] Verify replacements are applied in descending offset order to prevent index drift.
- [ ] Verify `String.prototype.replace` is NOT used with the secret value as a pattern (use slice-based reassembly instead).
- [ ] Confirm `redactionMap` maps placeholder → original (not original → placeholder), so lookups can be done by the placeholder key found in redacted text.
- [ ] Confirm `buildPlaceholder` is a pure function (same inputs → same output deterministically).
- [ ] Confirm `RedactionResult.redactedText` is a new string (original `text` argument is not mutated).

## 4. Run Automated Tests to Verify
- [ ] Run `npx jest packages/secret-masker --testPathPattern=phase3 --coverage`.
- [ ] Confirm 100% line coverage for `phase3-replacer.ts`.
- [ ] Run additional edge-case smoke test: generate text with 100 distinct secrets + 50 duplicate secret values, assert `replacementCount === 150` and that the 50 duplicates share the same placeholder.

## 5. Update Documentation
- [ ] Add `## Phase 3: Replacement & Hashing` section to `packages/secret-masker/README.md` covering the placeholder format, SHA-256 hashing rationale, and `redactionMap` audit trail.
- [ ] Add a note in the documentation: "The `redactionMap` must never be logged or persisted as it contains original secret values — it is for in-memory audit only within the current request lifecycle."
- [ ] Update `.agent/memory/phase_2.md` with: "Phase 3 replacer operational. Placeholder format: `[REDACTED_<TYPE>_<8-hex>]`. Uses SHA-256 for consistent hashing. `redactionMap` is in-memory only."

## 6. Automated Verification
- [ ] Run `npx jest packages/secret-masker --testPathPattern=phase3 --json --outputFile=/tmp/phase3_results.json && node -e "const r=require('/tmp/phase3_results.json'); process.exit(r.numFailedTests > 0 ? 1 : 0)"`.
- [ ] Run `node -e "const {buildPlaceholder}=require('./packages/secret-masker/dist'); const p=buildPlaceholder('AWS_ACCESS_KEY','AKIAIOSFODNN7EXAMPLE1234'); if(!/\[REDACTED_AWS_ACCESS_KEY_[0-9a-f]{8}\]/.test(p)){console.error('FAIL:',p);process.exit(1);}console.log('PASS:',p);"` after building.
