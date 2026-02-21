# Task: MCP Reviewer Agent Verification Process (Sub-Epic: 17_MCP Tool Implementation)

## Covered Requirements
- [2_TAS-REQ-005]

## 1. Initial Test Written
- [ ] Create `src/mcp/verification/__tests__/reviewer-agent.test.ts` with the following test cases:
  - `ReviewerAgent.validate(commitSha, taskId)` returns a `ValidationResult` with fields `{ passed: boolean, violations: RequirementViolation[], requirementsCovered: string[] }`.
  - When all requirements for `taskId` are satisfied by the diff at `commitSha`, `passed` is `true` and `violations` is empty.
  - When a requirement is not satisfied, `passed` is `false` and `violations` contains an entry with `{ requirementId, reason }`.
  - `ReviewerAgent` reads the active task's requirement IDs from the SQLite `tasks` table (column `requirement_ids TEXT`).
  - `ReviewerAgent` fetches the git diff for `commitSha` via `git show --stat --unified=5 <sha>`.
  - Unit-test the mapping logic: given a mock diff and a requirement list, verify that uncovered requirements produce violations.
  - Integration test: seed the SQLite DB with a task row, write a stub `git show` response, and call `ReviewerAgent.validate()` expecting a `ValidationResult`.

## 2. Task Implementation
- [ ] Create `src/mcp/verification/types.ts` exporting:
  ```typescript
  export interface RequirementViolation { requirementId: string; reason: string; }
  export interface ValidationResult { passed: boolean; violations: RequirementViolation[]; requirementsCovered: string[]; }
  ```
- [ ] Create `src/mcp/verification/reviewer-agent.ts`:
  - Export class `ReviewerAgent` with method `async validate(commitSha: string, taskId: string): Promise<ValidationResult>`.
  - Query the SQLite state DB (`devs.db`) for `SELECT requirement_ids FROM tasks WHERE id = ?`.
  - Parse `requirement_ids` (JSON array of strings).
  - Run `git show --stat --unified=5 <commitSha>` via `child_process.execFileSync` with a timeout of 30 s.
  - For each requirement ID, check whether the diff output contains a reference to that ID (e.g., a comment `// [REQ-ID]` or a change in a file whose path includes the ID).  
  - Build and return the `ValidationResult`.
- [ ] Register `ReviewerAgent` in the MCP server's tool registry under the name `verify_commit` so it can be invoked by AI agents during the TDD loop.
- [ ] Add `verify_commit` to `src/mcp/server.ts` tool list with input schema `{ commitSha: string, taskId: string }`.

## 3. Code Review
- [ ] Confirm `ReviewerAgent` does **not** shell out to any command other than `git show` — no `eval`, `exec` with unsanitised input.
- [ ] Verify that `commitSha` is validated against `/^[0-9a-f]{7,40}$/` before being passed to `execFileSync` to prevent command injection.
- [ ] Ensure the SQLite query uses parameterised statements (never string interpolation).
- [ ] Confirm all async paths surface errors via typed `Result<T, E>` or thrown typed errors caught by the MCP layer.
- [ ] Check that `ValidationResult` is serialisable to JSON (no circular refs, no `undefined` fields).

## 4. Run Automated Tests to Verify
- [ ] Run `npm test -- --testPathPattern=src/mcp/verification` and confirm all tests pass with zero failures.
- [ ] Run `npm run build` and confirm TypeScript compilation succeeds in strict mode.

## 5. Update Documentation
- [ ] Add an entry for `verify_commit` in `docs/mcp-tools.md` describing its input schema, output schema, and example invocation.
- [ ] Update `src/mcp/verification/reviewer-agent.agent.md` (AOD file) with: purpose, key decisions (git diff parsing strategy, requirement-ID detection heuristic), and known limitations.
- [ ] Add `// [2_TAS-REQ-005]` comment at the top of `reviewer-agent.ts` to satisfy requirement-to-commit traceability.

## 6. Automated Verification
- [ ] Run `npm test -- --testPathPattern=src/mcp/verification --coverage` and assert line coverage ≥ 90% for `reviewer-agent.ts`.
- [ ] Run `grep -r "2_TAS-REQ-005" src/mcp/verification/reviewer-agent.ts` and confirm the requirement ID appears in the source file.
- [ ] Run `node -e "require('./dist/mcp/verification/reviewer-agent')"` to confirm the compiled module loads without errors.
