# Task: Implement `execute_query` MCP Tool for Agent Data Persistence Verification (Sub-Epic: 18_MCP Scripts and Profiling Tools)

## Covered Requirements
- [2_TAS-REQ-011]

## 1. Initial Test Written

- [ ] Create `src/mcp/tools/__tests__/execute_query.test.ts`.
- [ ] Write a unit test that mocks the project's database adapter (e.g., `better-sqlite3` or a LanceDB client) and verifies that calling `executeQuery({ sql: 'SELECT 1 AS val', db: 'sqlite' })` returns `{ rows: [{ val: 1 }], rowCount: 1 }`.
- [ ] Write a unit test verifying that an invalid SQL statement (e.g., `SELECT * FROM nonexistent_table`) returns a structured error result `{ error: 'QUERY_FAILED', message: '<db error message>' }` without throwing.
- [ ] Write a unit test verifying that calling `executeQuery` with `db: 'lancedb'` and a valid table name and filter expression returns an array of matching records from the mocked LanceDB table.
- [ ] Write a unit test that verifies `executeQuery` rejects write operations (INSERT, UPDATE, DELETE, DROP) when called in `readonly: true` mode (which should be the default), returning `{ error: 'WRITE_FORBIDDEN', message: '...' }`.
- [ ] Write an integration test that registers the tool on a test MCP server instance and sends a `CallTool` request with `{ sql: 'SELECT count(*) as c FROM tasks', db: 'sqlite' }` against a temporary test SQLite database, asserting the MCP `CallToolResult` contains valid JSON in its `text` content field.
- [ ] All tests must fail before implementation (red phase confirmed).

## 2. Task Implementation

- [ ] Create `src/mcp/tools/execute_query.ts` exporting `executeQuery(params: ExecuteQueryParams): Promise<ExecuteQueryResult>`.
- [ ] Define interfaces:
  ```ts
  // [2_TAS-REQ-011]
  export interface ExecuteQueryParams {
    sql?: string;           // For SQLite queries
    table?: string;         // For LanceDB table name
    filter?: string;        // For LanceDB filter expression
    db: 'sqlite' | 'lancedb';
    readonly?: boolean;     // Defaults to true
  }

  export type ExecuteQueryResult =
    | { rows: Record<string, unknown>[]; rowCount: number }
    | { error: string; message: string };
  ```
- [ ] For `db: 'sqlite'`: Open the devs state database (path from `DevSConfig.stateDbPath`) using `better-sqlite3` in readonly mode when `readonly === true`. Parse the SQL statement to detect write keywords (`INSERT`, `UPDATE`, `DELETE`, `DROP`, `ALTER`, `CREATE`) using a simple regex guard and return `WRITE_FORBIDDEN` if matched in readonly mode. Execute the query and return all rows and row count.
- [ ] For `db: 'lancedb'`: Use the project's LanceDB connection to open the specified `table`, apply the `filter` expression via `.filter(filter).toArray()`, and return the results.
- [ ] Register this tool on the MCP server under name `execute_query` with a JSON Schema validator matching `ExecuteQueryParams`.
- [ ] Add `// [2_TAS-REQ-011]` requirement tracing comment at the top of the file.

## 3. Code Review

- [ ] Confirm `readonly: true` is enforced by default and that the write-guard regex covers all DDL/DML keywords.
- [ ] Confirm the SQLite connection is opened and closed within the same call (no leaked handles); use `try/finally` to ensure `.close()` is called.
- [ ] Confirm no user-provided strings are interpolated unsafely into LanceDB filter expressions without sanitization.
- [ ] Verify the MCP handler wraps errors as `{ isError: true, content: [...] }` and never lets exceptions propagate to the MCP transport layer.
- [ ] Confirm TypeScript strict mode is satisfied: no implicit `any`, all union branches are narrowed explicitly.

## 4. Run Automated Tests to Verify

- [ ] Run `npm test -- --testPathPattern="execute_query"` and confirm all unit and integration tests pass.
- [ ] Run the full test suite `npm test` to confirm no regressions.
- [ ] Run `npx tsc --noEmit` and confirm zero type errors.

## 5. Update Documentation

- [ ] Create `src/mcp/tools/execute_query.agent.md` documenting: tool name, parameters, return schema, error codes (`QUERY_FAILED`, `WRITE_FORBIDDEN`), supported databases, and TDD usage patterns for agents verifying data persistence.
- [ ] Update the MCP server's master tool registry documentation to add an entry for `execute_query`.
- [ ] Add a note in the devs TDD guide (`docs/tdd-guide.md` or equivalent) showing how agents use `execute_query` to verify database state after a task implementation step.

## 6. Automated Verification

- [ ] Run `npm test -- --testPathPattern="execute_query" --coverage` and verify ≥ 90% line coverage for `src/mcp/tools/execute_query.ts`.
- [ ] Run `npx tsc --noEmit` and verify exit code is `0`.
- [ ] Confirm the tool appears in the MCP server's registered tool list by running `npm run dev:mcp -- --list-tools 2>&1 | grep execute_query` (or equivalent) and seeing it listed.
