# Task: Define ProjectServer Introspection Interfaces and TypeScript Types (Sub-Epic: 09_ProjectServer Introspection Tools)

## Covered Requirements
- [3_MCP-TAS-066], [3_MCP-TAS-074]

## 1. Initial Test Written
- [ ] Create `packages/mcp-server/src/projectserver/__tests__/introspection-types.test.ts`.
- [ ] Write unit tests that validate the shape of all exported TypeScript interfaces using `zod` schema parsing (or equivalent runtime validation):
  - `IntrospectionPoint` — must have fields: `id: string`, `label: string`, `location: { file: string; line: number }`, `kind: "state_snapshot" | "custom_event"`.
  - `FSResult` — must have `ok: boolean`, `data?: string | string[]`, `error?: string`, `bytesRead?: number`.
  - `EditResult` — must have `ok: boolean`, `appliedEdits: number`, `error?: string`.
  - `StructuredTestReport` — must have `passed: boolean`, `totalTests: number`, `failedTests: number`, `failures: Array<{ name: string; message: string; stackTrace: string; diff?: string }>`.
  - `ProjectServerManifest` — must have `version: string`, `projectId: string`, `introspectionPoints: IntrospectionPoint[]`.
- [ ] Write a test that verifies `ProjectServerManifest` is JSON-serialisable round-trip (serialize then parse equals original).
- [ ] Write a test verifying that an `IntrospectionPoint` with `kind` outside the allowed union is rejected by the schema validator at runtime.
- [ ] All tests must fail (RED) before any implementation code is written.

## 2. Task Implementation
- [ ] Create the directory `packages/mcp-server/src/projectserver/types/`.
- [ ] Create `packages/mcp-server/src/projectserver/types/introspection.ts`:
  - Export `IntrospectionPointKind` as `"state_snapshot" | "custom_event"` const union.
  - Export `IntrospectionPoint` TypeScript interface with fields: `id`, `label`, `location: { file: string; line: number }`, `kind: IntrospectionPointKind`.
  - Export `FSResult` interface with fields: `ok`, `data?`, `error?`, `bytesRead?`.
  - Export `EditResult` interface with fields: `ok`, `appliedEdits`, `error?`.
  - Export `StructuredTestReport` interface with nested `failures` array type.
  - Export `ProjectServerManifest` interface with fields: `version`, `projectId`, `introspectionPoints`.
- [ ] Create `packages/mcp-server/src/projectserver/types/schemas.ts`:
  - Use `zod` to define runtime schemas (`IntrospectionPointSchema`, `FSResultSchema`, `EditResultSchema`, `StructuredTestReportSchema`, `ProjectServerManifestSchema`) that mirror each interface exactly.
  - Export each schema.
- [ ] Create `packages/mcp-server/src/projectserver/types/index.ts` that re-exports all interfaces and schemas from the above two files.
- [ ] Do NOT implement any tool logic in this task — types and schemas only.

## 3. Code Review
- [ ] Verify that `IntrospectionPoint.kind` is a strict discriminated union, not a plain `string`.
- [ ] Verify `zod` schemas are 1:1 with TypeScript interfaces — no extra fields allowed (use `.strict()` on object schemas).
- [ ] Verify that `StructuredTestReport.failures` is typed as a readonly or standard array of objects with all required sub-fields.
- [ ] Verify no `any` types appear anywhere in the type files.
- [ ] Verify that `types/index.ts` exports everything needed by consumers without circular imports.
- [ ] Verify that the zod schemas can be used for both parse and safeParse patterns.

## 4. Run Automated Tests to Verify
- [ ] Run `pnpm --filter @devs/mcp-server test -- --testPathPattern="introspection-types"` and confirm all tests pass (GREEN).
- [ ] Run `pnpm --filter @devs/mcp-server tsc --noEmit` to confirm no TypeScript compilation errors.

## 5. Update Documentation
- [ ] Create `packages/mcp-server/src/projectserver/types/index.agent.md` describing:
  - Purpose of each interface.
  - Which MCP tools consume each type.
  - The zod schema usage pattern (parse vs safeParse).
  - Requirement traceability: `3_MCP-TAS-066`, `3_MCP-TAS-074`.
- [ ] Update `packages/mcp-server/README.md` (or create it if absent) with a "ProjectServer Type System" section linking to `index.agent.md`.

## 6. Automated Verification
- [ ] Run `pnpm --filter @devs/mcp-server test -- --ci --coverage --testPathPattern="introspection-types"` and assert exit code is `0`.
- [ ] Run `grep -r "IntrospectionPoint\|FSResult\|EditResult\|StructuredTestReport\|ProjectServerManifest" packages/mcp-server/src/projectserver/types/index.ts` and confirm all five names appear in the export surface.
