# Task: MCP Tool Call JSON Schema Validation and Hallucination Mitigation (Sub-Epic: 12_Model Failover and Provider Handling)

## Covered Requirements
- [3_MCP-RISK-201]

## 1. Initial Test Written
- [ ] In `src/mcp/__tests__/ToolCallValidator.test.ts`, write unit tests covering:
  - `ToolCallValidator.validate(toolName, args)` returns `{ valid: true }` when `args` matches the registered JSON schema for `toolName`.
  - `validate` returns `{ valid: false, errors: ValidationError[] }` when `args` has missing required fields, wrong types, or extra disallowed properties.
  - `validate` throws `UnknownToolError` when `toolName` is not registered in the schema registry.
  - Each `ValidationError` has `path`, `message`, and `expected` fields suitable for building a structured "Help" prompt.
  - `ToolCallValidator.buildHelpPrompt(toolName, errors)` returns a Markdown string containing:
    - The tool's full JSON schema (pretty-printed in a fenced block).
    - A numbered list of validation errors with field paths and expected types.
    - The phrase "Please correct your tool call arguments and try again."
  - Validation is strict: `additionalProperties: false` is enforced on all tool schemas.
- [ ] In `src/mcp/__tests__/ToolCallValidator.integration.test.ts`, write an integration test that:
  - Registers the real tool schemas from `src/mcp/toolSchemas.ts`.
  - Calls `validate('read_file', { path: 123 })` and asserts `valid: false` with `path` having type error `expected: 'string'`.
  - Calls `validate('write_file', { path: '/tmp/a.txt', content: 'hello' })` and asserts `valid: true`.

## 2. Task Implementation
- [ ] Create `src/mcp/ToolCallValidator.ts`:
  - Uses `ajv` (Ajv v8) with `strict: true`, `allErrors: true`, and `removeAdditional: false` (reject extra props).
  - `registerSchema(toolName: string, schema: JSONSchema): void` — compiles and caches the Ajv validator.
  - `validate(toolName: string, args: unknown): ValidationResult`:
    - `ValidationResult` is `{ valid: true } | { valid: false; errors: ValidationError[] }`.
    - `ValidationError`: `{ path: string; message: string; expected: string }`.
    - Maps Ajv error objects to `ValidationError` using `instancePath` and `params`.
  - `buildHelpPrompt(toolName: string, errors: ValidationError[]): string` — returns structured Markdown "Help" prompt.
  - `UnknownToolError extends Error` thrown when `toolName` not found in schema registry.
- [ ] Create `src/mcp/toolSchemas.ts` exporting a `TOOL_SCHEMAS: Record<string, JSONSchema>` map for all existing MCP tools (e.g., `read_file`, `write_file`, `run_tests`, `db_query`, `git_commit`). Each schema must include `required`, `properties`, `type: 'object'`, and `additionalProperties: false`.
- [ ] Update `src/mcp/McpServer.ts` (or equivalent MCP tool dispatch layer):
  - Before executing any tool call, invoke `ToolCallValidator.validate(toolName, args)`.
  - If `valid: false`: do NOT execute the tool; instead return a structured MCP error response containing `buildHelpPrompt(toolName, errors)` as the `message`.
  - Log the validation failure at `WARN` level with `{ toolName, errors }`.
- [ ] Install `ajv` and `ajv-formats` as production dependencies: `npm install ajv ajv-formats`.

## 3. Code Review
- [ ] Verify that `ToolCallValidator` never executes user-supplied code or `eval` — it only compiles declarative JSON Schemas.
- [ ] Confirm that `buildHelpPrompt` output is deterministic (same inputs → same output) for snapshot testing.
- [ ] Ensure the MCP dispatch layer returns the "Help" prompt error without leaking internal stack traces to the agent.
- [ ] Validate that all 10+ existing tool schemas in `toolSchemas.ts` include `additionalProperties: false` and properly typed `required` arrays.
- [ ] Check that `registerSchema` is called once at startup (not per-request) to avoid recompilation overhead.

## 4. Run Automated Tests to Verify
- [ ] Run `npm test -- --testPathPattern="src/mcp/__tests__/ToolCallValidator"` and confirm all tests pass.
- [ ] Run `npm run lint -- src/mcp/` with 0 errors.
- [ ] Run `npm run typecheck` with 0 errors.
- [ ] Run `npm audit` and confirm no high/critical vulnerabilities introduced by `ajv`/`ajv-formats`.

## 5. Update Documentation
- [ ] Create `docs/mcp/tool-schema-validation.md` documenting:
  - The validation pipeline (schema registration → per-call validation → Help prompt on failure).
  - How to add a new tool schema (with example).
  - The `ValidationError` structure and how agents should interpret Help prompts.
- [ ] Add changelog entry: `feat(mcp): add strict JSON schema validation for all tool calls with automated Help prompts on failure`.

## 6. Automated Verification
- [ ] Run `npm test -- --coverage --testPathPattern="src/mcp/__tests__/ToolCallValidator" --coverageThreshold='{"global":{"branches":90,"lines":90}}'` and confirm thresholds are met.
- [ ] Write a one-off verification script `scripts/verify-tool-schemas.ts` that instantiates `ToolCallValidator` with all schemas from `toolSchemas.ts` and asserts that each schema compiles without Ajv errors. Run it via `npx ts-node scripts/verify-tool-schemas.ts` and confirm exit code 0.
