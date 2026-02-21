# Task: Implement Tool Call Schema Validator and Help Prompt System (Sub-Epic: 13_Agent Autonomy & Reviewer Intelligence)

## Covered Requirements
- [3_MCP-RISK-201]

## 1. Initial Test Written

- [ ] In `packages/core/src/mcp/__tests__/tool-validator.test.ts`, write the following tests before any implementation:
  - **Unit: Valid call passes** — Call `validateToolCall({ tool_name: "filesystem_operation", args: { action: "read", path: "/src/foo.ts" } })` against the registered Zod schema for `filesystem_operation`. Assert it returns `{ valid: true, parsed: { action: "read", path: "/src/foo.ts" } }` with no errors.
  - **Unit: Missing required field** — Call `validateToolCall({ tool_name: "filesystem_operation", args: { action: "read" } })` (missing `path`). Assert it returns `{ valid: false, errors: [{ field: "path", message: "Required" }], help_prompt: "<string>" }` where `help_prompt` is a non-empty string.
  - **Unit: Unknown tool name** — Call `validateToolCall({ tool_name: "non_existent_tool", args: {} })`. Assert it returns `{ valid: false, errors: [{ field: "tool_name", message: "Unknown tool: non_existent_tool" }], help_prompt: "<string>" }`.
  - **Unit: Wrong type for field** — Call `validateToolCall({ tool_name: "run_test_task", args: { test_path: 42, reporter: "json" } })` (`test_path` should be a string). Assert the error references `test_path` and the type mismatch.
  - **Unit: Help prompt content** — When validation fails, assert `help_prompt` contains: (a) the tool name, (b) a complete valid example call, and (c) the list of required fields with their types. This ensures the agent can self-correct.
  - **Unit: Help prompt for unknown tool** — When the tool name is unknown, assert `help_prompt` contains a list of all available tool names (the registry contents) so the agent can discover valid tools.
  - **Unit: Retry observation format** — Call `buildRetryObservation({ tool_name: "filesystem_operation", validation_result: { valid: false, errors: [...], help_prompt: "..." } })`. Assert the returned `SAOP_Envelope` has `type: "observation"`, `payload.observation.status: "VALIDATION_FAILED"`, and `payload.observation.stdout` contains the full `help_prompt`.
  - **Integration: MCP server intercepts invalid call** — In a mock `OrchestratorServer`, register a tool with its Zod schema. Send a malformed tool call via the MCP SDK. Assert the server returns a `VALIDATION_FAILED` observation (not a 500 error or uncaught exception) and the observation body includes the help prompt.
  - **Integration: MCP server allows valid call** — Send a well-formed tool call. Assert the server invokes the handler and returns the normal result.

## 2. Task Implementation

- [ ] Create `packages/core/src/mcp/tool-validator.ts`:
  - Maintain a `ToolRegistry: Map<string, { schema: ZodSchema; example: object; description: string }>`.
  - Implement `registerToolSchema(tool_name: string, schema: ZodSchema, example: object, description: string): void` — adds the tool to the registry.
  - Implement `validateToolCall(input: { tool_name: string; args: unknown }): ValidationResult`:
    - If `tool_name` not in registry: return `{ valid: false, errors: [{ field: "tool_name", message: "Unknown tool: <name>" }], help_prompt: buildUnknownToolHelp() }`.
    - Otherwise: `schema.safeParse(args)`. If success, return `{ valid: true, parsed: result.data }`. If failure, map `ZodError.issues` to `ValidationError[]` and call `buildHelpPrompt(tool_name)`.
  - Implement `buildHelpPrompt(tool_name: string): string`:
    - Header: `"Tool call failed for: <tool_name>"`.
    - Section `"Description"`: the registered description.
    - Section `"Required Fields"`: for each field in the Zod schema shape, list `field_name (type): <description>`.
    - Section `"Valid Example"`: `JSON.stringify(registry.get(tool_name).example, null, 2)` in a fenced JSON block.
  - Implement `buildUnknownToolHelp(): string`:
    - Header: `"Unknown tool name. Available tools:"`.
    - A bulleted list of all keys in `ToolRegistry`.
  - Implement `buildRetryObservation(input: { tool_name: string; validation_result: ValidationResult }): SAOP_Envelope`:
    - Return a `SAOP_Envelope` with `type: "observation"`, `turn_index` from the active context, and `payload.observation.status: "VALIDATION_FAILED"` and `payload.observation.stdout: validation_result.help_prompt`.
- [ ] Register Zod schemas for **all** existing MCP tools in both `OrchestratorServer` and `SandboxServer`:
  - `OrchestratorServer` tools: `get_project_context`, `search_memory`, `manage_hitl_gate`, `get_task_trace`, `inject_directive`, `rewind_to_checkpoint`.
  - `SandboxServer` tools: `filesystem_operation`, `apply_surgical_edits`, `search_codebase`, `run_shell_monitored`, `dependency_manager`, `git_controller`.
  - `ProjectServer` tools: `inspect_state`, `run_test_task`, `db_bridge`, `capture_trace`, `get_logs`.
  - For each tool, call `registerToolSchema(name, zodSchema, exampleArgs, description)` during server initialization.
- [ ] Add a middleware layer in the MCP server base class (`packages/core/src/mcp/base-server.ts` or equivalent) that intercepts every tool call:
  1. Call `validateToolCall({ tool_name, args })`.
  2. If `valid: false`: return `buildRetryObservation(...)` to the agent without invoking the handler.
  3. If `valid: true`: invoke the handler with the `parsed` (Zod-coerced) args.

## 3. Code Review

- [ ] Verify every MCP tool in all three servers has a registered Zod schema — add a startup assertion that logs a warning for any tool missing a schema.
- [ ] Verify `buildHelpPrompt` produces output that is concise enough to fit within 500 tokens — the help text must not cause context bloat.
- [ ] Verify `buildRetryObservation` assigns the correct `turn_index` from the active SAOP context, not a hardcoded value.
- [ ] Confirm the validation middleware is applied at the transport layer (before any business logic), not inside individual tool handlers — preventing handler bugs from exposing raw stack traces to the agent.
- [ ] Confirm Zod `safeParse` is used (not `parse`) so validation never throws an uncaught exception — the server MUST remain operational after a bad tool call.

## 4. Run Automated Tests to Verify

- [ ] Run: `cd packages/core && npm test -- --testPathPattern="tool-validator"` and confirm all tests pass.
- [ ] Run: `npm run lint && npx tsc --noEmit` in `packages/core` and confirm zero errors.
- [ ] Run the full suite: `npm test` from the monorepo root to confirm no regressions.

## 5. Update Documentation

- [ ] Create `packages/core/src/mcp/.agent.md` documenting:
  - The `ToolRegistry` data structure and how to add new tool schemas.
  - The `ValidationResult` and `SAOP_Envelope` types returned on failure.
  - The contract that every MCP tool MUST have a registered Zod schema before the server starts.
- [ ] Update `docs/mcp-servers.md` with a section "Tool Validation & Hallucination Mitigation" explaining:
  - The `VALIDATION_FAILED` observation type and what it signals to the agent.
  - How the help prompt allows agents to self-correct without a human intervention.
- [ ] Update `.agent/index.agent.md` to register `validateToolCall` and `buildRetryObservation` as introspection utilities available to developer agents.

## 6. Automated Verification

- [ ] Run `node scripts/verify-requirements.js --req 3_MCP-RISK-201` and confirm the script reports `COVERED` by detecting `validateToolCall`, Zod schema registrations, and `buildRetryObservation` in the source.
- [ ] Run a schema coverage check: `node scripts/check-tool-schema-coverage.js` (create this script if absent) — it imports all three servers and asserts that every registered tool name has a corresponding Zod schema in `ToolRegistry`. The script exits non-zero if any tool is unregistered.
