# Task: Tool Registry Foundation – Core Types & Built-in Tool Registration (Sub-Epic: 06_Tool Registry & Proxy)

## Covered Requirements
- [9_ROADMAP-TAS-205], [TAS-077], [TAS-072]

## 1. Initial Test Written
- [ ] Create `packages/core/src/tool-registry/__tests__/tool-registry.test.ts`.
- [ ] Write a unit test that constructs a `ToolRegistry` instance with no registered tools and asserts that `listTools()` returns an empty array.
- [ ] Write unit tests that call `register(toolDefinition)` for each of the five required built-in tools (`read_file`, `write_file`, `shell_exec`, `git_commit`, `surgical_edit`) and assert that `listTools()` subsequently returns all five descriptors with correct `name`, `description`, and `inputSchema` fields.
- [ ] Write a unit test asserting that `getTool(name)` returns the correct `RegisteredTool` object for a known name and throws/returns `undefined` for an unknown name.
- [ ] Write a unit test asserting that registering a tool with a duplicate `name` throws a `DuplicateToolError`.
- [ ] Write a unit test for `getToolNames()` that returns the exact set of registered tool names as a `string[]`.
- [ ] All tests must be runnable with `pnpm test --filter @devs/core` before any implementation exists (they should fail with "cannot find module" or equivalent).

## 2. Task Implementation
- [ ] Create `packages/core/src/tool-registry/types.ts` and define:
  - `ToolDefinition` interface: `{ name: string; description: string; inputSchema: JSONSchema7; handler: ToolHandler }` where `ToolHandler = (args: unknown, context: ToolExecutionContext) => Promise<ToolResult>`.
  - `RegisteredTool` type: `ToolDefinition & { registeredAt: Date }`.
  - `ToolResult` type: `{ content: Array<{ type: 'text' | 'error'; text: string }>; isError?: boolean }`.
  - `ToolExecutionContext` interface: `{ projectRoot: string; agentId: string; turnIndex: number; phaseId: string; epicId: string }`.
  - `DuplicateToolError` class extending `Error`.
- [ ] Create `packages/core/src/tool-registry/ToolRegistry.ts`:
  - Implement `ToolRegistry` class with a private `Map<string, RegisteredTool>` store.
  - `register(def: ToolDefinition): void` – adds to the map, throws `DuplicateToolError` if key already exists.
  - `getTool(name: string): RegisteredTool | undefined`.
  - `listTools(): RegisteredTool[]` – returns array of all registered tools.
  - `getToolNames(): string[]`.
- [ ] Create `packages/core/src/tool-registry/built-in-tools/read-file.ts` implementing the `read_file` tool:
  - `inputSchema`: `{ type: 'object', properties: { path: { type: 'string' } }, required: ['path'], additionalProperties: false }`.
  - Handler: reads file contents relative to `context.projectRoot` (actual I/O delegated via injected `FileSystem` interface – use a constructor-injected dependency).
- [ ] Create similarly scoped files for `write_file`, `shell_exec`, `git_commit`, and `surgical_edit` built-in tools, each with a typed `inputSchema` and a stub handler that throws `NotImplementedError` (to be wired to sandbox in a later task).
- [ ] Create `packages/core/src/tool-registry/index.ts` exporting `ToolRegistry`, all types, and a `createDefaultRegistry(): ToolRegistry` factory function that registers the five built-in tools.
- [ ] Add barrel export to `packages/core/src/index.ts`.

## 3. Code Review
- [ ] Verify that `ToolDefinition.inputSchema` is typed as `JSONSchema7` (from `@types/json-schema`) – no `any` allowed.
- [ ] Verify that the `ToolRegistry` class is not coupled to any specific transport (MCP SDK, HTTP, etc.) – it must be a pure in-memory registry.
- [ ] Confirm `DuplicateToolError` includes the conflicting tool `name` in its `message`.
- [ ] Confirm that `createDefaultRegistry()` is the only place where built-in tools are registered, keeping instantiation deterministic.
- [ ] Ensure no circular imports exist between `types.ts`, `ToolRegistry.ts`, and built-in tool files.

## 4. Run Automated Tests to Verify
- [ ] Run `pnpm test --filter @devs/core -- --testPathPattern tool-registry` and confirm all tests pass with zero failures.
- [ ] Run `pnpm tsc --noEmit --filter @devs/core` to confirm zero TypeScript compilation errors.

## 5. Update Documentation
- [ ] Add a `## Tool Registry` section to `packages/core/README.md` documenting: the `ToolRegistry` API, the five built-in tools, and the `createDefaultRegistry()` factory.
- [ ] Update `docs/architecture/mcp-tool-registry.md` (create if absent) to reference `[9_ROADMAP-TAS-205]`, `[TAS-077]`, and `[TAS-072]` and describe the registry data model.
- [ ] Add an entry to the agent memory file (e.g., `memory/phase_3/decisions.md`) noting: "ToolRegistry is framework-agnostic; built-in handlers delegate I/O to injected FileSystem abstraction."

## 6. Automated Verification
- [ ] CI step: `pnpm test --filter @devs/core -- --testPathPattern tool-registry --ci` must exit 0.
- [ ] CI step: `pnpm tsc --noEmit --filter @devs/core` must exit 0.
- [ ] Verify test coverage for `tool-registry/` is ≥ 90% lines by running `pnpm test --filter @devs/core -- --coverage --testPathPattern tool-registry` and inspecting the summary.
