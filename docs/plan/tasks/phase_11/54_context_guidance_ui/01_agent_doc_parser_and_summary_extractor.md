# Task: Implement .agent.md parser and summary extractor (Sub-Epic: 54_Context_Guidance_UI)

## Covered Requirements
- [7_UI_UX_DESIGN-REQ-UI-DES-130], [7_UI_UX_DESIGN-REQ-UI-DES-130-1]

## 1. Initial Test Written
- [ ] Create a failing unit test suite at `packages/vscode/webview/src/lib/__tests__/agentDocParser.test.ts` that imports `parseAgentDoc` from `packages/vscode/webview/src/lib/agentDocParser.ts` and asserts the exact parsing contract:
  - Fixture A: full `.agent.md` containing headings `Intent`, `Hooks`, and `Test Strategy` (with bullets and code blocks). Assert returned object: `{ intent: string, hooks: string[], testStrategy: string }` with extracted, trimmed text.
  - Fixture B: missing `Hooks` section -> expect `hooks: []` and other fields present and empty-string safe.
  - Fixture C: malformed headings or repeated headings -> parser chooses the first instance and trims whitespace.
  - Edge cases: inline code and fenced codeblocks inside sections must be preserved as markdown in the returned strings; tests should assert these cases.

## 2. Task Implementation
- [ ] Implement `parseAgentDoc(content: string): { intent: string; hooks: string[]; testStrategy: string }` in `packages/vscode/webview/src/lib/agentDocParser.ts`.
  - Use a small, robust markdown-heading scanner (regex-based) to find headings `Intent`, `Hooks`, `Test Strategy` (case-insensitive) and capture text until the next heading.
  - Normalize whitespace, split `Hooks` into an array by list items or newlines, preserve inline/fenced code blocks in the returned text for `intent` and `testStrategy`.
  - Export an async helper `parseAgentDocFromFile(filePath: string): Promise<Summary>` that reads the file and returns the parsed summary.
  - Add TypeScript types and JSDoc comments; avoid heavy parser dependencies to keep the webview bundle small.

## 3. Code Review
- [ ] Ensure tests cover normal and edge cases, regexes are documented and bounded (no catastrophic backtracking), types are strict, and the module has comprehensive unit coverage (>90% for this module). Confirm no file-system side effects in `parseAgentDoc` pure function and that file IO is isolated to `parseAgentDocFromFile`.

## 4. Run Automated Tests to Verify
- [ ] Run: `npx vitest packages/vscode/webview/src/lib/__tests__/agentDocParser.test.ts` (or repo-equivalent) and ensure the initial failing tests are created, then run again after implementation until they pass.

## 5. Update Documentation
- [ ] Add a short section to `packages/vscode/webview/README.md` documenting `parseAgentDoc` and `parseAgentDocFromFile`, including example input, example output JSON and notes about preserved markdown formatting for code blocks.

## 6. Automated Verification
- [ ] Add `scripts/verify-agent-doc-parser.js` that loads fixtures from `tasks/phase_11/54_context_guidance_ui/fixtures/`, runs the parser, writes `tmp/agent-doc-parser.json` with results and exit-code 0 on success; CI should run `node scripts/verify-agent-doc-parser.js` and fail on non-zero exit code.
