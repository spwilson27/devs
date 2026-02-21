# Task: Implement State Recovery Time KPI Benchmark and Secret Redaction Accuracy Validation (Sub-Epic: 16_Real-Time Streaming and State Synchronization)

## Covered Requirements
- [9_ROADMAP-REQ-047]

## 1. Initial Test Written
- [ ] Create `src/__tests__/kpiBenchmarks.test.ts`.
- [ ] **State Recovery Time KPI (< 2s)**:
  - Write a benchmark test that:
    1. Creates a realistic checkpoint containing 500 synthetic project files (ranging from 1KB to 50KB) and a 2MB `state.db`.
    2. Calls `RewindCommand.execute(taskId, { devsDir })` and measures elapsed time using `performance.now()`.
    3. Asserts that elapsed time is strictly less than 2000ms.
  - Write a test variant with a larger fixture (1,000 files, 5MB DB) and assert recovery still completes within 2000ms, confirming the implementation scales within budget.
  - Write a test confirming that if recovery exceeds 2000ms in the test environment (simulated via a `slowRestore` mock), a `KPIViolationError` is thrown and logged.
- [ ] **Secret Redaction Accuracy (100%)**:
  - Write a unit test for `SecretRedactor.redact(text: string)` that processes a fixture string containing 20 known secret patterns (API keys, JWTs, private key PEM blocks, OAuth tokens, AWS access key IDs, GitHub PATs) and asserts that:
    1. All 20 patterns are replaced with `[REDACTED:<type>]` placeholders.
    2. The output string contains zero raw occurrences of any input secret.
  - Write a test for `SecretRedactor` using a 10,000-line synthetic log corpus (generated with `faker` or a fixture file) seeded with 100 embedded secrets and assert 100% detection rate (0 false negatives).
  - Write a test asserting that non-secret content is not altered (0% false positives on a corpus of benign log lines).
  - Write a performance test asserting `SecretRedactor.redact()` processes 10,000 lines in < 500ms.

## 2. Task Implementation
- [ ] Create `src/benchmarks/kpiRunner.ts` implementing a `KPIRunner` class with:
  - `async measureStateRecovery(taskId: string, opts: { devsDir: string }): Promise<KPIResult>`:
    1. Record `start = performance.now()`.
    2. Await `RewindCommand.execute(taskId, opts)`.
    3. Record `elapsed = performance.now() - start`.
    4. If `elapsed >= 2000`, emit a `KPIViolationEvent` via the project's event bus with `{ kpi: 'STATE_RECOVERY_TIME', actual: elapsed, threshold: 2000 }`.
    5. Return `{ kpi: 'STATE_RECOVERY_TIME', elapsed, passed: elapsed < 2000 }`.
  - `async measureRedactionAccuracy(logLines: string[]): Promise<KPIResult>`:
    1. Run `SecretRedactor.redact(line)` on every line.
    2. Count detected secrets vs. total injected secrets (determined by comparing with a provided `secretPositions` fixture).
    3. Return `{ kpi: 'SECRET_REDACTION_ACCURACY', accuracy: detectedCount / totalCount, passed: detectedCount === totalCount }`.
- [ ] Create `src/security/secretRedactor.ts` implementing `SecretRedactor`:
  - Define a `PATTERNS` map of secret type → compiled `RegExp`:
    - `GITHUB_PAT`: `/ghp_[A-Za-z0-9]{36}/g`
    - `AWS_ACCESS_KEY`: `/AKIA[0-9A-Z]{16}/g`
    - `JWT`: `/eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/g`
    - `PRIVATE_KEY_PEM`: `/-----BEGIN (RSA |EC |OPENSSH )?PRIVATE KEY-----[\s\S]+?-----END (RSA |EC |OPENSSH )?PRIVATE KEY-----/g`
    - `OAUTH_TOKEN`: `/[Oo]auth[_\s]?[Tt]oken[:\s]+[A-Za-z0-9_\-\.]+/g`
    - `GENERIC_API_KEY`: `/[Aa][Pp][Ii][_\-]?[Kk][Ee][Yy][:\s=]+[A-Za-z0-9_\-]{16,}/g`
    - (Extend with additional patterns as needed, documented in `docs/security/redaction-patterns.md`).
  - `static redact(text: string): string`: Iterates `PATTERNS`, replacing each match with `[REDACTED:<TYPE>]`.
  - `static redactLogLines(lines: string[]): string[]`: Maps `redact` over an array for batch processing.
- [ ] Integrate `SecretRedactor.redact()` into the log pipeline: in `src/extension/logStreamer.ts` (from task 01), apply `SecretRedactor.redact()` to each log entry's `message` field before appending to the batch, ensuring secrets are scrubbed before they reach the Webview.
- [ ] Add a `kpi:benchmark` npm script to `package.json`: `"kpi:benchmark": "node dist/benchmarks/kpiRunner.js"`.
- [ ] Add `# [9_ROADMAP-REQ-047]` comments above `measureStateRecovery` and `measureRedactionAccuracy` methods.

## 3. Code Review
- [ ] Verify that all regex patterns in `PATTERNS` use the `g` flag (global) to catch multiple occurrences per line.
- [ ] Confirm `PRIVATE_KEY_PEM` pattern uses the `s` (dotAll) flag or `[\s\S]` to match multi-line PEM blocks.
- [ ] Verify `SecretRedactor.redact()` applies patterns sequentially (not concurrently) to avoid partial-match corruption.
- [ ] Confirm `KPIRunner.measureStateRecovery()` uses `performance.now()` (not `Date.now()`) for sub-millisecond precision.
- [ ] Verify that `KPIViolationEvent` emission does not throw if the event bus has no listeners (fire-and-forget pattern).
- [ ] Check TypeScript strict-mode compliance; `PATTERNS` map must be typed as `Record<string, RegExp>`.

## 4. Run Automated Tests to Verify
- [ ] Run `npm test -- --testPathPattern=kpiBenchmarks` and confirm:
  - State recovery benchmark passes (elapsed < 2000ms) for both fixture sizes.
  - Redaction accuracy is 100% on the 100-secret corpus.
  - False positive rate is 0% on the benign corpus.
  - Redaction performance test passes (< 500ms for 10,000 lines).
- [ ] Run `npm run lint` and confirm zero violations.
- [ ] Run `npm run build` and confirm zero TypeScript errors.

## 5. Update Documentation
- [ ] Create `docs/security/redaction-patterns.md` listing every pattern in `SecretRedactor.PATTERNS` with:
  - Pattern name, regex source, example matching string, example non-matching string.
  - Guidance on how to add new patterns (add to `PATTERNS`, add a unit test in `kpiBenchmarks.test.ts`).
- [ ] Create `docs/kpis/phase-14-kpis.md` documenting:
  - `STATE_RECOVERY_TIME`: definition, threshold (< 2s), measurement method, fixture size.
  - `SECRET_REDACTION_ACCURACY`: definition, threshold (100%), measurement method, corpus size.
- [ ] Update `docs/agent-memory/phase_14_decisions.md` with: "REQ-047: State recovery KPI measured via `KPIRunner.measureStateRecovery()` against a 500-file / 2MB DB fixture; secret redaction KPI measured via 100-secret log corpus with 100% required detection rate."

## 6. Automated Verification
- [ ] Run `npm test -- --testPathPattern=kpiBenchmarks --coverage` and assert coverage ≥ 90% for `src/benchmarks/kpiRunner.ts` and `src/security/secretRedactor.ts`.
- [ ] Run `npm run kpi:benchmark` with a production-representative fixture (generated by a seeding script `scripts/seed-kpi-fixture.js`) and assert the JSON output contains `{ "STATE_RECOVERY_TIME": { "passed": true }, "SECRET_REDACTION_ACCURACY": { "passed": true } }`.
- [ ] Execute `node scripts/validate-all.js` and confirm exit code 0.
- [ ] Confirm the CI pipeline test job passes after pushing this branch.
