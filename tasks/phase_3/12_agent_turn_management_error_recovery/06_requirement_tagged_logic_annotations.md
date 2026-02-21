# Task: Requirement-Tagged Logic (REQ-ID Annotations in Source & Tests) (Sub-Epic: 12_Agent Turn Management & Error Recovery)

## Covered Requirements
- [3_MCP-REQ-MCP-001]

## 1. Initial Test Written
- [ ] In `packages/core/src/__tests__/req-id-annotation.test.ts`, write tests covering:
  - `ReqIdScanner.scan(filePath)` returns a list of all `REQ: <ID>` comment strings found in a TypeScript/JavaScript source file.
  - `ReqIdScanner.scan()` returns an empty array for files with no REQ annotations (not an error).
  - `ReqIdScanner.validateCoverage(scannedIds, requiredIds)` returns `{ covered: string[]; missing: string[] }` — `missing` contains any `requiredIds` not present in `scannedIds`.
  - `ReqIdScanner.validateCoverage()` returns empty `missing` array when all required IDs are present.
- [ ] In `packages/core/src/__tests__/req-annotation-ci.test.ts`, write a coverage gate test:
  - Enumerate all files in `packages/core/src/` and `packages/mcp/src/` that correspond to a Phase 3 requirement (using the manifest in `docs/req-coverage-manifest.json`).
  - Assert that each such file contains at least one `// REQ: <ID>` comment matching its mapped requirement ID.
  - This test is intentionally a "contract test" — it fails until annotations exist, enforcing TDD adoption.

## 2. Task Implementation
- [ ] Create `packages/core/src/tooling/req-id-scanner.ts`:
  - Export class `ReqIdScanner` with method `scan(filePath: string): string[]` — use a regex `/\/\/ REQ: ([A-Z0-9_\-]+)/g` to extract all REQ-ID values from the file's text.
  - Export method `validateCoverage(scannedIds: string[], requiredIds: string[]): { covered: string[]; missing: string[] }`.
  - Add `// REQ: 3_MCP-REQ-MCP-001` comment at class definition.
- [ ] Create `docs/req-coverage-manifest.json`:
  - A JSON object mapping file paths (relative to project root) to their required REQ-IDs. Initially populated with all Phase 3 files modified in this sub-epic:
    ```json
    {
      "packages/core/src/protocol/malformed-response-handler.ts": ["3_MCP-TAS-071"],
      "packages/core/src/protocol/partial-completion-detector.ts": ["3_MCP-TAS-072"],
      "packages/core/src/protocol/partial-completion-resume-handler.ts": ["3_MCP-TAS-072"],
      "packages/core/src/mcp/tool-timeout-handler.ts": ["3_MCP-TAS-073"],
      "packages/core/src/orchestrator/task-summary.types.ts": ["3_MCP-TAS-098"],
      "packages/core/src/orchestrator/task-handoff-manager.ts": ["3_MCP-TAS-098"],
      "packages/core/src/sandbox/binary-gate.ts": ["3_MCP-TAS-041"],
      "packages/core/src/tooling/req-id-scanner.ts": ["3_MCP-REQ-MCP-001"]
    }
    ```
- [ ] Create `scripts/check-req-coverage.ts` (runnable via `ts-node`):
  - Reads `docs/req-coverage-manifest.json`.
  - For each entry, calls `ReqIdScanner.scan()` and `validateCoverage()`.
  - Prints a table of covered and missing annotations.
  - Exits with code `1` if any `missing` arrays are non-empty.
- [ ] Add a `check:req-coverage` npm script to the root `package.json`: `"check:req-coverage": "ts-node scripts/check-req-coverage.ts"`.
- [ ] Ensure every source file produced by tasks 01–05 in this sub-epic already has the appropriate `// REQ: <ID>` annotation (coordinate via the task descriptions for those files).

## 3. Code Review
- [ ] Verify `ReqIdScanner.scan()` handles files with Windows-style line endings (`\r\n`) correctly.
- [ ] Confirm `check-req-coverage.ts` script exits non-zero and prints clear human-readable output on missing annotations (file path, missing REQ IDs).
- [ ] Verify `docs/req-coverage-manifest.json` is valid JSON and contains entries only for files that have been implemented (no forward-declarations for not-yet-existing files).
- [ ] Confirm `// REQ: 3_MCP-REQ-MCP-001` annotation is present in `req-id-scanner.ts`.
- [ ] Check that the regex pattern `REQ: ([A-Z0-9_\-]+)` does not match false positives (e.g., URLs containing similar patterns) — add negative test cases if needed.

## 4. Run Automated Tests to Verify
- [ ] Run `pnpm --filter @devs/core test -- --testPathPattern="req-id-annotation|req-annotation-ci"` and confirm all tests pass.
- [ ] Run `pnpm run check:req-coverage` from the project root and confirm exit code 0 (all required annotations present).
- [ ] Run `pnpm --filter @devs/core test` (full suite) and confirm zero regressions.

## 5. Update Documentation
- [ ] Create `packages/core/src/tooling/req-id-scanner.agent.md` documenting:
  - Purpose: enforce traceability between source code and requirements.
  - Regex pattern used for annotation detection.
  - How to add entries to `docs/req-coverage-manifest.json` for new files.
  - Introspection point: `check:req-coverage` script exit code and table output.
- [ ] Update `CONTRIBUTING.md` with a section: "Requirement Annotations" explaining that all production source files must include `// REQ: <ID>` comments and how to run the coverage check.
- [ ] Update `docs/architecture/error-recovery.md` to reference requirement-tagged logic as the traceability standard for this sub-epic.

## 6. Automated Verification
- [ ] Run `pnpm run check:req-coverage` and assert exit code 0 — this is the primary automated verification gate.
- [ ] Run `pnpm --filter @devs/core test --coverage` and assert `req-id-scanner.ts` has ≥ 90% branch coverage.
- [ ] Run `pnpm --filter @devs/core build && pnpm --filter @devs/core build --filter scripts` and confirm zero TypeScript errors across both.
- [ ] Run `node -e "JSON.parse(require('fs').readFileSync('docs/req-coverage-manifest.json','utf8'))"` and assert exit code 0 (valid JSON).
