# Task: Implement Agent-Oriented Documentation (AOD) Generation per Module (Sub-Epic: 30_Strategic Risk Mitigations)

## Covered Requirements
- [8_RISKS-REQ-133]

## 1. Initial Test Written
- [ ] In `src/documentation/__tests__/aod_generator.test.ts`, write unit tests covering:
  - `generateAgentMd(modulePath: string, moduleContext: ModuleContext): Promise<string>` — assert the returned markdown string contains required sections: `# Module: <name>`, `## Purpose`, `## Public API`, `## Design Decisions`, `## Requirement Traceability`, `## Known Limitations`.
  - `validateAgentMd(content: string): ValidationResult` — assert that missing mandatory sections return `{ valid: false, missingFields: [...] }` and a fully populated file returns `{ valid: true }`.
  - `scanMissingAgentMd(projectRoot: string): Promise<string[]>` — given a mock filesystem with 3 source modules where 1 is missing `.agent.md`, assert the function returns exactly that 1 path.
  - Write an integration test that invokes `generateAgentMd` against a real sample module in `fixtures/sample_module/` and verifies the output file is written to `fixtures/sample_module/sample_module.agent.md`.

## 2. Task Implementation
- [ ] Create `src/documentation/aod_generator.ts` exporting:
  - `ModuleContext` interface: `{ name: string; purpose: string; publicApi: ApiEntry[]; designDecisions: string[]; requirements: string[]; limitations: string[] }`.
  - `generateAgentMd(modulePath, context, llmClient?)` — renders a deterministic Markdown template from `context`; if `llmClient` is provided, uses it to enrich the `## Purpose` and `## Design Decisions` sections via a structured prompt; writes the file to `<modulePath>/<moduleName>.agent.md`.
  - `validateAgentMd(content)` — checks for the presence of all 6 mandatory H2 sections using a regex-based parser.
  - `scanMissingAgentMd(projectRoot)` — walks `src/**/*.ts` files, groups by directory, and returns directories that lack a `.agent.md` file.
- [ ] Add a `devs docs --generate-aod` CLI subcommand in `src/cli/commands/docs.ts` that:
  1. Calls `scanMissingAgentMd(process.cwd())` to find modules lacking docs.
  2. For each missing module, calls `generateAgentMd` using the LLM client to produce content.
  3. Reports a summary table: `Module | Status (generated | skipped | failed)`.
- [ ] Integrate AOD validation into the existing CI gate in `src/orchestrator/task_runner.ts`: after the `Code Review` agent step, call `validateAgentMd` on the module under development and fail the task if the result is `{ valid: false }`.
- [ ] Create a Zod schema `AgentMdSchema` in `src/documentation/schemas.ts` for structured LLM output validation when auto-generating `.agent.md` content.

## 3. Code Review
- [ ] Verify that `generateAgentMd` does not overwrite an existing `.agent.md` without an explicit `--force` flag to prevent data loss.
- [ ] Confirm the LLM prompt used in `generateAgentMd` uses structured output delimiters (`<purpose>`, `<decisions>`) to prevent prompt injection per `[1_PRD-REQ-SEC-012]`.
- [ ] Ensure `scanMissingAgentMd` respects `.gitignore` and `node_modules/` — use the existing `glob` utility from `src/fs/glob.ts`.
- [ ] Confirm TypeScript strict mode passes; `ModuleContext` must have no optional fields that could produce incomplete documentation.

## 4. Run Automated Tests to Verify
- [ ] Run `npm test -- --testPathPattern="aod_generator"` and confirm all tests pass.
- [ ] Run `npm test -- --testPathPattern="docs"` to verify CLI subcommand tests pass.
- [ ] Run `npm test` for full suite regression check.

## 5. Update Documentation
- [ ] Create `docs/aod_standard.md` documenting:
  - The 6 mandatory sections of a `.agent.md` file with examples.
  - How to run `devs docs --generate-aod` to auto-generate missing docs.
  - The CI gate behavior that blocks task completion on missing/invalid AOD.
- [ ] Update `docs/cli.md` with the `devs docs --generate-aod` subcommand reference.
- [ ] Add to `CHANGELOG.md` under `[Phase 14]`: "Added AOD generation and validation (`devs docs --generate-aod`)".

## 6. Automated Verification
- [ ] Run `npm run validate-all` and confirm exit code `0`.
- [ ] Execute `node scripts/verify_requirement_coverage.js --req 8_RISKS-REQ-133` and confirm `covered`.
- [ ] Run `devs docs --generate-aod` against the `devs` project itself and confirm all modules in `src/` have a valid `.agent.md`; zero missing files reported.
