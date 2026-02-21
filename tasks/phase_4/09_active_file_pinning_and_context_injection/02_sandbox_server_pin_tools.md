# Task: Implement SandboxServer MCP Tools for Active File Pinning (Sub-Epic: 09_Active_File_Pinning_and_Context_Injection)

## Covered Requirements
- [3_MCP-TAS-048]

## 1. Initial Test Written
- [ ] Create `packages/mcp-server/src/tools/active-file-pin/__tests__/pinTools.test.ts`.
- [ ] Mock `ActiveFilePinStore` (from `@devs/memory/active-file-pin`) using Jest manual mocks.
- [ ] Write a unit test for `pin_file` tool handler:
  - Given a valid `absolute_path` string and `token_estimate` number in the input, it calls `store.addPin(path, estimate)` and returns a JSON success response `{ pinned: true, entry: ActiveFilePin }`.
  - Given `store.addPin` throws `DuplicatePinError`, it returns a structured error response `{ pinned: false, reason: "already_pinned", path }` with HTTP-level success (not a thrown exception, so the MCP caller can handle gracefully).
  - Given `absolute_path` is empty string or not provided, it returns `{ error: "invalid_path" }`.
- [ ] Write a unit test for `unpin_file` tool handler:
  - Given a path that exists, calls `store.removePin(path)` and returns `{ unpinned: true }`.
  - Given a path that does not exist, returns `{ unpinned: false, reason: "not_found" }`.
- [ ] Write a unit test for `list_pinned_files` tool handler:
  - Calls `store.listPins()` and returns `{ pins: ActiveFilePin[] }`.
  - Returns `{ pins: [] }` when no files are pinned.
- [ ] Write an integration test using a real in-memory `ActiveFilePinStore` (`:memory:` SQLite) wired to the MCP server, calling each tool via the MCP `callTool` interface and asserting on the JSON response shape.

## 2. Task Implementation
- [ ] In `packages/mcp-server/src/tools/active-file-pin/`, create:
  - `pinFileHandler.ts` — async function `handlePinFile(input: unknown, store: ActiveFilePinStore): Promise<ToolResult>`.
    - Validates `input` has `absolute_path: string` and optional `token_estimate: number` (default `0`).
    - Calls `store.addPin(...)`. On `DuplicatePinError`, returns a non-throwing structured error.
  - `unpinFileHandler.ts` — async function `handleUnpinFile(input: unknown, store: ActiveFilePinStore): Promise<ToolResult>`.
  - `listPinnedFilesHandler.ts` — async function `handleListPinnedFiles(store: ActiveFilePinStore): Promise<ToolResult>`.
  - `schemas.ts` — Zod schemas for each tool's input, e.g. `PinFileInputSchema`, `UnpinFileInputSchema`.
  - `index.ts` — registers all three tools in the MCP `ToolRegistry` with:
    - `name`: `"pin_file"`, `"unpin_file"`, `"list_pinned_files"`.
    - `description`: human-readable string for each.
    - `inputSchema`: the corresponding Zod schema serialized to JSON Schema.
- [ ] In `packages/mcp-server/src/SandboxServer.ts`, import and register the three tools from `./tools/active-file-pin/index.ts` during server initialization, injecting the shared `ActiveFilePinStore` instance.
- [ ] Ensure `ActiveFilePinStore.initialize()` is called once during `SandboxServer` startup before any tool handler runs.

## 3. Code Review
- [ ] Confirm that each handler function is pure (no global state); the `store` is injected via parameter.
- [ ] Confirm Zod validation is applied to all inbound `input` arguments before any business logic runs; invalid input must return a structured error, not throw.
- [ ] Confirm that MCP `ToolResult` objects always contain a `content` array with at least one `TextContent` entry as required by the MCP spec.
- [ ] Confirm no direct `console.log` calls exist in handler code; use the project logger (`@devs/logger`).
- [ ] Verify TypeScript strict mode produces zero errors: `pnpm tsc --noEmit` in `packages/mcp-server`.

## 4. Run Automated Tests to Verify
- [ ] Run `pnpm --filter @devs/mcp-server test -- --testPathPattern="pinTools"` and confirm all unit tests pass.
- [ ] Run the integration test suite: `pnpm --filter @devs/mcp-server test -- --testPathPattern="pinTools.integration"`.
- [ ] Confirm 0 failures and ≥ 85% coverage on the three handler files.

## 5. Update Documentation
- [ ] Create `packages/mcp-server/src/tools/active-file-pin/pinTools.agent.md`:
  - List tool names, input schemas, output shapes, and error codes.
  - Document the `DuplicatePinError` propagation contract (structured response, not thrown).
- [ ] Update `packages/mcp-server/README.md` to include `pin_file`, `unpin_file`, `list_pinned_files` in the tools table.

## 6. Automated Verification
- [ ] Execute `pnpm --filter @devs/mcp-server test --ci` and confirm exit code `0`.
- [ ] Start the MCP server locally and run `node scripts/smoke-test-pin-tools.js` which calls each tool via the MCP JSON-RPC interface and asserts expected response shapes.
- [ ] Confirm `pnpm tsc --noEmit` exits with `0`.
