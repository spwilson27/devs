# Task: Redaction False Positive Audit Dashboard and Remediation Flow (Sub-Epic: 16_Budget Recovery and Redaction)

## Covered Requirements
- [5_SECURITY_DESIGN-REQ-SEC-RSK-902]

## 1. Initial Test Written
- [ ] Create `src/security/__tests__/FalsePositiveAudit.test.ts`.
- [ ] Write a unit test for `FalsePositiveAudit.load(logPath: string)` asserting it correctly parses a multi-line `.jsonl` file with three entries and returns an array of `FalsePositiveEntry` objects with the correct `timestamp`, `filePath`, and `reason` fields.
- [ ] Write a unit test for `FalsePositiveAudit.load` asserting it returns an empty array (not a thrown error) when the log file does not exist.
- [ ] Write a unit test for `FalsePositiveAudit.addToAllowlist(pattern: string)` asserting it:
  1. Reads the current `REDACTION_ALLOWLIST_PATTERNS` from `src/security/redactionConfig.ts` (mocked as a JSON file at `.devs/security/redactionConfig.override.json`).
  2. Appends the new pattern if not already present.
  3. Writes the updated list back to `.devs/security/redactionConfig.override.json`.
- [ ] Write a unit test asserting `addToAllowlist` does NOT add a duplicate if the pattern already exists in the override list.
- [ ] Write a unit test for `FalsePositiveAudit.generateReport(): AuditReport` asserting the returned object groups entries by `reason` and includes a `topOffendingFileTypes` field (an array of file extensions sorted by false-positive count).

## 2. Task Implementation
- [ ] Create `src/security/FalsePositiveAudit.ts`:
  - `load(logPath?: string): Promise<FalsePositiveEntry[]>` – reads `.devs/security/false_positive_log.jsonl` line by line, parses each JSON line, and returns the array. Returns `[]` if file absent.
  - `generateReport(entries: FalsePositiveEntry[]): AuditReport` – groups by `reason`, counts by file extension, returns `{ totalCount, byReason: Record<string, number>, topOffendingFileTypes: string[] }`.
  - `addToAllowlist(pattern: string): Promise<void>` – reads `.devs/security/redactionConfig.override.json` (creates if absent), merges the new pattern, writes back atomically. `RedactionEngine` must be updated to merge the override file with `REDACTION_ALLOWLIST_PATTERNS` at startup.
- [ ] Update `RedactionEngine.ts` to merge patterns from `.devs/security/redactionConfig.override.json` (if present) into `REDACTION_ALLOWLIST_PATTERNS` at construction time, enabling runtime extensibility without code changes.
- [ ] Add `devs security audit` CLI sub-command in `src/cli/commands/security.ts`:
  - Loads entries via `FalsePositiveAudit.load()`.
  - Prints the report from `generateReport()` in a human-readable table format to stdout.
  - Accepts an `--add-to-allowlist <pattern>` flag that calls `addToAllowlist(pattern)` and prints a confirmation.

## 3. Code Review
- [ ] Verify `FalsePositiveAudit` has no direct dependency on `RedactionEngine`; the two communicate only through the allowlist override file to avoid circular imports.
- [ ] Confirm the `redactionConfig.override.json` file path is derived from a single constant (`DEVS_STATE_DIR` in `src/config/constants.ts`), not hardcoded as a string literal in multiple places.
- [ ] Verify `addToAllowlist` writes atomically (write to temp file, then rename).
- [ ] Confirm the `devs security audit --add-to-allowlist` flag validates that the provided pattern is a valid glob string before writing (use `micromatch.isMatch` on a dummy path to verify it doesn't throw).

## 4. Run Automated Tests to Verify
- [ ] Run `npx jest src/security/__tests__/FalsePositiveAudit.test.ts --coverage` and confirm all tests pass with >= 90% line coverage of `FalsePositiveAudit.ts`.
- [ ] Run `npm test` and confirm no regressions.

## 5. Update Documentation
- [ ] Create `src/security/FalsePositiveAudit.agent.md` documenting the audit report schema, the override config file mechanism, and the `devs security audit` CLI usage.
- [ ] Update `docs/security.md` to document the remediation flow: reviewing false positives → running `devs security audit` → using `--add-to-allowlist` to suppress future false positives.
- [ ] Update `docs/cli.md` to add the `devs security audit [--add-to-allowlist <pattern>]` sub-command reference.

## 6. Automated Verification
- [ ] Run `node scripts/verify_coverage.js --module FalsePositiveAudit --threshold 90` and assert exit code 0.
- [ ] Run `bash scripts/e2e/false_positive_audit.sh` which should: write two fake JSONL entries to `.devs/security/false_positive_log.jsonl`, run `devs security audit`, assert the output contains the grouped report, then run `devs security audit --add-to-allowlist "**/*.lock"` and assert the override config contains the new pattern.
