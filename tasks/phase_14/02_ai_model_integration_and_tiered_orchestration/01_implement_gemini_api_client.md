# Task: Implement Gemini API Client with Dual-Model Configuration (Sub-Epic: 02_AI Model Integration and Tiered Orchestration)

## Covered Requirements
- [TAS-007], [TAS-008]

## 1. Initial Test Written
- [ ] Create `src/ai/gemini/__tests__/gemini-client.test.ts`.
- [ ] Write a unit test that asserts `GeminiClient` can be instantiated with a model name of `gemini-3-pro` and that the `modelName` property equals `"gemini-3-pro"`.
- [ ] Write a unit test that asserts `GeminiClient` can be instantiated with `gemini-3-flash` and that the `modelName` property equals `"gemini-3-flash"`.
- [ ] Write a unit test that asserts calling `GeminiClient.complete(prompt)` with a mocked `@google/generative-ai` SDK returns the expected `GenerateContentResult` text value. Mock the SDK at the module level using `jest.mock('@google/generative-ai')`.
- [ ] Write a unit test that asserts the `gemini-3-pro` client is configured with `maxOutputTokens` of at least `8192` and uses the `1M` context window (verify via the constructor options passed to the mocked SDK's `getGenerativeModel`).
- [ ] Write a unit test that asserts the `gemini-3-flash` client is configured with a lower `maxOutputTokens` (e.g., `2048`) reflecting its low-latency profile.
- [ ] Write an integration test in `src/ai/gemini/__tests__/gemini-client.integration.test.ts` (guarded by `process.env.GEMINI_API_KEY`) that calls the real Gemini API with a minimal prompt and asserts a non-empty string response for both model variants.

## 2. Task Implementation
- [ ] Install the Google Generative AI SDK: `npm install @google/generative-ai`.
- [ ] Create `src/ai/gemini/gemini-client.ts` exporting a `GeminiClient` class.
- [ ] The constructor must accept a `GeminiClientConfig` interface: `{ modelName: 'gemini-3-pro' | 'gemini-3-flash'; apiKey?: string; maxOutputTokens?: number; temperature?: number; }`.
- [ ] Retrieve `apiKey` from `config.apiKey ?? process.env.GEMINI_API_KEY`. Throw a `ConfigurationError` if neither is provided.
- [ ] Internally instantiate `GoogleGenerativeAI` from `@google/generative-ai` and call `getGenerativeModel({ model: config.modelName, generationConfig: { maxOutputTokens, temperature } })`.
- [ ] Default `maxOutputTokens` to `8192` for `gemini-3-pro` and `2048` for `gemini-3-flash` when not explicitly provided.
- [ ] Expose a `complete(prompt: string, options?: GenerateOptions): Promise<string>` method that calls `model.generateContent(prompt)` and returns `result.response.text()`.
- [ ] Expose a `stream(prompt: string, options?: GenerateOptions): AsyncIterable<string>` method that calls `model.generateContentStream(prompt)` and yields each chunk's text.
- [ ] Create `src/ai/gemini/index.ts` that re-exports `GeminiClient` and `GeminiClientConfig`.
- [ ] Create `src/ai/gemini/errors.ts` defining `ConfigurationError extends Error` and `GeminiApiError extends Error` (wraps raw SDK errors with a `statusCode` field).

## 3. Code Review
- [ ] Verify the class does NOT contain any business-logic routing decisions (model selection belongs in the orchestrator, not here).
- [ ] Confirm `apiKey` is never logged or included in any thrown error message.
- [ ] Confirm the `stream` method uses `AsyncIterable`, not a callback pattern.
- [ ] Confirm TypeScript strict mode passes: no `any` types, all parameters typed.
- [ ] Confirm the `GeminiClientConfig` interface is exported for use by the orchestrator layer.
- [ ] Confirm `[TAS-007]` and `[TAS-008]` are referenced in a JSDoc comment on the class.

## 4. Run Automated Tests to Verify
- [ ] Run `npx jest src/ai/gemini/__tests__/gemini-client.test.ts --coverage` and confirm all unit tests pass with 100% line coverage on `gemini-client.ts`.
- [ ] Run the integration tests conditionally: `GEMINI_API_KEY=<key> npx jest src/ai/gemini/__tests__/gemini-client.integration.test.ts` and confirm they pass.

## 5. Update Documentation
- [ ] Add an entry to `docs/ai/models.md` (create if absent) describing `GeminiClient`, its two supported models, their default token limits, and the environment variable `GEMINI_API_KEY`.
- [ ] Update `docs/architecture/adr/` with a new ADR (e.g., `adr-0XX-gemini-sdk-selection.md`) documenting the decision to use `@google/generative-ai`, referencing `[TAS-007]` and `[TAS-008]`.
- [ ] Update the project `README.md` prerequisite section to mention `GEMINI_API_KEY` environment variable.

## 6. Automated Verification
- [ ] Run `npx jest src/ai/gemini/__tests__/gemini-client.test.ts --json --outputFile=test-results/gemini-client.json` and assert the output file contains `"numFailedTests": 0`.
- [ ] Run `npx tsc --noEmit` and confirm zero TypeScript errors.
