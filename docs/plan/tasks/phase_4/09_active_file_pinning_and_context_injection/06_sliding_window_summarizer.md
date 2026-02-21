# Task: Implement Sliding Window Summarization for Context Saturation Mitigation (Sub-Epic: 09_Active_File_Pinning_and_Context_Injection)

## Covered Requirements
- [8_RISKS-REQ-111], [RISK-802], [8_RISKS-REQ-031]

## 1. Initial Test Written
- [ ] Create `packages/orchestrator/src/context/__tests__/SlidingWindowSummarizer.test.ts`.
- [ ] Write a unit test that `SlidingWindowSummarizer` is constructed with a mocked `FlashModelClient` (Gemini Flash) and a `windowSize: number` (number of recent turns to preserve verbatim, default `5`).
- [ ] Write a test that `summarize(turns: AgentTurn[]): Promise<SummarizationResult>`:
  - When `turns.length <= windowSize`, returns `{ summary: null, preserved: turns }` (no summarization needed).
  - When `turns.length > windowSize`, calls `flashModelClient.summarize(olderTurns)` with the turns older than the last `windowSize` entries, and returns `{ summary: string, preserved: recentTurns }`.
- [ ] Write a test that the summarization prompt sent to `FlashModelClient` contains the instruction: "Preserve all technical decisions, file paths, error messages, and architectural constraints. Omit conversational filler."
- [ ] Write a test that `SlidingWindowSummarizer` emits a `"summarization:complete"` event with payload `{ turnsCondensed: number, summaryTokenEstimate: number }` after each successful summarization.
- [ ] Write a test that if `flashModelClient.summarize` throws, `SlidingWindowSummarizer` catches the error, emits `"summarization:failed"` with the error, and returns `{ summary: null, preserved: turns }` (graceful degradation — all turns preserved unchanged).
- [ ] Write an integration test that verifies the orchestrator calls `slidingWindowSummarizer.summarize(turns)` when the turn count exceeds `windowSize`, and injects the `summary` string at the top of the next context payload as a `"<SUMMARY_OF_PRIOR_CONTEXT>"` block.

## 2. Task Implementation
- [ ] Create `packages/orchestrator/src/context/SlidingWindowSummarizer.ts`:
  - `AgentTurn`: `{ turnNumber: number; role: "user" | "assistant"; content: string; tokenCount: number }`.
  - `SummarizationResult`: `{ summary: string | null; preserved: AgentTurn[] }`.
  - `SlidingWindowSummarizerOptions`: `{ windowSize?: number; summaryPrompt?: string }`.
  - `class SlidingWindowSummarizer extends EventEmitter`:
    - Constructor: `(flashClient: FlashModelClient, options?: SlidingWindowSummarizerOptions)`.
    - `async summarize(turns: AgentTurn[]): Promise<SummarizationResult>`:
      1. If `turns.length <= windowSize`, return early with no summary.
      2. Split: `olderTurns = turns.slice(0, turns.length - windowSize)`, `recentTurns = turns.slice(-windowSize)`.
      3. Build summarization prompt with the preservation instruction.
      4. Await `flashClient.summarize(prompt)`.
      5. Emit `"summarization:complete"` with condensed count and estimate.
      6. Return `{ summary, preserved: recentTurns }`.
      7. On error: emit `"summarization:failed"`, return `{ summary: null, preserved: turns }`.
- [ ] Create `packages/orchestrator/src/context/FlashModelClient.ts`:
  - Interface `FlashModelClient`: `{ summarize(prompt: string): Promise<string> }`.
  - `GeminiFlashModelClient implements FlashModelClient`:
    - Uses `@google/generative-ai` SDK with model `"gemini-2.0-flash"`.
    - `summarize(prompt: string)` sends the prompt and returns the text response.
    - Throws `FlashSummarizationError` (custom error class) on non-2xx or empty response.
- [ ] In `packages/orchestrator/src/context/ContextRefreshService.ts`, add an optional `summarizer?: SlidingWindowSummarizer` constructor parameter.
  - In `buildContextPayload`, if `summarizer` is provided and the `turnHistory` array length exceeds the summarizer's `windowSize`, call `summarizer.summarize(turnHistory)` and prepend the `summary` to the payload as a `priorContextSummary: string | null` field.
- [ ] In `packages/orchestrator/src/Orchestrator.ts`, wire `SlidingWindowSummarizer` with the `GeminiFlashModelClient` and pass it to `ContextRefreshService`.
- [ ] Export from `packages/orchestrator/src/context/index.ts`.

## 3. Code Review
- [ ] Confirm the summarization call is **non-blocking to the turn execution** — it should be awaited before injecting context, but must not silently extend turn latency beyond an acceptable timeout (apply a `AbortSignal`/timeout of 30s).
- [ ] Confirm `GeminiFlashModelClient` sets `temperature: 0` and `maxOutputTokens: 4096` to ensure deterministic, concise summaries.
- [ ] Confirm that the preserved `recentTurns` are always injected **after** the summary in the context payload, never before, to maintain chronological coherence.
- [ ] Confirm graceful degradation: a failure in summarization must never prevent the orchestrator from proceeding with the next agent turn.
- [ ] Verify TypeScript strict mode: `pnpm tsc --noEmit` in `packages/orchestrator`.

## 4. Run Automated Tests to Verify
- [ ] Run `pnpm --filter @devs/orchestrator test -- --testPathPattern="SlidingWindowSummarizer"` and confirm all tests pass.
- [ ] Confirm ≥ 90% branch coverage on `SlidingWindowSummarizer.ts`.
- [ ] Run the integration test suite confirming context injection includes the `<SUMMARY_OF_PRIOR_CONTEXT>` block.

## 5. Update Documentation
- [ ] Create `packages/orchestrator/src/context/SlidingWindowSummarizer.agent.md`:
  - Document the `windowSize` parameter and what "preserved verbatim" means.
  - Document the summarization prompt template and rationale for the preservation instruction.
  - Document the two emitted events (`"summarization:complete"`, `"summarization:failed"`) and their payloads.
  - Document the graceful degradation contract.
- [ ] Update `packages/orchestrator/src/context/ContextRefreshService.agent.md` to describe the `priorContextSummary` field and when it is non-null.
- [ ] Update `packages/orchestrator/README.md` to include sliding-window summarization in the architecture diagram.

## 6. Automated Verification
- [ ] Execute `pnpm --filter @devs/orchestrator test --ci` and confirm exit code `0`.
- [ ] Run `node scripts/validate-sliding-window.js` — a script that runs the orchestrator in dry-run mode with 10 pre-seeded fixture turns, asserts that the agent prompt for turn 11 contains a `<SUMMARY_OF_PRIOR_CONTEXT>` block and exactly `windowSize` verbatim turns.
- [ ] Confirm `pnpm tsc --noEmit` exits `0`.
