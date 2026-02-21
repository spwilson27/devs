# Task: Implement Automated Onboarding Document Generation (onboarding.agent.md) (Sub-Epic: 30_Strategic Risk Mitigations)

## Covered Requirements
- [8_RISKS-REQ-136]

## 1. Initial Test Written
- [ ] In `src/documentation/__tests__/onboarding_generator.test.ts`, write unit tests covering:
  - `generateOnboardingDoc(projectContext: ProjectContext, llmClient): Promise<string>` — assert the returned Markdown contains all mandatory sections: `# Project Onboarding`, `## Architecture Overview`, `## Key Design Decisions`, `## Module Map`, `## Development Workflow`, `## Requirement Traceability Summary`, `## Glossary of Agent Concepts`.
  - `validateOnboardingDoc(content: string): ValidationResult` — assert `{ valid: false, missingFields: [...] }` when any mandatory section is absent; `{ valid: true }` otherwise.
  - `buildProjectContext(projectRoot: string, db): Promise<ProjectContext>` — assert the returned context contains: `projectName`, `techStack` (from TAS), `topLevelModules` (scanned from `src/`), `requirementCount`, `epicCount`, `taskCount`, and `keyDecisions` (from `saop_envelopes`).
  - Write an integration test: build context from a fixture project directory; call `generateOnboardingDoc` with a mock LLM; assert the resulting document passes `validateOnboardingDoc`.
  - Write an E2E test: run `generateOnboardingDoc` on the `devs` project itself; assert `onboarding.agent.md` is written to the project root and passes validation.

## 2. Task Implementation
- [ ] Create `src/documentation/onboarding_generator.ts` exporting:
  - `ProjectContext` interface: `{ projectName: string; techStack: string[]; topLevelModules: ModuleSummary[]; requirementCount: number; epicCount: number; taskCount: number; keyDecisions: DecisionEntry[]; traceabilityReportPath: string }`.
  - `buildProjectContext(projectRoot, db)` — aggregates data from: `src/` directory scan (module names + purposes from `.agent.md` files), SQLite counts, TAS document, and top-5 SAOP envelope decisions by frequency.
  - `generateOnboardingDoc(context, llmClient)` — renders a structured prompt with the `ProjectContext` as context; uses XML delimiters per `[1_PRD-REQ-SEC-012]`; validates LLM output with `validateOnboardingDoc`; retries once on validation failure with an explicit correction prompt; writes the final document to `<projectRoot>/onboarding.agent.md`.
  - `validateOnboardingDoc(content)` — regex-checks for all 7 mandatory H2 sections.
- [ ] Hook `generateOnboardingDoc` into the pipeline in `src/orchestrator/task_runner.ts`: call it at the end of every Phase completion (after all tasks in a phase are `DONE`) to refresh `onboarding.agent.md` with the latest architecture state.
- [ ] Add a `devs docs --onboarding` CLI subcommand in `src/cli/commands/docs.ts` that calls `buildProjectContext` and `generateOnboardingDoc` on demand and prints the output path.
- [ ] Include a `## Module Map` section generated from `scanMissingAgentMd` output (from Task 02) — list all modules with a one-line summary sourced from their `.agent.md` `## Purpose` section.

## 3. Code Review
- [ ] Verify that `buildProjectContext` does not hardcode any module names — it must dynamically scan `src/` and read from `.agent.md` files.
- [ ] Confirm the LLM correction prompt on validation failure includes the `missingFields` list from `validateOnboardingDoc` so the model knows exactly what to add.
- [ ] Ensure `generateOnboardingDoc` creates a backup of the existing `onboarding.agent.md` (as `onboarding.agent.md.bak`) before overwriting, in case of LLM failure mid-write.
- [ ] Confirm the `## Requirement Traceability Summary` section links to `docs/traceability_report.md` (from Task 05) rather than duplicating data.

## 4. Run Automated Tests to Verify
- [ ] Run `npm test -- --testPathPattern="onboarding_generator"` and confirm all tests pass.
- [ ] Run `npm test -- --testPathPattern="task_runner"` to confirm the Phase completion hook tests pass.
- [ ] Run full suite `npm test`.

## 5. Update Documentation
- [ ] Add `docs/onboarding_standard.md` describing:
  - The 7 mandatory sections of `onboarding.agent.md` with annotated examples.
  - When the file is automatically regenerated (end of each Phase).
  - How to manually regenerate: `devs docs --onboarding`.
- [ ] Update `docs/cli.md` with the `devs docs --onboarding` subcommand reference.
- [ ] Update `src/documentation/documentation.agent.md` with the `onboarding_generator.ts` API.
- [ ] Add to `CHANGELOG.md` under `[Phase 14]`: "Implemented automated onboarding.agent.md generation to mitigate Agentic Debt risk".

## 6. Automated Verification
- [ ] Run `npm run validate-all` and confirm exit code `0`.
- [ ] Execute `node scripts/verify_requirement_coverage.js --req 8_RISKS-REQ-136` and confirm `covered`.
- [ ] Run `devs docs --onboarding` in the `devs` project root; confirm `onboarding.agent.md` is created/updated and that `validateOnboardingDoc` reports `{ valid: true }` for the generated file.
