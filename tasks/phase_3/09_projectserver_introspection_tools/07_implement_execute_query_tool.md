# Task: Implement execute_query Tool (Sub-Epic: 09_ProjectServer Introspection Tools)

## Covered Requirements
- [2_TAS-REQ-011]

## 1. Initial Test Written
- [ ] Create `packages/mcp-server/src/projectserver/__tests__/execute-query.test.ts`.
- [ ] Use an in-memory SQLite database (via `better-sqlite3` or `@databases/sqlite` with `:memory:` connection string) as the test fixture.
- [ ] Write unit tests for `executeQuery(params: { sql: string; database_path: string; params?: unknown[] })`:
  - A `SELECT` query on a seeded table returns `QueryResult { ok: true, rows: [...], rowCount: number }`.
  - A `SELECT` with no matching rows returns `QueryResult { ok: true, rows: [], rowCount: 0 }`.
  - A write query (`INSERT`, `UPDATE`, `DELETE`) returns `QueryResult { ok: true, rows: [], rowCount: number }` where `rowCount` reflects the affected rows.
  - An invalid SQL string (syntax error) returns `QueryResult { ok: false, error: "SQL syntax error: ..." }`.
  - A `DROP TABLE` or any DDL statement that is not `SELECT`/`INSERT`/`UPDATE`/`DELETE` returns `QueryResult { ok: false, error: "Unsupported statement type. Only SELECT, INSERT, UPDATE, DELETE are permitted." }`.
  - `database_path` outside `projectRoot` (path traversal) returns `QueryResult { ok: false, error: "Path traversal detected" }`.
  - Parameterised query with `params: [1, "foo"]` is executed correctly (prevents SQL injection).
  - `database_path` pointing to a non-existent file returns `QueryResult { ok: false, error: "Database not found: ..." }`.
- [ ] All tests must fail (RED) before implementation.

## 2. Task Implementation
- [ ] Define `QueryResult` interface in `packages/mcp-server/src/projectserver/types/query.ts`:
  ```ts
  interface QueryResult {
    ok: boolean;
    rows?: Record<string, unknown>[];
    rowCount?: number;
    error?: string;
  }
  ```
  Add its `zod` schema to `packages/mcp-server/src/projectserver/types/schemas.ts` and export from `types/index.ts`.
- [ ] Create `packages/mcp-server/src/projectserver/tools/executeQuery.ts`:
  - Export `executeQuery(params: { sql: string; database_path: string; params?: unknown[] }, deps: { projectRoot: string; dbFactory?: DbFactory }): Promise<QueryResult>`.
  - Validate `database_path` with `_pathGuard` from task 03.
  - Parse the SQL string to determine statement type using a simple regex on the trimmed, uppercased first token (`/^(SELECT|INSERT|UPDATE|DELETE)\b/`). Reject all other first tokens.
  - Open the SQLite database via `dbFactory` (defaulting to `better-sqlite3` with `{ readonly: false, fileMustExist: true }`).
  - Execute the query with bound `params` to prevent SQL injection.
  - For `SELECT`: return `{ ok: true, rows: stmt.all(...params), rowCount: rows.length }`.
  - For `INSERT`/`UPDATE`/`DELETE`: return `{ ok: true, rows: [], rowCount: info.changes }`.
  - Wrap all operations in try/catch; return `{ ok: false, error: err.message }` on failure.
  - Always close the database connection in a `finally` block.
- [ ] Define `DbFactory` interface in `packages/mcp-server/src/projectserver/tools/DbFactory.ts` to allow test mocking.
- [ ] Register `execute_query` as an MCP tool with input schema:
  ```ts
  z.object({
    sql: z.string().max(10_000),
    database_path: z.string(),
    params: z.array(z.union([z.string(), z.number(), z.boolean(), z.null()])).optional()
  })
  ```

## 3. Code Review
- [ ] Verify the statement-type check uses the **parsed first token** of the SQL string, not a `LIKE` substring match (to prevent bypass via comment injection).
- [ ] Verify `better-sqlite3` synchronous API is used correctly — it is inherently blocking; confirm that usage is acceptable in the MCP tool handler context (document rationale in `index.agent.md`).
- [ ] Verify database connection is never leaked: the `finally` block must call `db.close()` even if the query throws.
- [ ] Verify `params` array elements are typed as SQLite-compatible primitives only (string, number, boolean, null) — no objects or buffers accepted.
- [ ] Verify the tool does not expose the full SQLite error stack to the caller (sanitize internal file paths from error messages before returning).

## 4. Run Automated Tests to Verify
- [ ] Run `pnpm --filter @devs/mcp-server test -- --testPathPattern="execute-query"` and confirm all tests pass (GREEN).
- [ ] Run `pnpm --filter @devs/mcp-server tsc --noEmit`.

## 5. Update Documentation
- [ ] Append to `packages/mcp-server/src/projectserver/tools/index.agent.md`:
  - Document `execute_query` permitted statement types and parameterised query usage.
  - Explain the TDD use case: how agents use `execute_query` to verify data persistence after an `INSERT` during a test cycle.
  - List requirement IDs: `2_TAS-REQ-011`.
- [ ] Create `packages/mcp-server/src/projectserver/tools/DbFactory.agent.md` documenting the factory interface contract and default implementation.

## 6. Automated Verification
- [ ] Run `pnpm --filter @devs/mcp-server test -- --ci --testPathPattern="execute-query"` and assert exit code `0`.
- [ ] Run `grep -n "finally\|db.close\|Unsupported statement" packages/mcp-server/src/projectserver/tools/executeQuery.ts` and confirm all three patterns are present.
