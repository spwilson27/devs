# Task: SecretMasker Acceptance Testing & Security Verification (Sub-Epic: 09_SecretMasker Middleware Core)

## Covered Requirements
- [9_ROADMAP-REQ-SEC-003], [8_RISKS-REQ-114], [1_PRD-REQ-SEC-005]

## 1. Initial Test Written

- [ ] Create `packages/secret-masker/src/__tests__/acceptance.test.ts` containing an end-to-end acceptance suite that treats `SecretMasker` as a black box.
- [ ] **Accuracy benchmark test** (targets >99.9% detection rate from `9_ROADMAP-REQ-021`):
  - Build a corpus of 1,000+ synthetic secret strings representing all pattern categories (AWS keys, GitHub PATs, JWTs, PEM blocks, bearer tokens, high-entropy strings, DSNs, Slack/Stripe tokens, generic `key=value` pairs).
  - For each, assert `masker.mask(secret).hitCount > 0`.
  - Compute and log the detection rate; assert `detectionRate >= 0.999`.
- [ ] **False-positive benchmark test**:
  - Build a corpus of 500+ clearly benign strings (log lines, English prose, file paths, SQL queries, TypeScript snippets, documentation excerpts).
  - For each, assert `masker.mask(benign).hitCount === 0`.
  - Compute and log the false-positive rate; assert `falsePositiveRate <= 0.001`.
- [ ] **Redaction correctness test**:
  - For every secret in the true-positive corpus, assert the `masked` string does NOT contain the original secret value (`!masked.includes(originalSecret)`).
  - Assert all `IRedactionHit.replacedWith` values are exactly `"[REDACTED]"`.
- [ ] **Regression corpus test**: Load a set of known-bad strings from `packages/secret-masker/test-fixtures/regression-corpus.json` (created in this task) and assert 100% detection.
- [ ] All tests MUST fail initially (corpus fixture file missing, no acceptance suite).

## 2. Task Implementation

- [ ] Create `packages/secret-masker/test-fixtures/regression-corpus.json` — a JSON array of objects `{ id: string; input: string; expectRedacted: boolean; description: string }` containing at minimum:
  - 50 true-positive cases (one per pattern category).
  - 20 true-negative cases (benign strings).
  - 10 edge cases (empty string, `null`-like strings like `"null"`, very long strings, unicode-heavy strings, multi-line PEM blocks).
- [ ] Implement `packages/secret-masker/src/__tests__/acceptance.test.ts` to:
  - Load the corpus from `regression-corpus.json`.
  - For `expectRedacted: true` entries, assert `hitCount > 0` and `masked` does not contain the secret.
  - For `expectRedacted: false` entries, assert `hitCount === 0`.
  - Compute and assert accuracy and false-positive metrics.
- [ ] Create a standalone benchmark script at `packages/secret-masker/scripts/benchmark.ts`:
  - Generates N=10,000 random strings of varying entropy (using `crypto.randomBytes`) and measures throughput (strings/second) and average redaction latency (ms/string).
  - Asserts that average latency for a 4KB string is `< 5ms` (performance budget for real-time stream redaction).
  - Outputs a JSON report to `packages/secret-masker/benchmark-results.json`.
- [ ] Create `packages/secret-masker/scripts/run-acceptance.sh`:
  ```bash
  #!/usr/bin/env bash
  set -euo pipefail
  pnpm --filter @devs/secret-masker test --testPathPattern=acceptance --verbose
  pnpm --filter @devs/secret-masker ts-node scripts/benchmark.ts
  ```
- [ ] Ensure the script is executable (`chmod +x`).

## 3. Code Review

- [ ] Verify the acceptance corpus is committed to the repository (not `.gitignore`d) so future regressions are caught by CI.
- [ ] Confirm the benchmark script does not use `Date.now()` for high-resolution timing — use `process.hrtime.bigint()` instead.
- [ ] Verify the corpus covers at minimum one example per `PatternDefinition` in the `PATTERNS` array — run a cross-check: `PATTERNS.map(p => p.id)` vs corpus entry descriptions.
- [ ] Confirm the acceptance tests are deterministic (no randomness in the test itself — randomness is only in the `benchmark.ts` script which is excluded from the test suite).
- [ ] Verify all fixture data in `regression-corpus.json` is entirely synthetic — no real credentials, keys, or PII are present.

## 4. Run Automated Tests to Verify

- [ ] Run `pnpm --filter @devs/secret-masker test -- --testPathPattern=acceptance` and assert all tests pass with exit code `0`.
- [ ] Run `bash packages/secret-masker/scripts/run-acceptance.sh` and assert exit code `0`.
- [ ] Run `pnpm --filter @devs/secret-masker test` (full suite) and confirm no regressions.

## 5. Update Documentation

- [ ] Update `packages/secret-masker/.agent.md`:
  - Add an "Acceptance Criteria" section documenting the `>99.9%` detection rate and `<= 0.1%` false-positive rate requirements.
  - Document the regression corpus file path and how to add new entries when a new secret type is discovered.
  - Add an "Agentic Hook": "Run `scripts/run-acceptance.sh` after modifying patterns or the entropy threshold to verify accuracy metrics remain within bounds."
- [ ] Create a `SECURITY.md` entry at the project root (or update the existing one) noting that the `SecretMasker` is the primary defense against secret leakage, referencing `[9_ROADMAP-REQ-SEC-003]` and `[8_RISKS-REQ-114]`.

## 6. Automated Verification

- [ ] Run `pnpm --filter @devs/secret-masker test --coverage` and assert exit code `0`.
- [ ] Assert detection rate >= 99.9% by running:
  ```bash
  bash packages/secret-masker/scripts/run-acceptance.sh | grep "Detection Rate" | awk '{if ($NF+0 >= 99.9) print "PASS"; else print "FAIL"}'
  ```
- [ ] Assert no synthetic test secret appears anywhere in the SQLite state DB:
  ```bash
  grep -r "AKIAIOSFODNN7EXAMPLE\|ghp_ABCDEFGHIJKLM\|sk_live_" .devs/ 2>/dev/null && echo "FAIL: secret leaked into state" || echo "PASS: no secret leakage detected"
  ```
