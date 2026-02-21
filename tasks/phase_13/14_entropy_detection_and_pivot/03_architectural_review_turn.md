# Task: Glass-Box Architectural Review Turn on Loop Detection (Sub-Epic: 14_Entropy Detection and Pivot)

## Covered Requirements
- [3_MCP-TAS-019]

## 1. Initial Test Written
- [ ] Create `src/reliability/entropy/__tests__/ArchitecturalReviewOrchestrator.test.ts`.
- [ ] Mock `EntropyDetector` to control `isLooping()` return values.
- [ ] Write a unit test that, when `EntropyDetector.isLooping()` returns `false`, `ArchitecturalReviewOrchestrator.evaluateAndMaybeIntervene(observationPayload)` returns `{ intervened: false }` and does NOT call the LLM client.
- [ ] Write a unit test that, when `EntropyDetector.isLooping()` returns `true`, `evaluateAndMaybeIntervene` calls the injected LLM client's `sendArchitecturalReviewPrompt(failureSummaryContext)` exactly once and returns `{ intervened: true, reviewTurn: <LLM response> }`.
- [ ] Write a unit test verifying the failure summary context passed to the LLM prompt includes at minimum: `taskId`, `phaseId`, and `recentObservations` (last 3 payloads) fields.
- [ ] Write a unit test verifying that after an intervention, the `EntropyDetector` is reset so the loop counter starts fresh.
- [ ] Write an integration test using a stub LLM client that records the prompt and asserts the prompt text contains the phrase "summarize your failures" (matching the Glass-Box protocol spec in `specs/3_mcp_design.md`).

## 2. Task Implementation
- [ ] Create `src/reliability/entropy/ArchitecturalReviewOrchestrator.ts`.
- [ ] Define the `FailureSummaryContext` interface: `{ taskId: string; phaseId: string; recentObservations: string[] }`.
- [ ] Define the `InterventionResult` type: `{ intervened: false } | { intervened: true; reviewTurn: string }`.
- [ ] Define the `LlmArchitecturalReviewClient` interface with method `sendArchitecturalReviewPrompt(ctx: FailureSummaryContext): Promise<string>`.
- [ ] Implement `ArchitecturalReviewOrchestrator` class:
  - Constructor accepts `EntropyDetector`, `LlmArchitecturalReviewClient`, and a context provider `() => { taskId: string; phaseId: string }`.
  - `evaluateAndMaybeIntervene(observationPayload: string): Promise<InterventionResult>`:
    1. Calls `detector.recordObservation(observationPayload)`.
    2. If `detector.isLooping()` is `false`, returns `{ intervened: false }`.
    3. Builds `FailureSummaryContext` using the context provider and the last 3 raw observation payloads (store them separately from hashes).
    4. Calls `llmClient.sendArchitecturalReviewPrompt(ctx)` and awaits the result.
    5. Calls `detector.reset()`.
    6. Returns `{ intervened: true, reviewTurn: <LLM result> }`.
- [ ] Update `SaopHashTracker` to also expose `getRecentPayloads(): ReadonlyArray<string>` (storing raw payloads alongside hashes).
- [ ] Export all new types and the class from `src/reliability/entropy/index.ts`.

## 3. Code Review
- [ ] Confirm the LLM client is injected (never instantiated inside the orchestrator) — this enables unit testing without network calls.
- [ ] Confirm `detector.reset()` is always called after a successful intervention (no double-loop risk).
- [ ] Confirm raw observation payloads are stored separately from hashes (hashes are for comparison; raw text is for the LLM prompt context).
- [ ] Confirm `FailureSummaryContext` is a plain data object (no class instances) to remain serializable.
- [ ] Confirm the prompt includes `taskId`, `phaseId`, and `recentObservations` as per the interface contract.

## 4. Run Automated Tests to Verify
- [ ] Run `npm test -- --testPathPattern="ArchitecturalReviewOrchestrator"` and verify all tests pass.
- [ ] Run `npm run lint src/reliability/entropy/ArchitecturalReviewOrchestrator.ts` with zero errors.

## 5. Update Documentation
- [ ] Append to `src/reliability/entropy/entropy.agent.md` a section on `ArchitecturalReviewOrchestrator`: the Glass-Box intervention protocol, the `FailureSummaryContext` shape, and the reset-after-intervention lifecycle.
- [ ] Add a sequence diagram (Mermaid) to the agent.md file illustrating the `evaluateAndMaybeIntervene` flow: record → detect → (if looping) build context → call LLM → reset → return result.

## 6. Automated Verification
- [ ] Run `npm test -- --coverage --testPathPattern="ArchitecturalReviewOrchestrator"` and confirm 100% branch coverage.
- [ ] Run `grep "summarize your failures" src/reliability/entropy/ArchitecturalReviewOrchestrator.ts` to verify the Glass-Box review prompt wording is present in the implementation.
