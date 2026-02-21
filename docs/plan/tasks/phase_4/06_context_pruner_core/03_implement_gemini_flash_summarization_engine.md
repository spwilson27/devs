# Task: Implement Gemini Flash Summarization Engine for Context Pruning (Sub-Epic: 06_Context_Pruner_Core)

## Covered Requirements
- [9_ROADMAP-TAS-105], [9_ROADMAP-REQ-SYS-001]

## 1. Initial Test Written

- [ ] Create `packages/memory/src/context-pruner/__tests__/flash-summarizer.test.ts`.
  - Mock the Gemini SDK client (`@google/generative-ai` or `@devs/llm`) so no real API calls are made.
  - Write a unit test for `FlashSummarizer.summarize(turns: ConversationTurn[], taskContext: string): Promise<string>`:
    - Assert that the mock LLM client is called exactly once.
    - Assert that the constructed prompt contains the serialized `turns` content.
    - Assert that the constructed prompt contains the `taskContext` string.
    - Assert that the returned string equals the mocked model response text.
  - Write a unit test verifying that when the LLM client throws (e.g., network error), `summarize` throws a `SummarizationError` with `cause` set to the original error.
  - Write a unit test verifying that the prompt instructs the model to: preserve the active Plan, the most recent failing Observation, and key decisions — matching [9_ROADMAP-REQ-SYS-001].
  - Write a unit test for `FlashSummarizer.buildPrompt(turns, taskContext)` as a pure function: assert it returns a string containing the role, content, and task context and contains the required system instructions.

## 2. Task Implementation

- [ ] Create `packages/memory/src/context-pruner/errors.ts`:
  ```typescript
  export class SummarizationError extends Error {
    constructor(message: string, public readonly cause?: unknown) {
      super(message);
      this.name = 'SummarizationError';
    }
  }
  ```
- [ ] Create `packages/memory/src/context-pruner/flash-summarizer.ts`:
  - Define and export `FlashSummarizerConfig`:
    ```typescript
    export interface FlashSummarizerConfig {
      model: string;        // e.g. 'gemini-3-flash'
      maxOutputTokens: number; // default: 4096
      temperature: number;     // default: 0.1 (deterministic summaries)
    }
    ```
  - Export class `FlashSummarizer`:
    - Constructor accepts a `llmClient: LLMClient` (interface from `@devs/llm`) and `config: FlashSummarizerConfig`.
    - `buildPrompt(turns: ConversationTurn[], taskContext: string): string` — static or instance method:
      - Serializes turns to a readable transcript format: `[ROLE]: content\n`.
      - Prepends a system instruction block:
        ```
        You are a context compression assistant. Summarize the following conversation turns
        into a concise technical summary. You MUST preserve:
        1. The current active Plan and task goal.
        2. The most recent failing Observation or error.
        3. Key architectural decisions made.
        4. Any constraints or requirements identified.
        Omit routine tool calls and redundant reasoning. Output plain text only.
        ```
      - Appends `\n\n## Active Task Context\n${taskContext}` at the end.
    - `async summarize(turns: ConversationTurn[], taskContext: string): Promise<string>`:
      - Calls `buildPrompt`, sends to `llmClient.generate({ model, prompt, maxOutputTokens, temperature })`.
      - Wraps any thrown error in `SummarizationError`.
      - Returns the trimmed text response.
- [ ] Define `LLMClient` interface in `packages/llm/src/types.ts` (or reuse existing) with at minimum:
  ```typescript
  export interface LLMClient {
    generate(options: GenerateOptions): Promise<GenerateResult>;
  }
  export interface GenerateOptions {
    model: string;
    prompt: string;
    maxOutputTokens?: number;
    temperature?: number;
  }
  export interface GenerateResult {
    text: string;
    usageMetadata?: { totalTokenCount: number };
  }
  ```
- [ ] Export `FlashSummarizer`, `FlashSummarizerConfig`, and `SummarizationError` from `packages/memory/src/context-pruner/index.ts`.

## 3. Code Review

- [ ] Verify the system prompt explicitly instructs the Flash model to preserve: active Plan, recent failing Observation, key architectural decisions — satisfying [9_ROADMAP-REQ-SYS-001].
- [ ] Verify the `FlashSummarizer` depends on the `LLMClient` interface (not a concrete implementation) to keep the module testable and model-agnostic.
- [ ] Confirm `buildPrompt` is a pure function with no side effects.
- [ ] Verify `SummarizationError` wraps the original cause for debuggability.
- [ ] Confirm `temperature: 0.1` is used as the default to ensure deterministic, non-creative summaries.
- [ ] Verify the Flash model identifier `'gemini-3-flash'` is configurable and not hardcoded in the summarize method body.

## 4. Run Automated Tests to Verify

- [ ] Run `pnpm --filter @devs/memory test -- --testPathPattern=flash-summarizer` and confirm all tests pass.
- [ ] Run `pnpm tsc --noEmit` in both `packages/memory/` and `packages/llm/` with no errors.

## 5. Update Documentation

- [ ] Update `packages/memory/README.md` with a `### FlashSummarizer` section: describe the class API, the LLMClient interface dependency, the prompt structure, and the default config values.
- [ ] Append to `.devs/memory/phase_4_decisions.md`: _"FlashSummarizer uses Gemini 3 Flash ([9_ROADMAP-TAS-105]) at temperature=0.1 to produce deterministic context summaries. Prompt preserves Plan, recent Observation, and key decisions ([9_ROADMAP-REQ-SYS-001]). Depends on LLMClient interface for testability."_

## 6. Automated Verification

- [ ] Run `pnpm --filter @devs/memory test --reporter=json > /tmp/flash-summarizer-results.json` and assert exit code `0`.
- [ ] Confirm `/tmp/flash-summarizer-results.json` has `"numFailedTests": 0`.
- [ ] Run `grep -r "gemini-3-flash" packages/memory/src/context-pruner/flash-summarizer.ts` and confirm the model name only appears in the `FlashSummarizerConfig` default — not hardcoded in the `summarize` method body.
