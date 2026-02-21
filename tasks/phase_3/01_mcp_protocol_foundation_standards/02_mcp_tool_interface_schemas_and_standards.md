# Task: Define Standardized MCP Tool Interface Schemas and Enforce Unified Tool Contract (Sub-Epic: 01_MCP Protocol Foundation & Standards)

## Covered Requirements
- [TAS-036], [TAS-014], [8_RISKS-REQ-055]

## 1. Initial Test Written
- [ ] In `packages/mcp/src/__tests__/tool_schema.test.ts`, write unit tests that:
  - Import `ToolSchema` (a Zod schema object) and `validateToolDefinition` from `@devs/mcp/schemas`.
  - Assert that a valid tool definition object (name, description, inputSchema conforming to JSON Schema Draft-07) passes validation.
  - Assert that a tool definition missing `name` throws a `ZodError` with a meaningful message.
  - Assert that a tool definition with a proprietary non-MCP-spec field (e.g., `customExtension`) fails validation, confirming open-standard enforcement (covers [8_RISKS-REQ-055]).
- [ ] In `packages/mcp/src/__tests__/tool_registry.test.ts`, write unit tests that:
  - Import `ToolRegistry` from `@devs/mcp`.
  - Assert that `registry.register(tool)` succeeds for a valid `ToolDefinition`.
  - Assert that `registry.register(tool)` throws if a tool with the same name is registered twice (deduplication guard).
  - Assert that `registry.getAll()` returns all registered tools as an array.
  - Assert that `registry.getByName('nonexistent')` returns `undefined` (not throws).
- [ ] Write an integration test asserting that a `McpServer` instance populated via `ToolRegistry` exposes the registered tools when `server.listTools()` is called.

## 2. Task Implementation
- [ ] Create `packages/mcp/src/schemas.ts` containing:
  - Install `zod` as a production dependency in `packages/mcp/package.json`.
  - A `ToolInputSchemaSchema` Zod schema that validates a JSON Schema Draft-07 object (must have `type: "object"` and a `properties` record).
  - A `ToolDefinitionSchema` Zod schema with fields: `name` (non-empty string), `description` (non-empty string), `inputSchema` (validated by `ToolInputSchemaSchema`). No additional properties allowed (`z.object(...).strict()`).
  - Export a `validateToolDefinition(raw: unknown): ToolDefinition` function that calls `ToolDefinitionSchema.parse(raw)` and throws a descriptive `ZodError` on failure.
  - Export the inferred TypeScript type `ToolDefinition` from `z.infer<typeof ToolDefinitionSchema>`.
- [ ] Create `packages/mcp/src/tool_registry.ts` implementing a `ToolRegistry` class:
  - Internal `Map<string, ToolDefinition>` store.
  - `register(tool: ToolDefinition): void` — validates via `validateToolDefinition`, throws `DuplicateToolError` if name already registered.
  - `getAll(): ToolDefinition[]` — returns all registered tools as array.
  - `getByName(name: string): ToolDefinition | undefined`.
  - `toMcpTools(): Tool[]` — converts stored `ToolDefinition[]` to the MCP SDK `Tool[]` format suitable for passing to `server.setRequestHandler(ListToolsRequestSchema, ...)`.
  - Export a singleton `globalToolRegistry = new ToolRegistry()` for use across the package.
- [ ] Create `packages/mcp/src/errors.ts` defining:
  - `DuplicateToolError extends Error` with `toolName: string` property.
  - `ToolValidationError extends Error` wrapping the `ZodError`.
- [ ] Update `packages/mcp/src/server.ts` to accept an optional `registry?: ToolRegistry` constructor argument. If provided, call `server.setRequestHandler(ListToolsRequestSchema, () => ({ tools: registry.toMcpTools() }))` during `start()`.
- [ ] Export `ToolRegistry`, `globalToolRegistry`, `ToolDefinition`, `validateToolDefinition`, `DuplicateToolError`, `ToolValidationError` from `packages/mcp/src/index.ts`.

## 3. Code Review
- [ ] Confirm `ToolDefinitionSchema` uses `.strict()` so any unknown/proprietary fields cause a validation failure — this enforces open-standard compliance per [8_RISKS-REQ-055].
- [ ] Confirm the `ToolRegistry` has no dependency on any MCP server instance (pure data store), keeping concerns separated.
- [ ] Confirm `toMcpTools()` produces output that strictly matches the MCP SDK's `Tool` interface shape (no extra fields).
- [ ] Confirm all exported error classes extend `Error` with a proper `name` property set to the class name for correct `instanceof` checks.
- [ ] Confirm `zod` is pinned to a specific semver range in `package.json` and that the Zod version is compatible with the MCP SDK's own schema validation approach.

## 4. Run Automated Tests to Verify
- [ ] Run `pnpm --filter @devs/mcp test` and confirm all tests in `tool_schema.test.ts` and `tool_registry.test.ts` pass.
- [ ] Run `pnpm --filter @devs/mcp build` and confirm `dist/schemas.js`, `dist/tool_registry.js`, and `dist/errors.js` are present.
- [ ] Attempt to import and call `validateToolDefinition({ name: '', description: 'x', inputSchema: { type: 'object', properties: {} } })` and confirm it throws with a message referencing the `name` field.

## 5. Update Documentation
- [ ] Add a section to `packages/mcp/README.md` titled "Tool Schema & Registry" documenting:
  - The shape of `ToolDefinition`.
  - How to register a tool using `globalToolRegistry`.
  - The rule that no proprietary fields may be added to tool definitions.
- [ ] Update `docs/agent_memory/phase_3.md` with the decision: "All MCP tool definitions MUST be validated through `validateToolDefinition` before registration. Proprietary extensions to the MCP tool schema are forbidden."

## 6. Automated Verification
- [ ] Run `pnpm --filter @devs/mcp test -- --coverage` and assert branch coverage ≥ 90% for `src/schemas.ts` and `src/tool_registry.ts`.
- [ ] Run a schema compliance smoke test: `node -e "const {validateToolDefinition} = require('./packages/mcp/dist/schemas.js'); try { validateToolDefinition({name:'t',description:'d',inputSchema:{type:'object',properties:{}}}); console.log('PASS'); } catch(e) { process.exit(1); }"` and assert `PASS` is printed.
- [ ] Run the CI pipeline step for this package and assert exit code 0.
