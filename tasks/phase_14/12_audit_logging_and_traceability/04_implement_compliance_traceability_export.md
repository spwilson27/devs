# Task: Implement Compliance & Traceability Export — Project Integrity Report Generator (Sub-Epic: 12_Audit Logging and Traceability)

## Covered Requirements
- [5_SECURITY_DESIGN-REQ-SEC-SD-078]

## 1. Initial Test Written

- [ ] Create `src/reporting/__tests__/IntegrityReportGenerator.test.ts` using Vitest.
- [ ] Write a unit test for `IntegrityReportGenerator.buildRequirementCommitMap(db: Database): Promise<RequirementCommitMap>`:
  - Mock the SQLite `Database` to return synthetic rows from `tasks` (`id`, `title`, `status`, `git_commit_hash`, `requirement_ids` as JSON string).
  - Assert the returned map is of type `Record<string, CommitEntry[]>` where each key is a REQ-ID and each value is an array of `{ taskId, taskTitle, commitHash, status }`.
  - Assert that requirements with no associated commit (null `git_commit_hash`) appear in the map with `commitHash: null`.
- [ ] Write a unit test for `IntegrityReportGenerator.renderMarkdownReport(map: RequirementCommitMap, projectName: string): string`:
  - Given a fixture `RequirementCommitMap` with 3 requirements (one fully traced, one partial, one missing commit), assert the output Markdown contains:
    - A `# Project Integrity Report: <projectName>` heading.
    - A `## Summary` section with counts: `Total Requirements`, `Fully Traced`, `Partially Traced`, `Untraced`.
    - A `## Requirement-to-Commit Mapping` section with one `### [REQ-ID]` subsection per requirement, listing associated tasks and their commit hashes.
    - A `## Untraced Requirements` section listing any requirements where all tasks have `commitHash: null`.
    - A footer `---\n*Report generated at <UTC timestamp>*`.
- [ ] Write a unit test for `IntegrityReportGenerator.export(outputPath: string, format: 'markdown' | 'json'): Promise<void>`:
  - Mock `buildRequirementCommitMap` and `renderMarkdownReport`. When `format = 'markdown'`, verify `fs.writeFile` is called with the `.md` content. When `format = 'json'`, verify `fs.writeFile` is called with `JSON.stringify(map, null, 2)`.
- [ ] Write an integration test: seed a temp `state.sqlite` with 5 tasks (some with `git_commit_hash`, some without), call `IntegrityReportGenerator.export(tmpOutputPath, 'markdown')`, read the output file, and assert it contains all expected REQ-ID headings and the correct summary counts.

## 2. Task Implementation

- [ ] Create `src/reporting/IntegrityReportGenerator.ts`. Export a class `IntegrityReportGenerator` with:
  - `buildRequirementCommitMap(db: Database): Promise<RequirementCommitMap>`:
    - Queries `SELECT id, title, status, git_commit_hash, requirement_ids FROM tasks`.
    - Parses `requirement_ids` (stored as JSON string array) for each task.
    - Builds and returns `Record<string, CommitEntry[]>` mapping each REQ-ID to all tasks referencing it.
  - `renderMarkdownReport(map: RequirementCommitMap, projectName: string): string`:
    - Pure function. Iterates over all keys in `map`. Computes summary stats. Returns full GFM Markdown string.
  - `export(dbPath: string, outputPath: string, format: 'markdown' | 'json'): Promise<void>`:
    - Opens DB via `DatabaseFactory`.
    - Calls `buildRequirementCommitMap`.
    - If `format = 'markdown'`: calls `renderMarkdownReport`, writes to `outputPath`.
    - If `format = 'json'`: serializes the map as pretty-printed JSON and writes to `outputPath`.
- [ ] Add a `report` subcommand to the CLI in `src/cli/commands/ReportCommand.ts`:
  ```
  devs report integrity [--output <filepath>] [--format markdown|json]
  ```
  - Defaults: `--output .devs/reports/integrity_<ISO8601>.md`, `--format markdown`.
  - Calls `IntegrityReportGenerator.export(STATE_DB_PATH, outputPath, format)`.
- [ ] Define the following types in `src/reporting/types.ts`:
  ```typescript
  export interface CommitEntry {
    taskId: string;
    taskTitle: string;
    commitHash: string | null;
    status: string;
  }
  export type RequirementCommitMap = Record<string, CommitEntry[]>;
  ```
- [ ] Add `// [5_SECURITY_DESIGN-REQ-SEC-SD-078]` inline comment above the `IntegrityReportGenerator` class declaration.

## 3. Code Review

- [ ] Verify `renderMarkdownReport` is a pure function with no I/O — all side effects are in `export()`.
- [ ] Confirm `outputPath` is validated to be within the project directory (`path.resolve` + root prefix check) to prevent path traversal.
- [ ] Ensure the summary section correctly handles edge cases: zero requirements, zero tasks with commits.
- [ ] Confirm the report does not include raw `agent_logs` content — it references only `tasks.git_commit_hash` and `tasks.requirement_ids`.
- [ ] Verify TypeScript strict mode compliance: all types explicit, no `any`.

## 4. Run Automated Tests to Verify

- [ ] Run `npm run test -- src/reporting/__tests__/IntegrityReportGenerator.test.ts` — all unit tests pass.
- [ ] Run `npm run test:integration -- IntegrityReportGenerator` — integration test produces a valid Markdown file with correct content.
- [ ] Run `npm run lint` and `npm run typecheck` — zero errors.

## 5. Update Documentation

- [ ] Create `src/reporting/IntegrityReportGenerator.agent.md` with:
  - Purpose: generates a "Project Integrity Report" mapping every requirement ID to its associated git commits via the `tasks` table.
  - CLI usage: `devs report integrity [--output <path>] [--format markdown|json]`.
  - Output formats: GitHub-Flavored Markdown or JSON.
  - Default output location: `.devs/reports/integrity_<ISO8601>.md`.
  - Covered requirement: `[5_SECURITY_DESIGN-REQ-SEC-SD-078]`.
- [ ] Create `src/cli/commands/ReportCommand.agent.md` documenting the `devs report` CLI subcommand.
- [ ] Update `docs/cli-reference.md` with a `## devs report integrity` section including all flags and a sample report snippet.

## 6. Automated Verification

- [ ] Run `node scripts/validate-all.js --check IntegrityReportGenerator` — the script must assert:
  1. `src/reporting/IntegrityReportGenerator.ts` exists and exports an `IntegrityReportGenerator` class.
  2. `src/reporting/IntegrityReportGenerator.agent.md` exists (AOD density check).
  3. All tests in `src/reporting/__tests__/` pass via `vitest run`.
  4. The string `// [5_SECURITY_DESIGN-REQ-SEC-SD-078]` appears in `src/reporting/IntegrityReportGenerator.ts`.
  5. Running `node dist/cli.js report integrity --help` exits with code 0 and stdout contains `devs report integrity`.
