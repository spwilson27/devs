# Task: TAS Diff Generation and Proposal Validation (Sub-Epic: 06_Architecture Governance Gate)

## Covered Requirements
- [3_MCP-UNKNOWN-301]

## 1. Initial Test Written

- [ ] In `src/orchestrator/__tests__/tasDiff.test.ts`, write unit tests for the `TasDiffGenerator` service:
  - **Structural diff**: Given a current TAS (JSON object) and a proposed TAS (JSON object), assert that `generateDiff()` returns a `TasDiff` object listing added, removed, and modified sections by key path (e.g., `{ modified: ["technology_stack.database", "patterns.api_style"] }`).
  - **No-op diff**: Given identical TAS objects, assert `generateDiff()` returns `{ added: [], removed: [], modified: [], isDelta: false }`.
  - **PRD constraint violation**: Given a proposed TAS that changes `technology_stack.language` from `"TypeScript"` to `"Python"` when the PRD has `constraints.language = "TypeScript"`, assert `validateAgainstPrd()` returns `{ valid: false, violations: [{ field: "technology_stack.language", prd_constraint: "TypeScript", proposed_value: "Python" }] }`.
  - **Valid proposal**: Given a proposed TAS that only modifies `technology_stack.orm` (not constrained by PRD), assert `validateAgainstPrd()` returns `{ valid: true, violations: [] }`.
  - **Diff storage**: Assert that `storeDiff(gate_id, diff)` inserts a row into `tas_revision_diffs` table and returns the `diff_id`.

## 2. Task Implementation

- [ ] Create `src/orchestrator/tasDiff.ts` implementing the `TasDiffGenerator` class:
  - `generateDiff(currentTas: TasDocument, proposedTas: TasDocument): TasDiff` — uses deep structural comparison (JSON diff algorithm). A `TasDocument` is the parsed content of `docs/architecture/TAS.md` converted to a structured object via `TasParser`.
  - `validateAgainstPrd(diff: TasDiff, prd: PrdDocument): ValidationResult` — iterates `diff.modified` and `diff.removed` sections, cross-references against `prd.constraints` array, flags any proposed change that contradicts a PRD constraint.
  - `storeDiff(gate_id: string, diff: TasDiff): Promise<string>` — inserts into `tas_revision_diffs` table (columns: `diff_id`, `gate_id`, `diff_json`, `prd_validation_json`, `created_at`) and returns `diff_id`.
- [ ] Create `src/orchestrator/tasParser.ts` implementing `TasParser`:
  - `parse(tasMarkdown: string): TasDocument` — converts the Markdown TAS document into a structured JSON object keyed by section heading hierarchy (e.g., `{ technology_stack: { database: "SQLite", ... }, patterns: { api_style: "REST" } }`).
  - The parser MUST be deterministic: same Markdown → same JSON every time.
- [ ] Add the `tas_revision_diffs` table migration to `src/db/migrations/`. Schema:
  ```sql
  CREATE TABLE IF NOT EXISTS tas_revision_diffs (
    diff_id TEXT PRIMARY KEY,
    gate_id TEXT NOT NULL REFERENCES tas_revision_requests(gate_id),
    diff_json TEXT NOT NULL,
    prd_validation_json TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
  ```
- [ ] Wire `TasDiffGenerator` into the `request_tas_revision` tool handler (task 02): after inserting into `tas_revision_requests`, call `generateDiff()`, `validateAgainstPrd()`, and `storeDiff()`. Include `diff_id` and `prd_validation` in the SSE event payload.

## 3. Code Review

- [ ] Verify `TasParser` handles all section heading levels (H1–H4) used in the actual `TAS.md` template and does not silently drop subsections.
- [ ] Verify `generateDiff()` performs a deep structural diff, not a shallow key comparison — nested objects must be recursively compared.
- [ ] Verify `validateAgainstPrd()` does not block valid revisions — only explicitly stated PRD constraints should generate violations (no over-eager matching).
- [ ] Verify `storeDiff()` uses a SQLite transaction and that the `gate_id` FK constraint is enforced at the DB level.
- [ ] Confirm `TasDocument` and `PrdDocument` types are exported from `src/orchestrator/types.ts` and are used consistently across the codebase.

## 4. Run Automated Tests to Verify

- [ ] Run `npm test -- --testPathPattern="tasDiff"` and confirm all tests pass with zero failures.
- [ ] Run `npm test -- --testPathPattern="tasParser"` and confirm all parser tests pass.
- [ ] Run `npm run type-check` and confirm no new TypeScript errors.
- [ ] Run `npm run lint` and confirm no violations.

## 5. Update Documentation

- [ ] Update `src/orchestrator/orchestrator.agent.md` to document the `TasDiffGenerator` and `TasParser` services: their purpose, input/output types, and integration point with the `request_tas_revision` tool.
- [ ] Document the `tas_revision_diffs` table in `docs/architecture/database-schema.md`.
- [ ] Add a section to `docs/architecture/tas-revision-workflow.md` describing how diffs are generated, validated, and stored as part of the `TAS_REVISION_GATE` flow.

## 6. Automated Verification

- [ ] Run `node scripts/verify_sqlite_schema.js` — asserts `tas_revision_diffs` table exists with all required columns and FK constraint. MUST exit 0.
- [ ] Run `node scripts/verify_tas_parser_roundtrip.js` — loads the actual `docs/templates/TAS.template.md`, parses it with `TasParser`, serializes back to JSON, and asserts the result is a non-empty object with at least 3 top-level keys. MUST exit 0.
