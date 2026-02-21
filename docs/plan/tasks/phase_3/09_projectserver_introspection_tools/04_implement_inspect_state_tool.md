# Task: Implement inspect_state Tool (Sub-Epic: 09_ProjectServer Introspection Tools)

## Covered Requirements
- [3_MCP-TAS-080], [2_TAS-REQ-009]

## 1. Initial Test Written
- [ ] Create `packages/mcp-server/src/projectserver/__tests__/inspect-state.test.ts`.
- [ ] Mock `IntrospectionRegistry` to contain a set of pre-seeded `IntrospectionPoint` entries.
- [ ] Write unit tests for `inspectState(params: { path: string; depth?: number })`:
  - `path` matching a registered `IntrospectionPoint` of kind `state_snapshot` — returns the most recent snapshot payload as JSON.
  - `path` matching a module-level in-memory singleton variable (simulated via a test fixture module exporting a mutable object) — returns the current value of that variable at `depth: 1`.
  - `depth: 0` — returns only the top-level keys of the resolved state object (not nested values).
  - `depth: 2` — returns two levels of nesting.
  - `path` that does not match any introspection point or known state path — returns `{ ok: false, error: "No introspection point found at path: <path>" }`.
  - Accessing a SQLite database state path (e.g., `db://tasks`) — mocks the `DatabaseAdapter` and verifies the adapter's `query` method is called with the correct path segment.
- [ ] Write an integration test spinning up a minimal ProjectServer with `inspect_state` registered, calling it via an MCP `tool_call` message, and asserting the JSON response matches expected state.
- [ ] All tests must fail (RED) before implementation.

## 2. Task Implementation
- [ ] Create `packages/mcp-server/src/projectserver/tools/inspectState.ts`:
  - Export `inspectState(params: { path: string; depth?: number }, deps: { registry: IntrospectionRegistry; db: DatabaseAdapter }): Promise<Record<string, unknown> | { ok: false; error: string }>`.
  - Parse `path`:
    - If it starts with `db://`, strip the prefix and delegate to `deps.db.query(tablePath)` returning the first row as JSON.
    - Otherwise, look up the `path` in `deps.registry.getById(path)`. If found and the registry has a cached snapshot for this point, return it clipped to `depth` levels using a `pruneDepth(obj, depth)` utility.
    - If not found, return `{ ok: false, error: \`No introspection point found at path: ${path}\` }`.
  - Implement `pruneDepth(obj: unknown, depth: number): unknown` — recursive function that replaces object values beyond `depth` with `"[pruned]"` sentinel; exported for testing.
- [ ] Create `packages/mcp-server/src/projectserver/tools/snapshotCache.ts`:
  - Export `SnapshotCache` class with `set(id: string, value: unknown): void` and `get(id: string): unknown | undefined`.
  - The `decorateWithIntrospectionPoint` wrapper from task 02 must call `snapshotCache.set(point.id, result)` after each invocation so `inspectState` can retrieve live state.
  - Integrate `snapshotCache` into `decorateWithIntrospectionPoint` (update task 02's implementation to accept an optional `cache: SnapshotCache` parameter and call `cache.set` when provided).
- [ ] Register `inspect_state` as an MCP tool in the ProjectServer handler with the following input schema (using zod):
  ```ts
  z.object({ path: z.string(), depth: z.number().int().min(0).default(3) })
  ```
- [ ] Ensure `DatabaseAdapter` is an interface (defined in `packages/mcp-server/src/projectserver/db/DatabaseAdapter.ts`) so it can be mocked in tests.

## 3. Code Review
- [ ] Verify `pruneDepth` handles circular references gracefully (wrap in try/catch or use a `seen: Set` guard).
- [ ] Verify the `db://` path scheme is documented and validated (reject paths with `..` or spaces).
- [ ] Verify `SnapshotCache` is bounded — add a maximum of 1000 entries using an LRU eviction strategy (use a simple `Map` with manual eviction on `set` if size > 1000).
- [ ] Verify the MCP tool response is always valid JSON (wrap the entire return value in `JSON.stringify`/`JSON.parse` round-trip before sending).
- [ ] Verify `inspectState` is a pure function given its `deps` — no module-level mutable state inside the function itself.

## 4. Run Automated Tests to Verify
- [ ] Run `pnpm --filter @devs/mcp-server test -- --testPathPattern="inspect-state"` and confirm all tests pass (GREEN).
- [ ] Run `pnpm --filter @devs/mcp-server tsc --noEmit`.

## 5. Update Documentation
- [ ] Append to `packages/mcp-server/src/projectserver/tools/index.agent.md`:
  - Document `inspect_state` path syntax (plain ID vs `db://` scheme).
  - Document `depth` parameter semantics and `[pruned]` sentinel.
  - List requirement IDs: `3_MCP-TAS-080`, `2_TAS-REQ-009`.
- [ ] Create `packages/mcp-server/src/projectserver/db/DatabaseAdapter.agent.md` documenting the adapter interface contract.

## 6. Automated Verification
- [ ] Run `pnpm --filter @devs/mcp-server test -- --ci --testPathPattern="inspect-state"` and assert exit code `0`.
- [ ] Run `grep -n "pruneDepth\|SnapshotCache\|db://" packages/mcp-server/src/projectserver/tools/inspectState.ts` and confirm all three identifiers are present.
