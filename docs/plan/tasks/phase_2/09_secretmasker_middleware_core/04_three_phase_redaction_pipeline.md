# Task: Three-Phase Redaction Pipeline (Sub-Epic: 09_SecretMasker Middleware Core)

## Covered Requirements
- [5_SECURITY_DESIGN-REQ-SEC-SD-049], [5_SECURITY_DESIGN-REQ-SEC-SD-038], [1_PRD-REQ-SEC-011]

## 1. Initial Test Written

- [ ] Create `packages/secret-masker/src/__tests__/redaction-pipeline.test.ts` covering the full three-phase pipeline described in the Security Design spec.
- [ ] **Phase 1 – Identification tests** (pattern + entropy detection):
  - Assert that `mask("aws_access_key_id=AKIAIOSFODNN7EXAMPLE")` populates `hits` with an entry whose `pattern` matches the AWS key ID pattern ID.
  - Assert that `mask("some random high-entropy ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890abcde string")` detects the high-entropy token via entropy scanning.
- [ ] **Phase 2 – Contextual validation tests** (false-positive suppression):
  - Assert that `mask("password=changeme")` does NOT redact when the value `"changeme"` is in the built-in `COMMON_SAFE_VALUES` allowlist (e.g., common placeholder passwords used in documentation).
  - Assert that a base64-encoded benign string of length 32 with entropy `< 4.5` is NOT flagged by the entropy scanner.
  - Assert that `mask("secret=EXAMPLE_PLACEHOLDER_DO_NOT_USE")` does NOT redact tokens matching the `KNOWN_PLACEHOLDER_REGEX` (e.g., strings containing "EXAMPLE", "PLACEHOLDER", "YOUR_", "CHANGE_ME").
- [ ] **Phase 3 – Replacement tests**:
  - Assert that `mask("token=ghp_realtoken1234567890123456789012")` returns `masked` containing `[REDACTED]` and NOT the original token.
  - Assert `hitCount` equals the number of entries in the `hits` array.
  - Assert each `IRedactionHit.replacedWith` is exactly the string `"[REDACTED]"`.
- [ ] **Idempotency test**: Assert `mask(mask("secret=abc123").masked).hitCount === 0` (re-masking already-redacted output produces no new hits).
- [ ] All tests MUST fail initially.

## 2. Task Implementation

- [ ] Create `packages/secret-masker/src/pipeline/phase1-identify.ts`:
  - Export `identifySecrets(input: string, patterns: PatternDefinition[], entropyScanner: EntropyScanner): IRawHit[]`.
  - An `IRawHit` contains `{ value: string; start: number; end: number; source: 'regex' | 'entropy'; patternId: string }`.
  - First, run all regex patterns against `input` collecting `IRawHit` entries.
  - Then run `entropyScanner.scan(input)` collecting additional `IRawHit` entries.
  - Deduplicate overlapping hits (keep the hit with the earlier `start`; discard any hit whose range overlaps an already-accepted hit).
- [ ] Create `packages/secret-masker/src/pipeline/phase2-validate.ts`:
  - Export `validateHits(hits: IRawHit[]): IRawHit[]`.
  - Maintain a `COMMON_SAFE_VALUES: Set<string>` containing known safe placeholder strings: `["changeme", "password123", "example", "test123", "your-api-key-here", "insert-token", "xxx", "todo"]`.
  - Maintain a `KNOWN_PLACEHOLDER_REGEX: RegExp` matching patterns like `/EXAMPLE|PLACEHOLDER|YOUR_|CHANGE_ME|REPLACE_ME|<.*?>/i`.
  - Filter out hits where `COMMON_SAFE_VALUES.has(hit.value.toLowerCase())` is true.
  - Filter out hits where `KNOWN_PLACEHOLDER_REGEX.test(hit.value)` is true.
  - Return the remaining validated hits.
- [ ] Create `packages/secret-masker/src/pipeline/phase3-replace.ts`:
  - Export `replaceHits(input: string, hits: IRawHit[]): { output: string; redactionHits: IRedactionHit[] }`.
  - Sort `hits` by `start` descending so that replacing from the end of the string does not invalidate earlier positions.
  - Replace each hit's character range in the string with `"[REDACTED]"`.
  - Build and return `IRedactionHit[]` from the hit metadata.
- [ ] Update `SecretMasker.mask()` to call the three phases in sequence:
  ```typescript
  const rawHits = identifySecrets(input, this.patterns, this.entropyScanner);
  const validatedHits = validateHits(rawHits);
  const { output, redactionHits } = replaceHits(input, validatedHits);
  return { masked: output, hits: redactionHits, hitCount: redactionHits.length };
  ```
- [ ] Create `packages/secret-masker/src/pipeline/index.ts` exporting the three phase functions.
- [ ] Export pipeline types from `packages/secret-masker/src/index.ts`.

## 3. Code Review

- [ ] Verify Phase 1 deduplication logic handles overlapping regex and entropy hits correctly — if both a regex pattern AND entropy detect the same substring, only one `IRedactionHit` should be emitted.
- [ ] Verify Phase 3 replacement is performed right-to-left (descending `start`) to preserve positional correctness of earlier hits.
- [ ] Confirm `COMMON_SAFE_VALUES` and `KNOWN_PLACEHOLDER_REGEX` are defined as module-level constants, not re-created on every call.
- [ ] Confirm the `"[REDACTED]"` replacement string is defined as a named constant `REDACTION_PLACEHOLDER = "[REDACTED]"` to allow future centralized changes.
- [ ] Verify each phase function is independently unit-testable and has no side effects.

## 4. Run Automated Tests to Verify

- [ ] Run `pnpm --filter @devs/secret-masker test -- --testPathPattern=redaction-pipeline` and confirm all tests pass.
- [ ] Run `pnpm --filter @devs/secret-masker test` and confirm no regressions from Tasks 01, 02, and 03.

## 5. Update Documentation

- [ ] Update `packages/secret-masker/.agent.md`:
  - Add a "Three-Phase Pipeline" section with a Mermaid diagram:
    ```mermaid
    flowchart LR
      A[Raw Input] --> B[Phase 1: Identify\nRegex + Entropy]
      B --> C[Phase 2: Validate\nFalse-Positive Filter]
      C --> D[Phase 3: Replace\nInsert [REDACTED]]
      D --> E[Masked Output + IRedactionResult]
    ```
  - Document `COMMON_SAFE_VALUES` and `KNOWN_PLACEHOLDER_REGEX` as tunable allowlists.
  - Document the `REDACTION_PLACEHOLDER` constant and its value.

## 6. Automated Verification

- [ ] Run `pnpm --filter @devs/secret-masker test --coverage` and assert exit code `0`.
- [ ] Run the idempotency check:
  ```bash
  node -e "
  const {SecretMaskerFactory} = require('./packages/secret-masker/dist');
  const m = SecretMaskerFactory.create();
  const first = m.mask('api_key=AKIAIOSFODNN7EXAMPLE00000');
  const second = m.mask(first.masked);
  console.log(second.hitCount === 0 ? 'PASS: idempotent' : 'FAIL: re-masking produced hits: ' + JSON.stringify(second));
  "
  ```
- [ ] Run `pnpm --filter @devs/secret-masker build` and assert exit code `0`.
