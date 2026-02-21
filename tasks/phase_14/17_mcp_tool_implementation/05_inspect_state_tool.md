# Task: Implement `inspect_state` MCP Tool (Sub-Epic: 17_MCP Tool Implementation)

## Covered Requirements
- [2_TAS-REQ-009]

## 1. Initial Test Written
- [ ] Create `src/mcp/tools/__tests__/inspect-state.test.ts` with the following test cases:
  - `inspectState({ query })` accepts a read-only SQL query string and returns `{ rows: Record<string, unknown>[] }`.
  - When `query` is `SELECT * FROM tasks WHERE status = 'in_progress'`, the function returns the matching rows from the seeded test DB.
  - When `query` is a mutating statement (`INSERT`, `UPDATE`, `DELETE`, `DROP`, `CREATE`), the function throws `InspectStateError` with code `MUTATING_QUERY_FORBIDDEN`.
  - When `query` is an empty string, the function throws `InspectStateError` with code `INVALID_QUERY`.
  - When `query` references a table that does not exist, the function throws `InspectStateError` with code `QUERY_EXECUTION_FAILED` and includes the SQLite error message.
  - Test that the result set is capped at 500 rows (add `LIMIT 500` silently if not present) — assert that a query over 600 rows only returns 500.
  - Test that `inspectState` opens the DB in read-only mode (`OPEN_READONLY`) — write an integration test that attempts to open the DB file and verifies no write-ahead-log entries are created.
  - Test the MCP tool registration: calling via MCP protocol with a valid `query` returns the correct JSON.

## 2. Task Implementation
- [ ] Create `src/mcp/tools/inspect-state.ts`:
  - Export interface `InspectStateInput { query: string; }`.
  - Export interface `InspectStateResult { rows: Record<string, unknown>[]; rowCount: number; truncated: boolean; }`.
  - Export class `InspectStateError extends Error` with `code: 'MUTATING_QUERY_FORBIDDEN' | 'INVALID_QUERY' | 'QUERY_EXECUTION_FAILED'`.
  - Export async function `inspectState(input: InspectStateInput, dbPath: string): Promise<InspectStateResult>`.
  - Validate `input.query` is non-empty.
  - Parse the SQL statement using a lightweight parser (e.g., regex on first non-whitespace keyword after stripping comments) to detect mutating keywords (`INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|REPLACE|TRUNCATE`) — throw `InspectStateError('MUTATING_QUERY_FORBIDDEN')` if detected.
  - Open the SQLite DB file in `OPEN_READONLY` mode using `better-sqlite3`.
  - Silently inject `LIMIT 500` if the query does not already contain a `LIMIT` clause (use regex: `/\bLIMIT\b/i`).
  - Execute the prepared statement and collect rows.
  - Set `truncated = true` if `rows.length === 500`.
  - Close the DB connection in a `finally` block.
  - Return `{ rows, rowCount: rows.length, truncated }`.
- [ ] Register the tool in `src/mcp/server.ts`:
  - Tool name: `inspect_state`
  - Input schema: `{ query: string }`
  - Output schema: `{ rows: array, rowCount: number, truncated: boolean }`
  - Handler: call `inspectState(input, dbPath)` and return the result.

## 3. Code Review
- [ ] Confirm the DB is opened with `better-sqlite3`'s `{ readonly: true }` flag — never `OPEN_READWRITE`.
- [ ] Verify the mutating-keyword check runs **before** the DB is opened — fail fast.
- [ ] Confirm the `LIMIT 500` injection is applied on a normalised (lowercased) copy of the query for detection but the original case is preserved for execution.
- [ ] Ensure `rows` are serialised to plain JSON-safe types: `Date` objects converted to ISO strings, `BigInt` to `string`, `Buffer`/`Blob` to base64 string.
- [ ] Check that `InspectStateError` subtypes map to distinct MCP error codes and that stack traces are never forwarded to the caller.
- [ ] Verify there are no persistent handles — the `better-sqlite3` instance must be closed in all code paths (success, parse error, execution error).

## 4. Run Automated Tests to Verify
- [ ] Run `npm test -- --testPathPattern=src/mcp/tools/inspect-state` and confirm all tests pass.
- [ ] Run `npm run build` to confirm TypeScript compiles without errors in strict mode.

## 5. Update Documentation
- [ ] Add `inspect_state` section to `docs/mcp-tools.md` with:
  - Description: "Executes a read-only SQL query against the devs runtime state database and returns matching rows."
  - Security note: mutating queries are rejected; DB opened read-only.
  - Row cap: results are limited to 500 rows.
  - Input/output schema.
  - Example: `{ "query": "SELECT id, status FROM tasks WHERE status = 'pending'" }`
- [ ] Create `src/mcp/tools/inspect-state.agent.md` documenting: purpose, read-only enforcement strategy, row cap rationale, JSON serialisation rules for non-standard types.
- [ ] Add `// [2_TAS-REQ-009]` traceability comment at the top of `inspect-state.ts`.

## 6. Automated Verification
- [ ] Run `npm test -- --testPathPattern=src/mcp/tools/inspect-state --coverage` and assert line coverage ≥ 90%.
- [ ] Run `grep "inspect_state" src/mcp/server.ts` and confirm the tool is registered.
- [ ] Run `grep "2_TAS-REQ-009" src/mcp/tools/inspect-state.ts` and confirm the traceability comment exists.
- [ ] Run `grep "readonly.*true\|OPEN_READONLY" src/mcp/tools/inspect-state.ts` and confirm the read-only DB open flag is present.
