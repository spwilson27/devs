# Task: Implement read_logs Tool (Sub-Epic: 09_ProjectServer Introspection Tools)

## Covered Requirements
- [4_USER_FEATURES-REQ-042]

## 1. Initial Test Written
- [ ] Create `packages/mcp-server/src/projectserver/__tests__/read-logs.test.ts`.
- [ ] Use an in-memory SQLite database seeded with `agent_logs` rows as the test fixture.
- [ ] Write unit tests for `readLogs(params: { task_id?: string; turn_index?: number; limit?: number; since?: string; format?: "json" | "text" })`:
  - No filters — returns the most recent `limit` (default 100) log entries ordered by `created_at DESC`.
  - `task_id` filter — returns only entries for that task.
  - `turn_index` filter — returns only entries at that turn index.
  - `since` as an ISO 8601 string — returns only entries created after that timestamp.
  - `format: "text"` — returns entries as a newline-delimited plain-text string with each line formatted as `[{timestamp}] [{level}] {message}`.
  - `format: "json"` (default) — returns entries as a JSON array of raw log objects.
  - `limit` of 0 — returns `LogsResult { ok: false, error: "limit must be a positive integer" }`.
  - `limit` exceeding 1000 — is silently clamped to 1000.
  - Empty result set — returns `LogsResult { ok: true, logs: [], totalCount: 0 }`.
  - Database not reachable — returns `LogsResult { ok: false, error: "Failed to open log database: ..." }`.
- [ ] All tests must fail (RED) before implementation.

## 2. Task Implementation
- [ ] Define `LogEntry` and `LogsResult` interfaces in `packages/mcp-server/src/projectserver/types/logs.ts`:
  ```ts
  interface LogEntry {
    id: string;
    task_id: string;
    turn_index: number;
    level: "debug" | "info" | "warn" | "error";
    message: string;
    metadata?: Record<string, unknown>;
    created_at: string; // ISO 8601
  }
  interface LogsResult {
    ok: boolean;
    logs?: LogEntry[] | string;
    totalCount?: number;
    error?: string;
  }
  ```
  Add zod schemas to `packages/mcp-server/src/projectserver/types/schemas.ts` and export from `types/index.ts`.
- [ ] Create `packages/mcp-server/src/projectserver/tools/readLogs.ts`:
  - Export `readLogs(params: { task_id?: string; turn_index?: number; limit?: number; since?: string; format?: "json" | "text" }, deps: { db: DatabaseAdapter }): Promise<LogsResult>`.
  - Validate `limit`: reject `<= 0`, clamp to `1000`.
  - Build a parameterised SQL query against the `agent_logs` table:
    ```sql
    SELECT id, task_id, turn_index, level, message, metadata, created_at
    FROM agent_logs
    WHERE (? IS NULL OR task_id = ?)
      AND (? IS NULL OR turn_index = ?)
      AND (? IS NULL OR created_at > ?)
    ORDER BY created_at DESC
    LIMIT ?
    ```
  - Execute via `deps.db` (the `DatabaseAdapter` interface from task 04).
  - If `format: "text"`, map rows to `[{created_at}] [{level}] {message}` and join with `\n`; return as `logs: string`.
  - Otherwise return `logs` as the raw `LogEntry[]` array.
  - Return `totalCount` as `rows.length` (not a separate `COUNT` query — keep it simple for now).
- [ ] Register `read_logs` as an MCP tool with input schema:
  ```ts
  z.object({
    task_id: z.string().optional(),
    turn_index: z.number().int().min(0).optional(),
    limit: z.number().int().min(1).max(1000).default(100),
    since: z.string().datetime().optional(),
    format: z.enum(["json", "text"]).default("json")
  })
  ```
- [ ] Ensure the `agent_logs` table schema (id TEXT, task_id TEXT, turn_index INT, level TEXT, message TEXT, metadata TEXT, created_at TEXT) is documented and referenced from the `DatabaseAdapter.agent.md` created in task 04.

## 3. Code Review
- [ ] Verify all SQL parameters are bound (no string interpolation into SQL).
- [ ] Verify `metadata` column is parsed from a JSON string to `Record<string, unknown>` when `format: "json"` (use `JSON.parse` wrapped in try/catch; on failure set `metadata: null`).
- [ ] Verify `since` is validated as a valid ISO 8601 date before passing to SQL (zod `.datetime()` handles this in the input schema; confirm the schema validator is invoked before the function body).
- [ ] Verify `format: "text"` output sanitises newlines in `message` (replace `\n` with `\\n`) to keep each entry on a single line.
- [ ] Verify the tool does not expose internal database file paths in error messages.

## 4. Run Automated Tests to Verify
- [ ] Run `pnpm --filter @devs/mcp-server test -- --testPathPattern="read-logs"` and confirm all tests pass (GREEN).
- [ ] Run `pnpm --filter @devs/mcp-server tsc --noEmit`.

## 5. Update Documentation
- [ ] Append to `packages/mcp-server/src/projectserver/tools/index.agent.md`:
  - Document `read_logs` all filter parameters, format options, and clamping behaviour.
  - Explain the "context recovery" workflow: when an agent's context window is nearing its limit, it should call `read_logs` with a `task_id` filter to retrieve raw historical data rather than relying on summarised context.
  - List requirement IDs: `4_USER_FEATURES-REQ-042`.
- [ ] Update `packages/mcp-server/src/projectserver/db/DatabaseAdapter.agent.md` to include the `agent_logs` table schema.

## 6. Automated Verification
- [ ] Run `pnpm --filter @devs/mcp-server test -- --ci --testPathPattern="read-logs"` and assert exit code `0`.
- [ ] Run `grep -n "agent_logs\|LogEntry\|clamp\|1000" packages/mcp-server/src/projectserver/tools/readLogs.ts` and confirm all four identifiers/values are present.
