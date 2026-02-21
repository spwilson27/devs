# Task: Shannon Entropy Engine Implementation (Sub-Epic: 09_SecretMasker Middleware Core)

## Covered Requirements
- [9_ROADMAP-TAS-204], [8_RISKS-REQ-091]

## 1. Initial Test Written

- [ ] Create `packages/secret-masker/src/__tests__/entropy.test.ts`.
- [ ] Test `shannonEntropy(input: string): number`:
  - `shannonEntropy("aaaaaa")` returns `0` (no entropy).
  - `shannonEntropy("ab")` returns `1.0` (perfect 1-bit entropy for 2 equal symbols).
  - `shannonEntropy("AKIA4EXAMPLE12345678")` returns a value `> 4.5` (high-entropy AWS-like string).
  - `shannonEntropy("hello world this is a normal sentence")` returns a value `< 4.5`.
  - `shannonEntropy("")` returns `0` without throwing.
- [ ] Test `EntropyScanner.scan(input: string): IEntropyHit[]`:
  - Given a string containing a low-entropy word followed by a high-entropy token (`"token=AKIA4EXAMPLE12345678"`), `scan()` returns exactly one `IEntropyHit` containing `{ token: "AKIA4EXAMPLE12345678", entropy: number, start: number, end: number }` where `entropy > 4.5`.
  - Given a plain English sentence, `scan()` returns an empty array.
  - Given a string with multiple high-entropy tokens separated by spaces, `scan()` returns one hit per token.
- [ ] Test `SecretMasker.mask()` with entropy scanning enabled: a string `"output: AKIA4EXAMPLE12345678"` not matched by any regex pattern MUST still be redacted via entropy detection and the `masked` string MUST contain `[REDACTED]`.
- [ ] All tests MUST fail initially.

## 2. Task Implementation

- [ ] Create `packages/secret-masker/src/entropy/shannonEntropy.ts`:
  ```typescript
  export function shannonEntropy(input: string): number {
    if (!input) return 0;
    const freq = new Map<string, number>();
    for (const ch of input) freq.set(ch, (freq.get(ch) ?? 0) + 1);
    const len = input.length;
    let entropy = 0;
    for (const count of freq.values()) {
      const p = count / len;
      entropy -= p * Math.log2(p);
    }
    return entropy;
  }
  ```
- [ ] Create `packages/secret-masker/src/entropy/EntropyScanner.ts`:
  - Define `IEntropyHit: { token: string; entropy: number; start: number; end: number }`.
  - Implement `EntropyScanner` with a configurable `threshold: number` (default `4.5`) and `minLength: number` (default `16`).
  - `scan(input: string): IEntropyHit[]`: tokenize `input` by splitting on whitespace and common delimiters (`=`, `:`, `"`, `'`, `` ` ``). For each token with `length >= minLength`, compute `shannonEntropy(token)`. If `entropy >= threshold`, record an `IEntropyHit` with the correct `start`/`end` character positions in the original string.
  - Tokens shorter than `minLength` are skipped to reduce false positives.
- [ ] Create `packages/secret-masker/src/entropy/index.ts` exporting `shannonEntropy`, `EntropyScanner`, `IEntropyHit`.
- [ ] Update `SecretMasker.ts` constructor to accept an `EntropyScanner` instance (or create a default one). In `mask()`, after regex-based redaction, call `entropyScanner.scan(currentText)`. For each `IEntropyHit`, replace the matched `token` in the string with `[REDACTED]` and append an `IRedactionHit` to the results with `pattern: 'entropy'` and `matchedValue: hit.token`.
- [ ] Update `SecretMaskerFactory.create()` to wire the default `EntropyScanner` into the `SecretMasker`.
- [ ] Export `EntropyScanner`, `IEntropyHit` from `packages/secret-masker/src/index.ts`.

## 3. Code Review

- [ ] Verify the entropy function uses `Math.log2` (bits), not `Math.log` (nats), to align with the `> 4.5` bits threshold specified in requirements.
- [ ] Verify the `EntropyScanner` handles multi-byte Unicode characters correctly (iterate with `for...of`, not index-based loops).
- [ ] Confirm `minLength` is configurable and defaults to `16` to prevent redaction of short common words.
- [ ] Confirm no regular expression is used inside `shannonEntropy` (pure character frequency counting only).
- [ ] Ensure the entropy scanning pass operates on the *already regex-redacted* text so that already-replaced `[REDACTED]` placeholders are not re-processed.
- [ ] Verify the `EntropyScanner` does not mutate the input string; it only returns hit positions.

## 4. Run Automated Tests to Verify

- [ ] Run `pnpm --filter @devs/secret-masker test -- --testPathPattern=entropy` and confirm all tests pass.
- [ ] Run `pnpm --filter @devs/secret-masker test` and confirm no regressions from Tasks 01 and 02.

## 5. Update Documentation

- [ ] Update `packages/secret-masker/.agent.md`:
  - Add an "Entropy Engine" section explaining the Shannon entropy algorithm, the `4.5` bits threshold, and the `16`-character minimum token length.
  - Document that the entropy scan runs *after* regex patterns to avoid double-redacting already-replaced tokens.
  - Note the configurable `threshold` and `minLength` for future tuning.
- [ ] Add JSDoc to `shannonEntropy.ts` explaining the formula and its use in detecting high-randomness secrets.

## 6. Automated Verification

- [ ] Run `pnpm --filter @devs/secret-masker test --coverage` and assert exit code `0`.
- [ ] Run the following verification and assert `PASS`:
  ```bash
  node -e "
  const {SecretMaskerFactory} = require('./packages/secret-masker/dist');
  const masker = SecretMaskerFactory.create();
  const result = masker.mask('export TOKEN=ghp_ABCDEFGHIJKLMNOPQRSTUVWXYZ123456');
  console.log(result.hitCount > 0 && !result.masked.includes('ghp_') ? 'PASS' : 'FAIL: ' + JSON.stringify(result));
  "
  ```
