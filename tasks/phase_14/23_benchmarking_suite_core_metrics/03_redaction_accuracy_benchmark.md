# Task: Redaction Accuracy Benchmark for SecretMasker (Sub-Epic: 23_Benchmarking Suite Core Metrics)

## Covered Requirements
- [9_ROADMAP-REQ-021]

## 1. Initial Test Written
- [ ] Create `src/benchmarking/__tests__/suites/RedactionAccuracySuite.test.ts`.
- [ ] Write a test asserting `RedactionAccuracySuite` implements `IBenchmarkSuite` with `name === 'RedactionAccuracySuite'` and `requirmentIds` containing `'9_ROADMAP-REQ-021'`.
- [ ] Write a test asserting `execute()` calls `SecretMasker.mask()` for each entry in the fixture corpus and returns a `SuiteResult`.
- [ ] Write a test with a mini-corpus of 10 entries (5 that should be masked, 5 that should not) and assert that `metrics.recall` equals the ratio of correctly-detected secrets to total secrets present.
- [ ] Write a test asserting `status === 'pass'` when `recall >= 0.999` (i.e., ≥ 99.9%).
- [ ] Write a test asserting `status === 'fail'` when `recall < 0.999`.
- [ ] Create `src/benchmarking/fixtures/__tests__/secretCorpus.test.ts` asserting that the fixture file `src/benchmarking/fixtures/secretCorpus.json` contains ≥ 500 entries and that each entry has the shape `{ id: string; input: string; containsSecret: boolean; secretType: string }`.

## 2. Task Implementation
- [ ] Create `src/benchmarking/fixtures/secretCorpus.json` containing ≥ 500 entries covering at minimum the following secret types (at least 30 entries per type):
  - `aws_access_key_id` (format: `AKIA[0-9A-Z]{16}`)
  - `aws_secret_access_key` (40-char alphanumeric)
  - `github_pat_classic` (`ghp_[A-Za-z0-9]{36}`)
  - `github_pat_fine_grained` (`github_pat_[A-Za-z0-9_]{82}`)
  - `ssh_private_key` (PEM block header)
  - `stripe_secret_key` (`sk_live_[A-Za-z0-9]{24}`)
  - `sendgrid_api_key` (`SG.[A-Za-z0-9._-]{66}`)
  - `generic_jwt` (three Base64url segments joined by `.`)
  - `google_oauth_token` (`ya29.[A-Za-z0-9._-]+`)
  - `slack_bot_token` (`xoxb-[0-9]+-[A-Za-z0-9]+`)
  - Non-secret "near-miss" entries (e.g., `containsSecret: false`) comprising ≥ 20% of corpus.
- [ ] Create `src/benchmarking/suites/RedactionAccuracySuite.ts` implementing `IBenchmarkSuite`:
  - `name = 'RedactionAccuracySuite'`
  - `requirmentIds = ['9_ROADMAP-REQ-021']`
  - `execute()`:
    1. Load `secretCorpus.json` from `src/benchmarking/fixtures/`.
    2. For each corpus entry where `containsSecret === true`, call `SecretMasker.mask(entry.input)` and check whether the returned string no longer contains the original secret (i.e., the secret has been replaced/redacted).
    3. Compute `recall = truePositives / totalSecretEntries`.
    4. Compute `falsePositiveRate = falsePositives / totalNonSecretEntries` (non-secret entries that were incorrectly masked).
    5. Return `SuiteResult` with `metrics: { recall, falsePositiveRate, totalEntries, truePositives, falsePositives, falseNegatives }`.
    6. `status = recall >= 0.999 ? 'pass' : 'fail'`.
    7. Include `details` string: `"Recall: {recall*100:.3f}% on {totalEntries} entries. FPR: {falsePositiveRate*100:.2f}%"`.
- [ ] Register `RedactionAccuracySuite` in `src/benchmarking/index.ts`.

## 3. Code Review
- [ ] Verify the corpus fixture is valid JSON and can be parsed without error at import time (add a startup validation guard).
- [ ] Verify `SecretMasker.mask()` is called with the raw `input` string and the check for redaction does not use `String.includes(input)` naively—use regex or the original secret extraction to confirm the specific secret token is gone.
- [ ] Verify `recall` is computed only over entries with `containsSecret === true`; do not count non-secret entries in the denominator of recall.
- [ ] Verify the suite is resilient to `SecretMasker` throwing exceptions: wrap each call in try/catch, count thrown cases as false negatives, and include `errors` count in `metrics`.

## 4. Run Automated Tests to Verify
- [ ] Run `npm test -- --testPathPattern="src/benchmarking/__tests__/suites/RedactionAccuracySuite"` and confirm all tests pass.
- [ ] Run `npm test -- --testPathPattern="src/benchmarking/fixtures/__tests__/secretCorpus"` and confirm the corpus has ≥ 500 entries.
- [ ] Run `npm run build` and confirm zero TypeScript errors.

## 5. Update Documentation
- [ ] Create `src/benchmarking/suites/redaction-accuracy.agent.md` documenting: the corpus schema, how to add new secret types, the recall/FPR thresholds, and how to regenerate/expand the corpus fixture.

## 6. Automated Verification
- [ ] Run `npm test -- --testPathPattern="src/benchmarking/__tests__/suites/RedactionAccuracySuite" --coverage` and confirm ≥ 90% line coverage for `RedactionAccuracySuite.ts`.
- [ ] Run `node -e "const c = require('./src/benchmarking/fixtures/secretCorpus.json'); console.assert(c.length >= 500, 'Corpus too small'); console.log('Corpus size OK:', c.length)"` and confirm no assertion error.
- [ ] Run `npx tsc --noEmit` and confirm zero errors.
