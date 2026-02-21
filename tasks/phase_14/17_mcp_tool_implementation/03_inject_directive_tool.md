# Task: Implement `inject_directive` MCP Tool (Sub-Epic: 17_MCP Tool Implementation)

## Covered Requirements
- [2_TAS-REQ-007]

## 1. Initial Test Written
- [ ] Create `src/mcp/tools/__tests__/inject-directive.test.ts` with the following test cases:
  - `injectDirective({ taskId, directive, authorisedBy })` inserts a row into the `directives` SQLite table with columns `(id, task_id, directive TEXT, authorised_by TEXT, created_at INTEGER, applied INTEGER DEFAULT 0)`.
  - When `taskId` does not exist in `tasks`, the function throws `DirectiveError` with code `TASK_NOT_FOUND`.
  - When `directive` is an empty string, the function throws `DirectiveError` with code `INVALID_DIRECTIVE`.
  - When `authorisedBy` is not a recognised agent identity (not in the `agent_identities` table), the function throws `DirectiveError` with code `UNAUTHORISED`.
  - After a successful injection, querying `SELECT * FROM directives WHERE task_id = ?` returns exactly one row with `applied = 0`.
  - Test that the active task agent loop picks up unapplied directives on its next iteration (integration test with a mock agent loop tick).
  - Test MCP tool registration: calling the tool via the MCP protocol with a valid payload returns `{ success: true, directiveId: string }`.

## 2. Task Implementation
- [ ] Create `src/mcp/tools/inject-directive.ts`:
  - Export interface `InjectDirectiveInput { taskId: string; directive: string; authorisedBy: string; }`.
  - Export class `DirectiveError extends Error` with a `code` field (`TASK_NOT_FOUND | INVALID_DIRECTIVE | UNAUTHORISED`).
  - Export async function `injectDirective(input: InjectDirectiveInput, db: Database): Promise<{ directiveId: string }>`.
  - Validate `input.directive` is non-empty; throw `DirectiveError('INVALID_DIRECTIVE')` otherwise.
  - Query `SELECT id FROM tasks WHERE id = ?` — throw `DirectiveError('TASK_NOT_FOUND')` if no row.
  - Query `SELECT id FROM agent_identities WHERE id = ?` for `authorisedBy` — throw `DirectiveError('UNAUTHORISED')` if no row.
  - Insert into `directives (id, task_id, directive, authorised_by, created_at, applied)` using `crypto.randomUUID()` for `id`.
  - Return `{ directiveId }`.
- [ ] Modify the agent task-loop tick in `src/orchestrator/task-loop.ts`:
  - At the start of each tick, query `SELECT * FROM directives WHERE task_id = ? AND applied = 0 ORDER BY created_at ASC`.
  - For each unapplied directive, prepend it to the agent's system prompt context and mark `applied = 1`.
- [ ] Register the tool in `src/mcp/server.ts`:
  - Tool name: `inject_directive`
  - Input schema: `{ taskId: string, directive: string, authorisedBy: string }`
  - Output schema: `{ success: boolean, directiveId: string }`
  - Handler: call `injectDirective(input, db)` and return the result.

## 3. Code Review
- [ ] Confirm `authorisedBy` is validated against the DB — never trust the caller's assertion without a DB lookup.
- [ ] Verify the `directives` table insert uses a parameterised statement.
- [ ] Ensure the `applied` flag update in the task loop is atomic (use a SQLite transaction wrapping the SELECT + UPDATE).
- [ ] Confirm `DirectiveError` is caught by the MCP server's error middleware and converted to an MCP-protocol error response (never leaks stack traces).
- [ ] Verify the `directive` text is sanitised to strip any prompt-injection delimiters (e.g., `<|system|>`, `###`) before storage.

## 4. Run Automated Tests to Verify
- [ ] Run `npm test -- --testPathPattern=src/mcp/tools/inject-directive` and confirm all tests pass.
- [ ] Run `npm run build` to confirm TypeScript compiles without errors in strict mode.

## 5. Update Documentation
- [ ] Add `inject_directive` section to `docs/mcp-tools.md` with:
  - Description: "Injects a human-in-the-loop constraint into the active task's agent context."
  - Authorization model explanation (agent identity check).
  - Input/output JSON schema.
  - Example: injecting "Do not use external HTTP libraries" mid-task.
- [ ] Create `src/mcp/tools/inject-directive.agent.md` documenting purpose, authorization flow, and directive lifecycle (injected → picked up → applied).
- [ ] Add `// [2_TAS-REQ-007]` traceability comment at the top of `inject-directive.ts`.

## 6. Automated Verification
- [ ] Run `npm test -- --testPathPattern=src/mcp/tools/inject-directive --coverage` and assert line coverage ≥ 90%.
- [ ] Run `grep "inject_directive" src/mcp/server.ts` and confirm the tool is registered.
- [ ] Run `grep "2_TAS-REQ-007" src/mcp/tools/inject-directive.ts` and confirm the traceability comment exists.
- [ ] Run `grep "authorised_by\|UNAUTHORISED" src/mcp/tools/inject-directive.ts` and confirm the authorisation check is present.
