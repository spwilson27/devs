# Task: Implement Architecture-First Deep Research & TAS Phase Prominence (Sub-Epic: 30_Strategic Risk Mitigations)

## Covered Requirements
- [8_RISKS-REQ-135]

## 1. Initial Test Written
- [ ] In `src/research/__tests__/deep_research_phase.test.ts`, write unit tests covering:
  - `runDeepResearchPhase(prompt: UserPrompt, config: ResearchConfig): Promise<ResearchPackage>` — assert the returned `ResearchPackage` contains all 4 mandatory reports: `market_research`, `competitive_analysis`, `technology_landscape`, `user_research`; assert each report has `source_citations` (array, length ≥ 5 per `[9_ROADMAP-REQ-048]`).
  - `validateResearchPackage(pkg: ResearchPackage): ValidationResult` — assert `{ valid: false }` when any of the 4 reports is missing or has fewer than 5 citations; `{ valid: true }` otherwise.
  - `generateTasFromResearch(pkg: ResearchPackage, prd: PrdDocument): Promise<TasDocument>` — assert the returned TAS references at least 3 technology decisions that are each traceable to a citation in the research package.
  - Write an integration test: mock LLM responses for all 4 research report prompts; assert `runDeepResearchPhase` orchestrates exactly 4 LLM calls and assembles the package correctly.
  - Write an E2E test: run the research phase against a sample prompt fixture; assert the resulting `ResearchPackage` passes `validateResearchPackage`.

## 2. Task Implementation
- [ ] Create `src/research/deep_research_phase.ts` exporting:
  - `ResearchConfig` interface: `{ maxCitationsPerReport: number; researchDepth: 'shallow' | 'standard' | 'deep'; parallelism: number }`.
  - `ResearchPackage` type containing the 4 report fields plus `generated_at` timestamp.
  - `runDeepResearchPhase(prompt, config, llmClient)` — orchestrates 4 parallel LLM calls (one per report type) using `Promise.all`; each call uses a structured prompt with `<topic>`, `<depth>`, and `<citation_format>` delimiters per `[1_PRD-REQ-SEC-012]`; assembles and returns the `ResearchPackage`.
  - `validateResearchPackage(pkg)` — validates completeness and citation thresholds.
  - `generateTasFromResearch(pkg, prd, llmClient)` — produces a `TasDocument` using the research package as context; structured output via Zod schema `TasDocumentSchema`.
- [ ] Enforce the research phase as a mandatory, non-skippable first step in `src/orchestrator/pipeline.ts`: add a `RESEARCH` stage before `PRD_GENERATION`; gate the `PRD_GENERATION` stage on `validateResearchPackage` returning `{ valid: true }`.
- [ ] Create a dedicated `ResearchPhaseAgent` class in `src/agents/research_phase_agent.ts` responsible for running the deep research phase with retry logic (max 3 retries per report on LLM error).
- [ ] Add a `devs research --prompt "<text>"` CLI subcommand in `src/cli/commands/research.ts` that initiates the research phase and streams progress to stdout.
- [ ] Persist the `ResearchPackage` as JSON to `.devs/research/<timestamp>/package.json` for human review and auditability.

## 3. Code Review
- [ ] Confirm the 4 parallel LLM calls in `runDeepResearchPhase` are bounded by the `parallelism` config field (use a concurrency limiter, e.g., `p-limit`) to avoid rate-limit violations per `[TAS-026]`.
- [ ] Verify that each LLM prompt includes explicit `<citation_required>true</citation_required>` instructions and that post-processing validates citation count before accepting the report.
- [ ] Ensure the `ResearchPhaseAgent` implements exponential backoff on retries per `[TAS-026]`.
- [ ] Confirm `generateTasFromResearch` output is validated against `TasDocumentSchema` (Zod) before acceptance; malformed TAS must be retried or escalated.

## 4. Run Automated Tests to Verify
- [ ] Run `npm test -- --testPathPattern="deep_research_phase"` and confirm all tests pass.
- [ ] Run `npm test -- --testPathPattern="pipeline"` to confirm the RESEARCH stage integration tests pass.
- [ ] Run full suite `npm test`.

## 5. Update Documentation
- [ ] Add `docs/research_phase.md` describing:
  - The 4 research reports and their purpose.
  - Citation requirements and how they are validated.
  - The flow from research → PRD → TAS.
- [ ] Update `docs/architecture/pipeline.md` with the new `RESEARCH` stage in the pipeline diagram.
- [ ] Update `src/research/research.agent.md` with the `deep_research_phase.ts` API contracts.
- [ ] Add to `CHANGELOG.md` under `[Phase 14]`: "Implemented mandatory Architecture-First Deep Research Phase".

## 6. Automated Verification
- [ ] Run `npm run validate-all` and confirm exit code `0`.
- [ ] Execute `node scripts/verify_requirement_coverage.js --req 8_RISKS-REQ-135` and confirm `covered`.
- [ ] Run `devs research --prompt "test project"` in a temp directory and confirm `.devs/research/` contains a valid `package.json` with all 4 reports.
