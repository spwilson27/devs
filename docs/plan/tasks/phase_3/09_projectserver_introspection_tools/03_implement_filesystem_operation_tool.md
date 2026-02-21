# Task: Implement filesystem_operation and apply_surgical_edits Tools (Sub-Epic: 09_ProjectServer Introspection Tools)

## Covered Requirements
- [3_MCP-TAS-079]

## 1. Initial Test Written
- [ ] Create `packages/mcp-server/src/projectserver/__tests__/filesystem-tools.test.ts`.
- [ ] Use `tmp` or `memfs` to create an isolated virtual/temp filesystem for all tests.
- [ ] Write unit tests for `filesystem_operation`:
  - `action: "read"` — reads a file ≤ 500 KB and returns `FSResult { ok: true, data: string, bytesRead: number }`.
  - `action: "read"` — for a file > 500 KB, returns `FSResult { ok: false, error: "File exceeds 500KB limit" }`.
  - `action: "write"` — writes content to a file, confirms `FSResult { ok: true }`, verifies file content on disk.
  - `action: "list"` — lists directory entries, returns `FSResult { ok: true, data: string[] }` with filenames.
  - `action: "move"` — moves a file to a new path, confirms original is gone and destination exists.
  - `action: "read"` on a non-existent file — returns `FSResult { ok: false, error: "File not found" }`.
  - `path` that resolves outside the project root (path traversal attempt, e.g., `../../etc/passwd`) — returns `FSResult { ok: false, error: "Path traversal detected" }`.
- [ ] Write unit tests for `apply_surgical_edits`:
  - Applies a single `{ old: string, new: string }` edit to a file and returns `EditResult { ok: true, appliedEdits: 1 }`.
  - Applies multiple non-overlapping edits in sequence and returns `appliedEdits` equal to the count provided.
  - When `old` string is not found in the file, returns `EditResult { ok: false, error: "Edit target not found: ..." }`.
  - When `path` does not exist, returns `EditResult { ok: false, error: "File not found" }`.
  - Path traversal in `apply_surgical_edits` is also rejected.
- [ ] All tests must fail (RED) before implementation.

## 2. Task Implementation
- [ ] Create `packages/mcp-server/src/projectserver/tools/filesystemOperation.ts`:
  - Export `filesystemOperation(params: { action: "read" | "write" | "list" | "move"; path: string; content?: string; destination?: string }, projectRoot: string): Promise<FSResult>`.
  - Resolve `path` (and `destination`) relative to `projectRoot`; validate that the resolved path starts with the real `projectRoot` using `path.resolve` and a prefix check. Return `{ ok: false, error: "Path traversal detected" }` if check fails.
  - For `read`: read file with `fs/promises`, check byte length ≤ 512_000 (500 KB), return `{ ok: true, data, bytesRead }`.
  - For `write`: write with `fs/promises`, return `{ ok: true }`.
  - For `list`: read directory entries with `fs/promises.readdir`, return `{ ok: true, data: string[] }`.
  - For `move`: use `fs/promises.rename`, return `{ ok: true }`.
  - Wrap all `fs` operations in try/catch and return `{ ok: false, error: err.message }` on failure.
- [ ] Create `packages/mcp-server/src/projectserver/tools/applySurgicalEdits.ts`:
  - Export `applySurgicalEdits(params: { path: string; edits: Array<{ old: string; new: string }> }, projectRoot: string): Promise<EditResult>`.
  - Validate path against traversal (same helper as above).
  - Read file content; apply each `{ old, new }` replacement in order using `String.prototype.replace` (first occurrence only); if `old` is not found return early with `EditResult { ok: false, error: "Edit target not found: <old>" }`.
  - Write updated content back to file.
  - Return `{ ok: true, appliedEdits: edits.length }`.
- [ ] Create a shared internal utility `packages/mcp-server/src/projectserver/tools/_pathGuard.ts` that exports `guardPath(inputPath: string, projectRoot: string): string` — resolves the path and throws a typed `PathTraversalError` if outside root. Both tools should use this utility.
- [ ] Create `packages/mcp-server/src/projectserver/tools/index.ts` re-exporting both tools and the path guard.
- [ ] Register both tools with the MCP `ProjectServer` tool registry (see task `08_projectserver_template`) as MCP tool handlers using their `zod` parameter schemas from `packages/mcp-server/src/projectserver/types/schemas.ts`.

## 3. Code Review
- [ ] Verify the 500 KB limit is checked on byte length (`Buffer.byteLength` or `stat.size`), not character count.
- [ ] Verify `_pathGuard.ts` uses `path.resolve` (not string concatenation) to canonicalize paths before comparison.
- [ ] Verify `applySurgicalEdits` applies edits sequentially (not in parallel) to avoid read-modify-write races.
- [ ] Verify no raw `fs` callbacks — only `fs/promises` async/await.
- [ ] Verify MCP tool registration includes the correct JSON schema for input validation (derived from zod schemas via `.toJSON()` or `zodToJsonSchema`).
- [ ] Verify path traversal tests cover symlink resolution edge cases (document any known limitation in `index.agent.md` if symlinks are not yet handled).

## 4. Run Automated Tests to Verify
- [ ] Run `pnpm --filter @devs/mcp-server test -- --testPathPattern="filesystem-tools"` and confirm all tests pass (GREEN).
- [ ] Run `pnpm --filter @devs/mcp-server tsc --noEmit`.

## 5. Update Documentation
- [ ] Create `packages/mcp-server/src/projectserver/tools/index.agent.md`:
  - Document `filesystem_operation` parameters, return types, size limits, and path-safety guarantees.
  - Document `apply_surgical_edits` edit-application semantics (sequential, first-occurrence).
  - List requirement IDs: `3_MCP-TAS-079`.
  - Include an example of a valid MCP tool call JSON for each action.

## 6. Automated Verification
- [ ] Run `pnpm --filter @devs/mcp-server test -- --ci --testPathPattern="filesystem-tools"` and assert exit code `0`.
- [ ] Run `grep -n "PathTraversalError\|guardPath" packages/mcp-server/src/projectserver/tools/filesystemOperation.ts packages/mcp-server/src/projectserver/tools/applySurgicalEdits.ts` and confirm both files reference the guard.
