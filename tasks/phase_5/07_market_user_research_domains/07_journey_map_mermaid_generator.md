# Task: Implement User Journey Map Agent & Mermaid Sequence Diagram Generator (Sub-Epic: 07_Market & User Research Domains)

## Covered Requirements
- [1_PRD-REQ-RES-003], [9_ROADMAP-REQ-RES-003]

## 1. Initial Test Written
- [ ] In `src/research/user/__tests__/journeyAgent.test.ts`, write the following tests:
  - **Unit: `JourneyMapAgent.run(personas, brief)`**
    - Mock `LLMClient.complete()` to return a fixture JSON array of 3 `UserJourney` objects (one per persona).
    - Assert the returned `UserJourney[]` has at least 1 item.
    - Assert each `UserJourney` validates against `UserJourneySchema`.
    - Assert each journey's `personaId` corresponds to one of the provided persona `id` values.
    - Assert each journey has `steps.length >= 2`.
  - **Unit: orphaned persona guard**
    - Provide 3 personas but mock LLM to return journeys only for 1 persona.
    - Assert the agent logs a warning for the 2 uncovered personas.
  - **Unit: `renderJourneyMermaid(journey)`**
    - Provide a fixture `UserJourney` with 4 steps.
    - Assert the returned string begins with ` ```mermaid` and ends with ` ``` `.
    - Assert the string contains `sequenceDiagram`.
    - Assert each step's `action` appears in the output.
    - Assert `actor` labels include `User` and `System` (or the journey's `touchpoint` value).
  - **Unit: emotion emoji mapping in diagram**
    - Steps with `emotion: 'positive'` should include a `Note` with `😊` or a `+` indicator.
    - Steps with `emotion: 'negative'` should include a `Note` with `😟` or a `-` indicator.
    - Steps with `emotion: 'neutral'` should include no emotion note, or a `😐` indicator.
  - **Unit: Mermaid special character escaping**
    - Provide a step `action` containing `"` and `:` characters.
    - Assert the output does not contain unescaped `"` or `:` inside Mermaid arrow labels (use `#quot;` and `#colon;` escaping).

## 2. Task Implementation
- [ ] Create `src/research/user/journeyAgent.ts` exporting:
  - `JourneyMapAgent` class with constructor `{ llmClient: LLMClient }` and method `async run(personas: PersonaProfile[], brief: string): Promise<UserJourney[]>`:
    1. Builds a prompt from `prompts/journeyGeneration.ts` instructing the LLM to produce one core user journey per persona, capturing: `scenario`, `steps` (min 4 for richness), `touchpoint` per step.
    2. Calls `llmClient.complete(prompt, { responseFormat: 'json' })`.
    3. Validates each journey via `UserJourneySchema.parse()`.
    4. Checks that each journey's `personaId` maps to a provided persona; logs a warning for unmatched persona IDs.
    5. Returns validated `UserJourney[]`.
  - `renderJourneyMermaid(journey: UserJourney): string` — pure function producing a fenced Mermaid `sequenceDiagram` block:
    - Participants: `User`, `System`, and each unique `touchpoint` value from steps.
    - Each step becomes a `User->>System: <action>` arrow.
    - Append a `Note over User: <emoji>` per step based on `emotion`.
    - Escape `"` as `#quot;` and `:` as `#colon;` in all label strings.
    - Returns a string starting with ` ```mermaid\nsequenceDiagram\n` and ending with ` ``` `.
- [ ] Create `src/research/user/prompts/journeyGeneration.ts` exporting `buildJourneyPrompt(personas: PersonaProfile[], brief: string): string`.

## 3. Code Review
- [ ] Verify `renderJourneyMermaid` is a pure function with no I/O or side effects.
- [ ] Verify all Mermaid label strings are escaped for `"` and `:` before insertion.
- [ ] Verify the agent logs (not throws) when a persona has no corresponding journey.
- [ ] Verify the prompt instructs the LLM to match `personaId` to the provided persona IDs (not generate new ones).
- [ ] Verify the emotion-to-emoji mapping is defined in a constant object (e.g., `EMOTION_EMOJI`) for easy maintenance.

## 4. Run Automated Tests to Verify
- [ ] Run `pnpm test src/research/user/__tests__/journeyAgent.test.ts` and confirm all tests pass with 0 failures.
- [ ] Run `pnpm tsc --noEmit` and confirm zero TypeScript errors.

## 5. Update Documentation
- [ ] Update `src/research/user/user.agent.md` to add a section:
  - **JourneyMapAgent**: Inputs (`PersonaProfile[]`, brief), outputs (`UserJourney[]`), advisory behavior on uncovered personas.
  - **renderJourneyMermaid**: Inputs (`UserJourney`), output (fenced Mermaid `sequenceDiagram`), escaping rules, emotion-to-emoji mapping table.
  - Include a small example Mermaid output block.

## 6. Automated Verification
- [ ] Run `pnpm test --coverage src/research/user/__tests__/journeyAgent.test.ts` and assert line coverage ≥ 90% for `journeyAgent.ts`.
- [ ] Run `pnpm tsc --noEmit` and assert exit code 0.
- [ ] Run a smoke test script `scripts/smoke-journey.ts` that calls `renderJourneyMermaid` with a fixture journey and asserts the output string contains `sequenceDiagram` — exit code 0 on success.
