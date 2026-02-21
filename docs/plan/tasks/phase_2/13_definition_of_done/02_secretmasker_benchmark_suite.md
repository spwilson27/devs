# Task: SecretMasker Benchmark Suite (Sub-Epic: 13_Definition of Done)

## Covered Requirements
- [9_ROADMAP-DOD-P2], [9_ROADMAP-REQ-021]

## 1. Initial Test Written
- [ ] In `packages/sandbox/src/__tests__/dod/secretmasker-benchmark.dod.test.ts`, write a test suite named `"[DoD-P2] SecretMasker Recall Benchmark"`.
- [ ] Write a test `"should achieve >99.9% recall on the 500-secret benchmark corpus"`:
  - Load the benchmark fixture file `packages/sandbox/src/__fixtures__/secrets-benchmark.json` (to be created in implementation) containing at minimum 500 distinct secret strings across categories: AWS access keys, GitHub PATs, SSH private key headers, GCP service account JSON fragments, Stripe secret keys, JWT tokens, high-entropy base64 blobs (>4.5 Shannon entropy), database connection strings with passwords, and `.env` file key=value pairs.
  - Pass each secret through `SecretMasker.mask(input: string): string`.
  - Assert that the returned string does NOT contain the original secret value.
  - Compute `recall = secretsRedacted / totalSecrets`.
  - Assert `recall > 0.999` (i.e., at most 0 failures in 500, meaning 1 miss would fail at exactly 500 secrets — the threshold enforces strict near-perfection).
- [ ] Write a test `"should NOT redact non-secret benign strings"` (precision check): pass 100 benign strings (random words, URLs without credentials, version numbers) through `SecretMasker.mask()` and assert none are altered, ensuring the precision rate is 100%.
- [ ] Write a test `"should persist benchmark results to state.sqlite dod_results"`: assert a `PASS` row exists with `criterion: "SECRETMASKER_RECALL"` and `detail` JSON containing `{ recall, totalSecrets, redactedCount }`.
- [ ] Confirm all tests start **RED**.

## 2. Task Implementation
- [ ] Create `packages/sandbox/src/__fixtures__/secrets-benchmark.json`: a JSON array of objects `{ "id": string, "category": string, "secret": string, "isBenign": boolean }` with at minimum 500 secret entries and 100 benign entries. Populate with realistic but non-functional (randomly generated) secret strings for each category defined in the test above.
- [ ] In `packages/sandbox/src/dod/secretmasker-benchmark-runner.ts`, implement and export `class SecretMaskerBenchmarkRunner`.
  - Constructor accepts a `SecretMasker` instance and a `DatabaseService`.
  - Method `run(): Promise<SecretMaskerBenchmarkResult>` that:
    1. Loads the fixture file.
    2. Runs `SecretMasker.mask()` on each entry.
    3. Evaluates whether secrets are redacted (does not contain original) and benign strings are unchanged.
    4. Computes `recall` and `precision`.
    5. Persists to `state.sqlite` `dod_results` with `criterion: "SECRETMASKER_RECALL"` and full stats in `detail` JSON.
    6. Returns `{ pass: recall > 0.999 && precision === 1.0, recall, precision, totalSecrets, redactedCount, falsePositiveCount }`.
- [ ] Ensure `SecretMasker` (implemented in sub-epic `09_secretmasker_middleware_core`) is imported without modification — this task only adds the benchmark runner and fixture.

## 3. Code Review
- [ ] Verify the fixture contains entries from ALL specified secret categories (at least 8 categories, minimum 500 total secrets).
- [ ] Verify the recall threshold is `> 0.999`, not `>= 0.999` or `=== 1.0`, matching the DoD specification exactly.
- [ ] Verify no secret in the fixture is a real credential (all must be syntactically valid but cryptographically fake/randomly generated).
- [ ] Verify the benchmark runner does not modify `SecretMasker` source — it is a pure consumer.
- [ ] Verify the `detail` JSON stored in `dod_results` contains enough information to diagnose any failures (i.e., includes `missedSecretIds: string[]`).

## 4. Run Automated Tests to Verify
- [ ] Run `pnpm --filter @devs/sandbox test -- --testPathPattern=dod/secretmasker-benchmark` and confirm all tests pass (GREEN).
- [ ] Confirm test output logs `recall` value (e.g., `Recall: 1.000 (500/500)`).
- [ ] Confirm the `PASS` row in `state.sqlite`: `sqlite3 .devs/state.sqlite "SELECT detail FROM dod_results WHERE phase='P2' AND criterion='SECRETMASKER_RECALL';"`.

## 5. Update Documentation
- [ ] In `packages/sandbox/.agent.md`, under `## DoD Verification`, document `SecretMaskerBenchmarkRunner`, the fixture format, and the `SECRETMASKER_RECALL` criterion.
- [ ] Update `docs/phase_2_dod.md` with row: `| P2 | SECRETMASKER_RECALL | >99.9% recall on 500+ secrets | SecretMaskerBenchmarkRunner | state.sqlite:dod_results |`.
- [ ] Note in the fixture file's adjacent `README` that all secrets are synthetic and must never be replaced with real credentials.

## 6. Automated Verification
- [ ] The script `scripts/verify-dod.sh P2 SECRETMASKER_RECALL` must query `state.sqlite` for `phase='P2' AND criterion='SECRETMASKER_RECALL' AND result='PASS'` and exit `0` / `1` accordingly.
- [ ] Additionally, the script should parse the `detail` JSON and print the `recall` value and `missedSecretIds` list for observability.
- [ ] Confirm CI invokes this check as a required gate before Phase 3 can begin.
