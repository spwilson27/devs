# Task: Redaction False Positive Detection and Allowlist (Sub-Epic: 16_Budget Recovery and Redaction)

## Covered Requirements
- [5_SECURITY_DESIGN-REQ-SEC-RSK-902]

## 1. Initial Test Written
- [ ] Create `src/security/__tests__/RedactionEngine.falsePositive.test.ts`.
- [ ] Write a unit test asserting that `RedactionEngine.scan(content, filePath)` does NOT redact a base64-encoded PNG file header (`iVBORw0KGgo...`) when `filePath` matches an entry in `REDACTION_ALLOWLIST_PATTERNS` (e.g., `*.png`, `*.jpg`, `*.wasm`).
- [ ] Write a unit test asserting that a lock file (`package-lock.json`) containing high-entropy hash strings (e.g., `integrity: sha512-...`) is NOT redacted when the file path matches `**/package-lock.json` in the allowlist.
- [ ] Write a unit test asserting that a genuine high-entropy secret (e.g., a 40-char random hex string not on the allowlist) IS still redacted when it appears outside an allowlisted file type.
- [ ] Write a unit test for `RedactionEngine.reportFalsePositive(match: RedactionMatch, reason: string)` asserting it appends a structured entry `{ timestamp, filePath, matchedText: '<REDACTED>', reason }` to `.devs/security/false_positive_log.jsonl`.
- [ ] Write an integration test that processes a fixture directory containing both a `package-lock.json` and a `.env` file, and asserts only the `.env` values are redacted in the output.

## 2. Task Implementation
- [ ] In `src/security/RedactionEngine.ts`, update the `scan(content: string, filePath: string): ScanResult` method:
  - Before applying redaction patterns, check if `filePath` matches any glob pattern in `REDACTION_ALLOWLIST_PATTERNS` (loaded from `src/security/redactionConfig.ts`).
  - If the file is allowlisted, return `{ redacted: false, original: content, matches: [] }` immediately.
  - Add a second layer: even within non-allowlisted files, skip any match whose token entropy is >= `ENTROPY_THRESHOLD` (default `4.5` bits/char) AND whose file extension is in a binary extension set (`['.wasm', '.png', '.jpg', '.gif', '.ico', '.zip']`).
- [ ] Create `src/security/redactionConfig.ts`:
  - Export `REDACTION_ALLOWLIST_PATTERNS: readonly string[]` (glob patterns), initially containing: `['**/package-lock.json', '**/yarn.lock', '**/pnpm-lock.yaml', '**/*.png', '**/*.jpg', '**/*.jpeg', '**/*.gif', '**/*.ico', '**/*.wasm', '**/*.zip', '**/*.tar.gz']`.
  - Export `ENTROPY_THRESHOLD: number` defaulting to `4.5`.
- [ ] Implement `RedactionEngine.reportFalsePositive(match: RedactionMatch, reason: string): Promise<void>`:
  - Append a JSON line to `.devs/security/false_positive_log.jsonl` with `{ timestamp: new Date().toISOString(), filePath: match.filePath, matchedText: '[REDACTED]', reason }`.
  - Use atomic append (open with `O_APPEND | O_CREAT` flags).
- [ ] Expose a CLI sub-command `devs security false-positives` in `src/cli/commands/security.ts` that reads and pretty-prints `.devs/security/false_positive_log.jsonl` entries to stdout.

## 3. Code Review
- [ ] Verify `REDACTION_ALLOWLIST_PATTERNS` is stored in `redactionConfig.ts` and NOT hardcoded inside `RedactionEngine` logic.
- [ ] Confirm the allowlist check uses `micromatch` (already a project dependency) and not custom glob logic.
- [ ] Verify `reportFalsePositive` never throws on write failure; it must catch and log to stderr without crashing the pipeline.
- [ ] Confirm binary extension set and `ENTROPY_THRESHOLD` are configurable via `redactionConfig.ts` without requiring code changes.
- [ ] Verify that the `scan` method's return type `ScanResult` includes a `skippedDueToAllowlist: boolean` field for observability.

## 4. Run Automated Tests to Verify
- [ ] Run `npx jest src/security/__tests__/RedactionEngine.falsePositive.test.ts --coverage` and confirm all tests pass with >= 90% line coverage of the modified `RedactionEngine.ts`.
- [ ] Run the integration test: `npx jest src/security/__tests__/RedactionEngine.integration.test.ts`.
- [ ] Run `npm test` and confirm no regressions.

## 5. Update Documentation
- [ ] Create or update `src/security/RedactionEngine.agent.md` documenting the allowlist mechanism, the `ENTROPY_THRESHOLD` tunable, and the false-positive reporting API.
- [ ] Update `docs/security.md` under a "Redaction False Positives" section with: the list of default allowlisted file types, instructions for adding custom patterns to `redactionConfig.ts`, and instructions for reviewing `false_positive_log.jsonl`.
- [ ] Add a note to `docs/cli.md` documenting the `devs security false-positives` sub-command.

## 6. Automated Verification
- [ ] Run `node scripts/verify_coverage.js --module RedactionEngine --threshold 90` and assert exit code 0.
- [ ] Run `bash scripts/e2e/redaction_false_positive.sh` which should: scan the `tests/fixtures/redaction/` directory containing `package-lock.json` and `.env`, assert `package-lock.json` has zero redactions, and assert `.env` has at least one redaction.
