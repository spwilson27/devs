# Task: Implement Open-Standard MCP Spec Compliance Validator and Version Registry (Sub-Epic: 01_MCP Protocol Foundation & Standards)

## Covered Requirements
- [8_RISKS-REQ-055], [TAS-036], [TAS-014]

## 1. Initial Test Written
- [ ] In `packages/mcp/src/__tests__/spec_compliance.test.ts`, write unit tests that:
  - Import `McpSpecValidator` and `MCP_SPEC_VERSION` from `@devs/mcp/compliance`.
  - Assert that `McpSpecValidator.validateServerInfo({ name: 'test', version: '1.0.0' })` returns `{ valid: true, violations: [] }`.
  - Assert that `McpSpecValidator.validateServerInfo({ name: '', version: '1.0.0' })` returns `{ valid: false, violations: [{ field: 'name', message: expect.stringContaining('empty') }] }`.
  - Assert that `McpSpecValidator.validateToolCallRequest({ name: 'myTool', arguments: {} })` returns `{ valid: true }`.
  - Assert that `McpSpecValidator.validateToolCallRequest({ name: 'myTool', arguments: null })` returns `{ valid: false, violations: [{ field: 'arguments', message: expect.any(String) }] }`.
  - Assert that `McpSpecValidator.detectProprietaryExtensions({ name: 'myTool', description: 'x', inputSchema: { type: 'object', properties: {} }, _customField: 'bad' })` returns `{ hasExtensions: true, fields: ['_customField'] }`.
  - Assert that a tool definition with no extra fields returns `{ hasExtensions: false, fields: [] }`.
- [ ] In `packages/mcp/src/__tests__/version_registry.test.ts`, write tests that:
  - Assert `MCP_SPEC_VERSION` is a semver string matching `/^\d+\.\d+\.\d+$/`.
  - Assert that the `VersionRegistry` can record a compatibility entry and retrieve it.
  - Assert that `VersionRegistry.assertCompatible(sdkVersion)` does not throw when `sdkVersion` satisfies the pinned spec range, and throws `IncompatibleSdkVersionError` when it does not.

## 2. Task Implementation
- [ ] Create `packages/mcp/src/compliance/index.ts` as the compliance submodule barrel.
- [ ] Create `packages/mcp/src/compliance/spec_validator.ts` implementing `McpSpecValidator` as a static-method class:
  - `validateServerInfo(info: { name: string; version: string }): ValidationResult` — checks `name` is non-empty, `version` matches semver regex `^\\d+\\.\\d+\\.\\d+`.
  - `validateToolCallRequest(req: { name: string; arguments: unknown }): ValidationResult` — checks `name` is non-empty string, `arguments` is a plain object (not null, not array).
  - `validateToolCallResult(result: { content: unknown[]; isError?: boolean }): ValidationResult` — checks `content` is a non-empty array, each element has a `type` string field.
  - `detectProprietaryExtensions(obj: Record<string, unknown>): { hasExtensions: boolean; fields: string[] }` — identifies any keys not present in the official MCP spec's allowed field set for that object type (hardcode allowed sets as `const` arrays).
  - All methods return `ValidationResult = { valid: boolean; violations: { field: string; message: string }[] }`.
- [ ] Create `packages/mcp/src/compliance/version_registry.ts` implementing:
  - Export `MCP_SPEC_VERSION: string` — the MCP specification version this codebase targets (e.g., `"1.0.0"`). Must be updated manually when the MCP spec version changes, with a comment documenting where to find the spec changelog.
  - `VersionRegistry` class with:
    - `record(entry: { sdkVersion: string; specVersion: string; compatibleAt: Date }): void`
    - `assertCompatible(sdkVersion: string): void` — uses `semver.satisfies(sdkVersion, COMPATIBLE_SDK_RANGE)` (install `semver` package); throws `IncompatibleSdkVersionError` if not satisfied.
    - `getEntries(): CompatibilityEntry[]`
  - `IncompatibleSdkVersionError extends Error` with `sdkVersion: string` and `requiredRange: string` properties.
  - Export a `globalVersionRegistry = new VersionRegistry()`.
- [ ] In `packages/mcp/src/server.ts`, call `globalVersionRegistry.assertCompatible(MCP_SDK_VERSION)` during `McpServer` construction so any version incompatibility is caught at startup.
- [ ] Add `semver` and `@types/semver` to `packages/mcp/package.json` dependencies.
- [ ] Export all compliance symbols from `packages/mcp/src/index.ts`.

## 3. Code Review
- [ ] Confirm `detectProprietaryExtensions` uses an explicit allowlist of MCP-spec fields rather than a denylist, to future-proof against new official spec fields.
- [ ] Confirm `MCP_SPEC_VERSION` has a comment citing the MCP specification URL so future maintainers can verify the targeted spec version.
- [ ] Confirm `assertCompatible` is called exactly once per `McpServer` instantiation, not per request, to avoid performance overhead.
- [ ] Confirm `ValidationResult` type is exported and documented for use by downstream packages.
- [ ] Confirm no `any` types appear in `spec_validator.ts` — use `unknown` with proper narrowing.

## 4. Run Automated Tests to Verify
- [ ] Run `pnpm --filter @devs/mcp test -- --testPathPattern=compliance` and confirm all tests pass.
- [ ] Run `pnpm --filter @devs/mcp build` and confirm all compliance types are present in `dist/compliance/`.
- [ ] Instantiate a `McpServer` with the current pinned SDK version and confirm no `IncompatibleSdkVersionError` is thrown.

## 5. Update Documentation
- [ ] Add a "Spec Compliance" section to `packages/mcp/README.md` documenting:
  - `MCP_SPEC_VERSION` and how to update it when the spec changes.
  - How to use `McpSpecValidator` to validate inputs before forwarding to the SDK.
  - The policy: "Any tool definition with proprietary fields MUST be rejected before registration."
- [ ] Update `docs/agent_memory/phase_3.md` with: "Runtime spec compliance validation is enforced by `McpSpecValidator`. All inbound tool calls and outbound results MUST be validated. Any violation must be logged and the call rejected with a structured error response."

## 6. Automated Verification
- [ ] Run `pnpm --filter @devs/mcp test -- --coverage --testPathPattern=compliance` and assert branch coverage ≥ 90% for `src/compliance/spec_validator.ts`.
- [ ] Run a canary script that calls `McpSpecValidator.detectProprietaryExtensions({ name: 't', description: 'd', inputSchema: { type: 'object', properties: {} }, _bad: true })` and asserts `hasExtensions === true` and `fields` includes `'_bad'`. Exit 0 on pass.
- [ ] Run the full CI pipeline for `@devs/mcp` and assert exit code 0.
