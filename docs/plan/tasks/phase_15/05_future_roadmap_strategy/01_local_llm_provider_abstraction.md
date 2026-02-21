# Task: Define and Implement LLM Provider Abstraction Layer (Sub-Epic: 05_Future Roadmap Strategy)

## Covered Requirements
- [9_ROADMAP-FUTURE-001]

## 1. Initial Test Written
- [ ] In `src/llm/__tests__/provider.test.ts`, write unit tests for a `LLMProvider` interface/abstract class:
  - Test that a `CloudLLMProvider` (wrapping the current Gemini/OpenAI client) correctly satisfies the `LLMProvider` interface by calling `generateText(prompt: LLMRequest): Promise<LLMResponse>`.
  - Test that the `LLMProviderFactory.create(config: LLMConfig)` returns the correct provider type (`'cloud'` vs `'local'`) based on the `config.type` field.
  - Test that when `config.type === 'local'`, the factory returns a `LocalLLMProvider` stub that throws a `NotImplementedError` with the message `"Local LLM support is not yet enabled. See FUTURE_ROADMAP.md for details."`.
  - Test that the `LLMConfig` schema (Zod) validates required fields: `type` (`'cloud' | 'local'`), `modelName` (string), and optional `endpoint` (URL string, required only when `type === 'local'`).
  - Test that missing `endpoint` when `type === 'local'` causes a Zod validation error.

## 2. Task Implementation
- [ ] Create `src/llm/types.ts` defining:
  - `LLMRequest` interface: `{ prompt: string; systemPrompt?: string; maxTokens?: number; temperature?: number; }`.
  - `LLMResponse` interface: `{ text: string; inputTokens: number; outputTokens: number; model: string; }`.
  - `LLMConfig` Zod schema with `type: z.enum(['cloud', 'local'])`, `modelName: z.string()`, and `endpoint: z.string().url().optional()` with a `.superRefine()` that enforces `endpoint` is present when `type === 'local'`.
- [ ] Create `src/llm/provider.ts` defining:
  - `LLMProvider` TypeScript `interface` with a single method: `generateText(request: LLMRequest): Promise<LLMResponse>`.
- [ ] Create `src/llm/cloud_provider.ts` implementing `LLMProvider`. Wrap the existing LLM client call (e.g., `@google/generative-ai`) to satisfy the interface. Map response fields to `LLMResponse`.
- [ ] Create `src/llm/local_provider.ts` implementing `LLMProvider`. The `generateText` method must throw `new NotImplementedError("Local LLM support is not yet enabled. See FUTURE_ROADMAP.md for details.")`. Add a JSDoc comment: `/** Placeholder for future Ollama/vLLM integration (9_ROADMAP-FUTURE-001). */`
- [ ] Create `src/llm/factory.ts` with `LLMProviderFactory.create(config: LLMConfig): LLMProvider` that instantiates the correct provider.
- [ ] Create `src/llm/errors.ts` with `NotImplementedError extends Error`.
- [ ] Update `src/llm/index.ts` to export all new types and the factory.
- [ ] Refactor all existing callsites that directly instantiate the old LLM client to use `LLMProviderFactory.create(config)` instead.

## 3. Code Review
- [ ] Verify the `LLMProvider` interface is a pure TypeScript `interface` (no class), ensuring future providers can be implemented in isolation.
- [ ] Verify `LocalLLMProvider` contains NO real implementation logic—only the `NotImplementedError` throw and the JSDoc roadmap annotation.
- [ ] Verify `LLMConfig` Zod schema's `.superRefine()` correctly enforces the `endpoint` requirement and that the error message is descriptive.
- [ ] Verify no existing functionality is broken: all existing `Cloud` provider tests still pass without modification.
- [ ] Verify that `src/llm/index.ts` exports are clean and do not expose internal implementation details beyond the public API (`LLMProvider`, `LLMConfig`, `LLMProviderFactory`, `LLMRequest`, `LLMResponse`).

## 4. Run Automated Tests to Verify
- [ ] Run `npm test -- --testPathPattern="src/llm/__tests__/provider.test.ts"` and confirm all tests pass with zero failures.
- [ ] Run the full test suite `npm test` to confirm no regressions from the refactor of existing callsites.

## 5. Update Documentation
- [ ] Create `src/llm/llm.agent.md` documenting: the `LLMProvider` interface contract, how to add a new provider, the `LLMProviderFactory` usage, and a note referencing `9_ROADMAP-FUTURE-001` for local LLM support.
- [ ] Add a `## Future: Local LLM Support (9_ROADMAP-FUTURE-001)` section to `docs/FUTURE_ROADMAP.md` (create if not exists) describing the `LocalLLMProvider` stub, the Ollama/vLLM integration plan, and the `endpoint` configuration field that already exists in the schema.

## 6. Automated Verification
- [ ] Run `npm test -- --testPathPattern="src/llm/__tests__/provider.test.ts" --json --outputFile=test-results/llm-provider.json` and verify the output file exists and `numFailedTests === 0`.
- [ ] Run `grep -r "new.*LLMClient\|require.*old-llm-client" src/ --include="*.ts"` (adjusted to match the old direct instantiation pattern) and confirm zero results, proving all callsites have been migrated.
