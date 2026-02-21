# Task: Implement User Persona Generation Agent (Sub-Epic: 07_Market & User Research Domains)

## Covered Requirements
- [1_PRD-REQ-RES-003], [9_ROADMAP-REQ-RES-003]

## 1. Initial Test Written
- [ ] In `src/research/user/__tests__/personaAgent.test.ts`, write the following tests using `vitest` and mocked dependencies:
  - **Unit: `PersonaGenerationAgent.run(brief, marketReport)`**
    - Mock `LLMClient.complete()` to return a fixture JSON array of 3 `PersonaProfile` objects.
    - Assert the returned array has **at least 3** items.
    - Assert each item validates against `PersonaProfileSchema`.
    - Assert each persona has a unique `id` (no duplicates).
    - Assert each persona has `goals.length >= 1`, `painPoints.length >= 1`, `motivations.length >= 1`.
  - **Unit: persona diversity enforcement**
    - Mock LLM to return 3 personas all with `technicalLevel: 'expert'`.
    - Assert the agent emits a warning log (`console.warn` or logger) about lack of `technicalLevel` diversity, but still returns the result.
  - **Unit: minimum persona guard**
    - Mock LLM to return only 2 personas.
    - Assert the agent throws `InsufficientPersonaDataError` with `found: 2`, `required: 3`.
  - **Unit: malformed LLM JSON**
    - Mock LLM to return a plain string `"I cannot generate personas"`.
    - Assert the agent throws `PersonaParseError`.
  - **Integration**: Mock `LLMClient` at the HTTP level using `msw`. Provide a fixture Serper response and assert the agent correctly incorporates market report competitor data (targeting `CompetitorProfile.features`) into the persona `preferredChannels`.

## 2. Task Implementation
- [ ] Create `src/research/user/personaAgent.ts` exporting `PersonaGenerationAgent` class:
  - Constructor accepts `{ llmClient: LLMClient; minPersonas?: number }` (default `minPersonas = 3`).
  - `async run(brief: string, marketReport?: MarketResearchReport): Promise<PersonaProfile[]>` method:
    1. Builds a structured prompt from `prompts/personaGeneration.ts` incorporating:
       - The user brief.
       - If `marketReport` provided: competitor feature categories and pricing models (to ground personas in real market context).
       - Instruction to produce `minPersonas` distinct personas covering different `technicalLevel` values.
    2. Calls `llmClient.complete(prompt, { responseFormat: 'json' })`.
    3. Parses and validates each persona via `PersonaProfileSchema.parse()`.
    4. Checks uniqueness of persona `id` fields; deduplicates if needed.
    5. If validated count < `minPersonas`, throws `InsufficientPersonaDataError`.
    6. Logs a warning if all personas share the same `technicalLevel`.
    7. Returns `PersonaProfile[]`.
- [ ] Create `src/research/user/errors.ts` exporting `InsufficientPersonaDataError extends Error` (with `found` and `required` number fields) and `PersonaParseError extends Error` (with `rawResponse: string` field).
- [ ] Create `src/research/user/prompts/personaGeneration.ts` exporting `buildPersonaPrompt(brief: string, marketReport?: MarketResearchReport): string`.

## 3. Code Review
- [ ] Verify `PersonaGenerationAgent` depends on `LLMClient` only via the injected interface.
- [ ] Verify the LLM prompt explicitly requests JSON array format and specifies the required fields.
- [ ] Verify persona deduplication uses `id` field comparison (not reference equality).
- [ ] Verify `InsufficientPersonaDataError` message includes both `found` and `required` counts.
- [ ] Verify the diversity warning does not throw—it is advisory only.

## 4. Run Automated Tests to Verify
- [ ] Run `pnpm test src/research/user/__tests__/personaAgent.test.ts` and confirm all tests pass with 0 failures.
- [ ] Run `pnpm tsc --noEmit` and confirm zero TypeScript errors.

## 5. Update Documentation
- [ ] Update `src/research/user/user.agent.md` to add a section:
  - **PersonaGenerationAgent**: Inputs (brief string, optional `MarketResearchReport`), outputs (`PersonaProfile[]`), failure modes (`InsufficientPersonaDataError`, `PersonaParseError`).
  - Document prompt strategy: market-grounded persona generation for `preferredChannels`.
  - Document diversity advisory behavior (warning on homogeneous `technicalLevel`).

## 6. Automated Verification
- [ ] Run `pnpm test --coverage src/research/user/__tests__/personaAgent.test.ts` and assert branch coverage ≥ 90% for `personaAgent.ts`.
- [ ] Run `pnpm tsc --noEmit` and assert exit code 0.
