# Task: Implement Requirement ID Tagging Convention and Audit Trail (Sub-Epic: 01_Core TypeScript Configuration)

## Covered Requirements
- [TAS-063]

## 1. Initial Test Written
- [ ] Write a Jest test (`src/__tests__/req-tagging.test.ts`) that:
  - Uses `fast-glob` (or Node `fs.glob`) to enumerate all `.ts` files under `src/` (excluding `.test.ts` and `.d.ts`).
  - For each file, reads its content and asserts that every exported function, class method, or class declaration has a JSDoc comment containing a `@req` tag (e.g., `@req TAS-005`) or a structured inline comment `// [REQ: TAS-005]`.
  - Builds a map of `REQ-ID → [file:line, ...]` and asserts no REQ-ID appears without a corresponding entry in `requirements.md`.
- [ ] Write a parallel test for `*.test.ts` files that:
  - Asserts every `describe` or `it`/`test` block has a leading comment or a `tags` property (e.g., `// [REQ: TAS-063]`) linking it to at least one requirement.
- [ ] Write an integration test that runs the `scripts/audit-req-coverage.ts` script and asserts:
  - Exit code is `0`.
  - The JSON output file `dist/req-coverage.json` contains an entry for `TAS-005`, `TAS-006`, and `TAS-063` with at least one mapped location each.

## 2. Task Implementation
- [ ] Define the canonical tagging format in `src/constants/reqTagging.ts`:
  ```typescript
  // [REQ: TAS-063]
  export const REQ_TAG_PATTERN = /\/\/\s*\[REQ:\s*([\w_-]+)\]/g;
  export const JSDOC_REQ_PATTERN = /@req\s+([\w_-]+)/g;
  ```
- [ ] Create `src/utils/reqAudit.ts` with the following exported functions (each tagged `// [REQ: TAS-063]`):
  - `extractReqIds(fileContent: string): string[]` — extracts all REQ-IDs from a source file.
  - `buildCoverageMap(sourceFiles: string[]): Map<string, string[]>` — maps each REQ-ID to the list of `file:line` locations.
  - `validateCoverageMap(map: Map<string, string[]>, knownReqIds: string[]): ValidationResult` — returns missing and orphaned IDs.
- [ ] Create `scripts/audit-req-coverage.ts` (Node script, no test framework):
  - Globs all `src/**/*.ts` files.
  - Calls `buildCoverageMap`.
  - Reads `requirements.md` and extracts all `[REQ-ID]` entries via regex.
  - Calls `validateCoverageMap` and writes `dist/req-coverage.json`.
  - Prints a summary table to stdout.
  - Exits `1` if any production source function is untagged or any tag references an unknown REQ-ID.
- [ ] Add `"audit:reqs": "ts-node scripts/audit-req-coverage.ts"` to root `package.json` scripts.
- [ ] Retroactively tag all existing exported functions and public methods in `src/` with the appropriate `// [REQ: <ID>]` inline comment or `@req <ID>` JSDoc tag, using the coverage map to identify untagged symbols.
- [ ] Add the tagging convention to the project's ESLint config via a custom rule or `eslint-plugin-jsdoc`:
  - Rule: warn if an exported function/class has no `@req` JSDoc tag.

## 3. Code Review
- [ ] Confirm `REQ_TAG_PATTERN` and `JSDOC_REQ_PATTERN` cover both inline comment format and JSDoc format.
- [ ] Verify `validateCoverageMap` correctly surfaces:
  - **Missing**: REQ-IDs from `requirements.md` that have zero coverage locations.
  - **Orphaned**: tags in source that do not correspond to any known REQ-ID.
- [ ] Confirm the ESLint rule is set to `"warn"` (not `"error"`) during the initial rollout phase so it doesn't block existing code, then tightened to `"error"` once full coverage is achieved.
- [ ] Ensure `dist/req-coverage.json` is added to `.gitignore` (it is a build artifact, not source).

## 4. Run Automated Tests to Verify
- [ ] Run the req-tagging unit tests:
  ```bash
  pnpm test -- --testPathPattern="req-tagging.test"
  ```
- [ ] Run the audit script end-to-end:
  ```bash
  pnpm audit:reqs
  ```
- [ ] Confirm both commands exit `0` and `dist/req-coverage.json` contains correct coverage entries for `TAS-005`, `TAS-006`, `TAS-063`.

## 5. Update Documentation
- [ ] Create `src/utils/reqAudit.agent.md` documenting:
  - The two supported tagging formats (`// [REQ: ID]` and `@req ID`).
  - How to run the audit script.
  - The structure of the `req-coverage.json` output.
- [ ] Add a "Requirement Tagging" section to the root `CONTRIBUTING.md` (or create it) that explains:
  - Every exported function and test case **must** carry at least one `@req` tag.
  - How to look up valid REQ-IDs from `requirements.md`.
  - The CI check that enforces this convention.
- [ ] Update `docs/devs-config-schema.md` to reference that the tagging convention applies to all devs-generated code as well (i.e., agent-generated code follows the same rule).

## 6. Automated Verification
- [ ] Add a CI step that runs the audit and asserts full coverage:
  ```yaml
  - name: Requirement Coverage Audit
    run: pnpm audit:reqs
  ```
- [ ] Add `scripts/validate-req-tags.sh` that:
  - Runs `pnpm audit:reqs`.
  - Checks `dist/req-coverage.json` for the presence of `TAS-005`, `TAS-006`, and `TAS-063`.
  - Exits non-zero if any of these are missing from the coverage map.
  - Is invoked as part of `validate-all`.
