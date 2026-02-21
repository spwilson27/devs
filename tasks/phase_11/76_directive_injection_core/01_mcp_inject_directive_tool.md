# Task: Implement `inject_directive` MCP Tool (Sub-Epic: 76_Directive_Injection_Core)

## Covered Requirements
- [9_ROADMAP-TAS-705]

## 1. Initial Test Written
- [ ] In `packages/mcp-server/src/tools/__tests__/inject_directive.test.ts`, write unit tests for the `inject_directive` MCP tool handler:
  - **Test 1 – Happy path**: Call `inject_directive` with `{ directive: "Use fetch instead of axios", immediate_pivot: false }` and assert it returns `{ status: "queued", directive_id: <uuid> }`.
  - **Test 2 – Immediate pivot**: Call with `{ directive: "Stop and refactor auth module", immediate_pivot: true }` and assert the response contains `{ status: "queued", immediate_pivot: true }` and that an `INTERRUPT` signal was written to the orchestrator event bus mock.
  - **Test 3 – Context references**: Call with `{ directive: "See @src/auth.ts", context_refs: [{ type: "file", path: "src/auth.ts" }], immediate_pivot: false }` and assert `context_refs` is preserved in the stored directive record.
  - **Test 4 – Missing directive**: Call with an empty `directive` string and assert the tool returns a structured MCP error with code `INVALID_PARAMS`.
  - **Test 5 – Directive persistence**: After a successful call, query the SQLite `directives` table (via the injected `db` mock) and assert a row was inserted with the correct `directive`, `immediate_pivot`, `context_refs`, `status="pending"`, and a valid ISO `created_at` timestamp.

## 2. Task Implementation
- [ ] **Schema**: In `packages/mcp-server/src/tools/inject_directive.ts`, define the Zod input schema:
  ```ts
  const InjectDirectiveInput = z.object({
    directive: z.string().min(1),
    immediate_pivot: z.boolean().default(false),
    context_refs: z.array(
      z.object({
        type: z.enum(["file", "requirement"]),
        ref: z.string(),
      })
    ).optional().default([]),
  });
  ```
- [ ] **Tool handler**: Export `injectDirectiveTool` conforming to the `McpTool` interface from `@devs/mcp-core`. The handler must:
  1. Validate input with the Zod schema; return a structured MCP error on failure.
  2. Generate a `directive_id` via `crypto.randomUUID()`.
  3. Insert a row into the `directives` SQLite table (columns: `id`, `directive`, `immediate_pivot`, `context_refs` as JSON text, `status`, `created_at`).
  4. If `immediate_pivot` is `true`, emit an `ORCHESTRATOR_INTERRUPT` event on the shared `EventBus` singleton so the running agent turn can observe it.
  5. Return `{ directive_id, status: "queued", immediate_pivot }`.
- [ ] **DB migration**: Add `packages/mcp-server/src/migrations/0010_directives_table.sql` creating the `directives` table with the columns above.
- [ ] **Registration**: Register the tool in `packages/mcp-server/src/toolRegistry.ts` under the name `"inject_directive"`.

## 3. Code Review
- [ ] Verify the tool does **not** perform any file I/O or agent orchestration directly; side effects (interrupt, DB insert) must go through injected dependencies to keep the handler unit-testable.
- [ ] Confirm the `directives` table migration is idempotent (`CREATE TABLE IF NOT EXISTS`).
- [ ] Confirm Zod validation errors are translated to MCP `INVALID_PARAMS` error codes (not raw exceptions).
- [ ] Confirm `context_refs` is stored as a JSON string and correctly round-trips through the database layer.
- [ ] Confirm no secrets or user-supplied content are logged at `INFO` level or above.

## 4. Run Automated Tests to Verify
- [ ] Run `pnpm --filter @devs/mcp-server test -- --testPathPattern=inject_directive` and confirm all 5 tests pass with zero failures.
- [ ] Run `pnpm --filter @devs/mcp-server build` and confirm the TypeScript compilation produces zero errors.

## 5. Update Documentation
- [ ] Append an entry for `inject_directive` to `docs/mcp-tools.md` following the existing tool-documentation format, including input schema, output schema, error codes, and a usage example.
- [ ] Update the agent memory file `docs/agent-memory/phase_11.md` to note that `inject_directive` is now registered and the `directives` table exists in the MCP server's SQLite database.

## 6. Automated Verification
- [ ] Run `pnpm --filter @devs/mcp-server test:ci` (which runs tests and type-check in sequence) and assert the process exits with code `0`.
- [ ] Execute the SQL migration against a temporary SQLite file and assert the `directives` table exists with the expected schema: `sqlite3 /tmp/test.db < packages/mcp-server/src/migrations/0010_directives_table.sql && sqlite3 /tmp/test.db ".schema directives"`.
