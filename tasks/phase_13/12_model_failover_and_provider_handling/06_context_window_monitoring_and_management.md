# Task: Context Window Monitoring and Exhaustion Management (Sub-Epic: 12_Model Failover and Provider Handling)

## Covered Requirements
- [RISK-802]

## 1. Initial Test Written
- [ ] In `src/llm/__tests__/ContextWindowManager.test.ts`, write unit tests covering:
  - `ContextWindowManager.estimateTokenCount(messages)` returns an integer approximate token count using the `tiktoken` library (cl100k_base encoding) for a given `ChatMessage[]` array.
  - `isApproachingLimit(messages, model)` returns `false` when token count is below 80% of the model's context limit.
  - `isApproachingLimit(messages, model)` returns `true` when token count exceeds 80% of the model's context limit.
  - `isAtLimit(messages, model)` returns `true` when token count exceeds 95% of the model's context limit.
  - `MODEL_CONTEXT_LIMITS` map contains correct limits: `{ 'gemini-3-pro': 1_000_000, 'claude-3.5-sonnet': 200_000, 'gpt-4o': 128_000 }`.
  - `pruneMessages(messages, model, targetRatio)` returns a new array with oldest non-system messages removed until token count is below `targetRatio * contextLimit`, while always preserving the system prompt (first message) and the last user message.
  - `summarizeAndCompress(messages, summaryFn)` calls `summaryFn` with the messages to compress and returns a new array: `[systemMessage, summaryAssistantMessage, lastUserMessage]` where `summaryAssistantMessage.content` is the result of `summaryFn`.
- [ ] In `src/llm/__tests__/ContextWindowManager.integration.test.ts`, generate a synthetic `ChatMessage[]` array of 500 turns totaling >900k tokens (via repeated mock content) and assert that `pruneMessages` brings it under the 80% threshold for `'gemini-3-pro'`.

## 2. Task Implementation
- [ ] Create `src/llm/ContextWindowManager.ts`:
  - Export `MODEL_CONTEXT_LIMITS: Record<string, number>` constant.
  - Export `WARN_THRESHOLD_RATIO = 0.80` and `HARD_LIMIT_RATIO = 0.95` constants.
  - Implement `estimateTokenCount(messages: ChatMessage[]): number` using `tiktoken` (`cl100k_base` encoding, counting role + content text for each message).
  - Implement `isApproachingLimit(messages: ChatMessage[], model: string): boolean`.
  - Implement `isAtLimit(messages: ChatMessage[], model: string): boolean`.
  - Implement `pruneMessages(messages: ChatMessage[], model: string, targetRatio?: number): ChatMessage[]`:
    - Default `targetRatio = WARN_THRESHOLD_RATIO`.
    - Never removes index 0 (system prompt) or the final message.
    - Removes messages from index 1 upward (oldest first) until under threshold.
  - Implement `summarizeAndCompress(messages: ChatMessage[], summaryFn: (msgs: ChatMessage[]) => Promise<string>): Promise<ChatMessage[]>`.
- [ ] Update `src/llm/LLMClient.ts` (`chat` method):
  - Before each provider call in `FailoverManager.executeWithFailover`: call `isApproachingLimit(request.messages, provider.name)`.
  - If approaching (80–95%): call `pruneMessages` and log a `WARN` event `{ event: 'context_window_approaching', tokenCount, limit }`.
  - If at limit (>95%): call `summarizeAndCompress` using an internal summarization call to the current provider, then retry the original request with the compressed messages. Emit a `'context:compressed'` event on `LLMClient` with `{ originalTokenCount, compressedTokenCount }`.
  - If even after compression the token count is still at limit (edge case with giant single messages): throw `ContextWindowExhaustedError` with `{ tokenCount, limit, model }`.
- [ ] Install `tiktoken` as a production dependency: `npm install tiktoken`.
- [ ] Create `src/llm/errors.ts` addition: export `ContextWindowExhaustedError extends Error` with `tokenCount`, `limit`, `model` properties.

## 3. Code Review
- [ ] Verify that `pruneMessages` never returns an empty array or an array missing the system prompt — add a guard that throws `InvariantError` if the invariant would be violated.
- [ ] Confirm that `summarizeAndCompress` is only called once per request (no infinite recursion): the summarization call itself must bypass context window checks (add a `skipContextCheck: boolean` flag to `LLMRequest`).
- [ ] Ensure `estimateTokenCount` gracefully handles non-text message content (e.g., future image content) by falling back to `Math.ceil(JSON.stringify(content).length / 4)`.
- [ ] Validate that `MODEL_CONTEXT_LIMITS` is sourced from the same constants used by `ProviderRegistry` (no duplication).
- [ ] Check that `'context:compressed'` event payload includes enough data for the audit log.

## 4. Run Automated Tests to Verify
- [ ] Run `npm test -- --testPathPattern="src/llm/__tests__/ContextWindowManager"` and confirm all tests pass.
- [ ] Run `npm run lint -- src/llm/` with 0 errors.
- [ ] Run `npm run typecheck` with 0 errors.
- [ ] Run `npm audit` and confirm no new vulnerabilities from `tiktoken`.

## 5. Update Documentation
- [ ] Update `docs/architecture/llm-providers.md` with a "Context Window Management" section documenting:
  - Token estimation method and encoding.
  - Warn (80%) and hard (95%) thresholds and what each triggers.
  - The summarize-and-compress flow with a Mermaid sequence diagram.
  - The `ContextWindowExhaustedError` and when it is thrown.
- [ ] Add changelog entry: `feat(llm): add ContextWindowManager with token estimation, pruning, and summarize-and-compress for RISK-802`.

## 6. Automated Verification
- [ ] Run `npm test -- --coverage --testPathPattern="src/llm/__tests__/ContextWindowManager" --coverageThreshold='{"global":{"branches":85,"lines":90}}'` and confirm thresholds are met.
- [ ] Run the integration test `npm test -- --testPathPattern="ContextWindowManager.integration"` with a synthetic 900k-token conversation and assert the pruned output passes `isApproachingLimit` check returning `false`.
- [ ] Add a CI step in `.github/workflows/ci.yml` under the `test` job: `- name: Context Window Exhaustion Guard` running `npm test -- --testPathPattern="ContextWindowManager" --forceExit` to ensure this mitigation is always verified on every PR.
