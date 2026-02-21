# Task: JSON Schema Validation & Structured Argument Enforcement (Sub-Epic: 06_Tool Registry & Proxy)

## Covered Requirements
- [5_SECURITY_DESIGN-REQ-SEC-SD-013], [5_SECURITY_DESIGN-REQ-SEC-SD-058]

## 1. Initial Test Written
- [ ] Create `packages/core/src/tool-registry/__tests__/schema-validator.test.ts`.
- [ ] Write a unit test that calls `validateToolArgs('read_file', { path: 'src/index.ts' })` and asserts it returns `{ valid: true }`.
- [ ] Write a unit test that calls `validateToolArgs('read_file', { path: 123 })` (wrong type) and asserts it returns `{ valid: false, errors: [...] }` containing a human-readable error message.
- [ ] Write a unit test that calls `validateToolArgs('read_file', { path: 'x', extra: 'field' })` with an extra property and asserts it is rejected (`additionalProperties: false` is enforced).
- [ ] Write a unit test for `shell_exec` that passes a `cmd` property as a string (not an array) and asserts the validation fails – argv arrays are mandatory.
- [ ] Write a unit test that calls `validateToolArgs('shell_exec', { argv: ['ls', '-la'] })` and asserts `{ valid: true }`.
- [ ] Write a unit test that passes `null` as args and asserts a `SchemaValidationError` is thrown.
- [ ] Write a unit test asserting that a validation failure is written to the audit log (mock the audit logger and assert it was called with `event: 'TOOL_ARG_VALIDATION_FAILURE'`).
- [ ] Create `packages/core/src/tool-registry/__tests__/unauthorized-args.test.ts`.
- [ ] Write a unit test that attempts to invoke a tool with args that include a disallowed key (`__proto__`, `constructor`, `prototype`) and asserts it is rejected before schema validation even runs.
- [ ] All tests must fail before implementation.

## 2. Task Implementation
- [ ] Add `ajv` and `ajv-formats` as dependencies to `packages/core`.
- [ ] Create `packages/core/src/tool-registry/SchemaValidator.ts`:
  - Instantiate `Ajv` with `{ strict: true, allErrors: true }`.
  - `compile(schema: JSONSchema7): ValidateFunction` – compiles and caches validators keyed by `$id` or schema hash.
  - `validate(schema: JSONSchema7, data: unknown): ValidationResult` where `ValidationResult = { valid: true } | { valid: false; errors: string[] }`.
- [ ] Update `ToolDefinition.inputSchema` for `shell_exec` to require `argv: { type: 'array', items: { type: 'string' }, minItems: 1 }` instead of a `cmd` string, enforcing safe argument passing.
- [ ] Create `packages/core/src/tool-registry/validateToolArgs.ts`:
  - `validateToolArgs(toolName: string, args: unknown, registry: ToolRegistry, auditLogger: AuditLogger): ValidationResult`.
  - Step 1: Check `args` is a non-null object; throw `SchemaValidationError` if not.
  - Step 2: Strip/reject prototype-polluting keys (`__proto__`, `constructor`, `prototype`).
  - Step 3: Retrieve `tool.inputSchema` from registry; throw `UnknownToolError` if not found.
  - Step 4: Validate `args` against schema using `SchemaValidator.validate()`.
  - Step 5: If invalid, call `auditLogger.log({ event: 'TOOL_ARG_VALIDATION_FAILURE', toolName, errors })` and return the failure result.
- [ ] Create `packages/core/src/tool-registry/errors.ts` defining `SchemaValidationError`, `UnknownToolError` classes (both extending `Error`, both including `toolName` in their message).
- [ ] Export all new symbols from `packages/core/src/tool-registry/index.ts`.

## 3. Code Review
- [ ] Verify `Ajv` is configured with `strict: true` – no unknown keywords silently pass.
- [ ] Verify prototype-pollution stripping occurs **before** schema validation (defense-in-depth ordering).
- [ ] Confirm that rejection of unauthorized arguments produces an audit log entry every time without exception.
- [ ] Confirm that `shell_exec` never accepts a raw `cmd` string – only `argv` arrays – per `[5_SECURITY_DESIGN-REQ-SEC-SD-058]`.
- [ ] Ensure `SchemaValidator` does not mutate the incoming `data` object.

## 4. Run Automated Tests to Verify
- [ ] Run `pnpm test --filter @devs/core -- --testPathPattern "(schema-validator|unauthorized-args)" --ci` – all tests pass.
- [ ] Run `pnpm tsc --noEmit --filter @devs/core` – zero errors.

## 5. Update Documentation
- [ ] Add a "Security: Argument Validation" section to `docs/architecture/mcp-tool-registry.md` referencing `[5_SECURITY_DESIGN-REQ-SEC-SD-013]` and `[5_SECURITY_DESIGN-REQ-SEC-SD-058]`.
- [ ] Document the prototype-pollution stripping step in a comment within `validateToolArgs.ts`.
- [ ] Update `memory/phase_3/decisions.md`: "shell_exec uses argv arrays exclusively; no raw command string interpolation. AJV strict mode is mandatory."

## 6. Automated Verification
- [ ] CI: `pnpm test --filter @devs/core -- --testPathPattern "(schema-validator|unauthorized-args)" --ci` exits 0.
- [ ] CI: `pnpm tsc --noEmit` exits 0.
- [ ] Run the snyk/audit step: `pnpm audit --audit-level=high` to ensure `ajv` and `ajv-formats` introduce no high-severity vulnerabilities.
