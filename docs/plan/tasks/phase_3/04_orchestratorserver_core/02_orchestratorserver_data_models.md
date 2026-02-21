# Task: OrchestratorServer TypeScript Data Models & Zod Schemas (Sub-Epic: 04_OrchestratorServer Core)

## Covered Requirements
- [3_MCP-TAS-078]

## 1. Initial Test Written
- [ ] In `packages/mcp/src/__tests__/models.test.ts`, write tests that:
  - Import `ProjectContext`, `RequirementStatus`, `ActiveEpic`, `AgentMemory`, `OrchestratorState` types/schemas from `@devs/mcp/models`.
  - Use the corresponding Zod schemas (`ProjectContextSchema`, `OrchestratorStateSchema`, etc.) to validate well-formed objects and assert `schema.safeParse(valid).success === true`.
  - Assert invalid objects (missing required fields, wrong enum values for `RequirementStatus`, negative `progress`) fail parsing with `.success === false` and contain descriptive `error.issues`.
  - Specifically test:
    - `RequirementStatus` is strictly `"pending" | "met" | "failed"` — no other string passes.
    - `ActiveEpic.progress` must be `0–100` (inclusive) — `101` and `-1` both fail.
    - `ProjectContext.requirements` is a non-empty array of `{ id: string; status: RequirementStatus; doc_link: string }`.
    - `AgentMemory` has `shortTerm`, `mediumTerm`, `longTerm` fields, each with their sub-schemas validated.
    - `OrchestratorState` contains `projectContext`, `agentMemory`, `activeTaskId` (nullable string), and `phase` (string).
- [ ] Confirm all tests fail (red) before implementation.

## 2. Task Implementation
- [ ] Create `packages/mcp/src/models.ts` containing the following TypeScript interfaces and Zod schemas:

  ```typescript
  // RequirementStatus
  export const RequirementStatusSchema = z.enum(["pending", "met", "failed"]);
  export type RequirementStatus = z.infer<typeof RequirementStatusSchema>;

  // ActiveEpic
  export const ActiveEpicSchema = z.object({
    id: z.string().min(1),
    title: z.string().min(1),
    progress: z.number().int().min(0).max(100),
  });
  export type ActiveEpic = z.infer<typeof ActiveEpicSchema>;

  // RequirementEntry
  export const RequirementEntrySchema = z.object({
    id: z.string().min(1),
    status: RequirementStatusSchema,
    doc_link: z.string().url(),
  });
  export type RequirementEntry = z.infer<typeof RequirementEntrySchema>;

  // ProjectContext (per 3_MCP-TAS-078 TypeScript interface)
  export const ProjectContextSchema = z.object({
    requirements: z.array(RequirementEntrySchema).min(1),
    active_epic: ActiveEpicSchema,
  });
  export type ProjectContext = z.infer<typeof ProjectContextSchema>;

  // AgentMemory tiers
  export const AgentMemorySchema = z.object({
    shortTerm: z.record(z.string(), z.unknown()),   // active task context
    mediumTerm: z.record(z.string(), z.unknown()),  // epic-level decisions
    longTerm: z.record(z.string(), z.unknown()),    // project-wide constraints
  });
  export type AgentMemory = z.infer<typeof AgentMemorySchema>;

  // OrchestratorState — top-level server state object
  export const OrchestratorStateSchema = z.object({
    projectContext: ProjectContextSchema,
    agentMemory: AgentMemorySchema,
    activeTaskId: z.string().nullable(),
    phase: z.string().min(1),
  });
  export type OrchestratorState = z.infer<typeof OrchestratorStateSchema>;
  ```

- [ ] Export all schemas and types from `packages/mcp/src/index.ts`.
- [ ] Add a `createInitialOrchestratorState(): OrchestratorState` helper that returns a valid empty/default state (empty requirements array replaced by a sentinel entry, phase `"uninitialized"`, `activeTaskId: null`, all memory tiers as `{}`). This is the default state injected at server startup.

## 3. Code Review
- [ ] Confirm all Zod schemas are derived from `z.object(...)` — no `z.any()` or `z.unknown()` at the top level of schemas that represent domain entities.
- [ ] Verify `RequirementStatus` uses `z.enum(...)` (not `z.string()`) to enforce the closed set.
- [ ] Confirm `ActiveEpic.progress` uses `.int().min(0).max(100)` — boundary checked with integer constraint.
- [ ] Confirm `AgentMemory` memory tiers use `z.record(z.string(), z.unknown())` (open-ended values are expected) but are NOT typed as `any`.
- [ ] Verify `OrchestratorState` models are exported both as TypeScript types AND Zod schemas so consumers can use runtime validation.

## 4. Run Automated Tests to Verify
- [ ] Run `pnpm --filter @devs/mcp test` and confirm all model tests pass.
- [ ] Run `pnpm --filter @devs/mcp build` and confirm no TypeScript errors.
- [ ] Spot-check generated `.d.ts` declarations in `dist/models.d.ts` to ensure `ProjectContext`, `OrchestratorState` types are exported correctly.

## 5. Update Documentation
- [ ] Add a `## Data Models` section to `packages/mcp/README.md` that lists all exported schemas/types and their fields with types and constraints (port from the code comments).
- [ ] Update `docs/agent-memory/phase_3.md` to note: "OrchestratorServer data models (`ProjectContext`, `OrchestratorState`, `AgentMemory`) are defined in `@devs/mcp/models` using Zod schemas for runtime validation. `RequirementStatus` is a closed enum."
- [ ] If a project-wide data dictionary exists (`docs/data-dictionary.md`), add entries for `ProjectContext`, `RequirementEntry`, `ActiveEpic`, `OrchestratorState`.

## 6. Automated Verification
- [ ] Run `pnpm --filter @devs/mcp test --reporter=json > /tmp/mcp-models-test-results.json` and confirm exit code `0`.
- [ ] Run `cat /tmp/mcp-models-test-results.json | jq '[.testResults[].assertionResults[] | select(.status != "passed")] | length'` — must output `0`.
- [ ] Run `node -e "const {OrchestratorStateSchema} = require('./packages/mcp/dist/models'); const r = OrchestratorStateSchema.safeParse({}); console.assert(!r.success, 'empty object must fail'); console.log('model validation guard: OK');"` — must print `model validation guard: OK`.
