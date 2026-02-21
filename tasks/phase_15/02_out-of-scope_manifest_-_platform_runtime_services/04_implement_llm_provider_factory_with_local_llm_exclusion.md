# Task: Implement LLM Provider Factory with Local-LLM Exclusion Guard (Sub-Epic: 02_Out-of-Scope Manifest - Platform & Runtime Services)

## Covered Requirements
- [1_PRD-REQ-OOS-011]

## 1. Initial Test Written
- [ ] In `src/llm/__tests__/provider-factory.test.ts`, write unit tests covering:
  - `LlmProviderFactory.create({ provider: 'openai' })` returns a valid `LlmProvider` instance without error.
  - `LlmProviderFactory.create({ provider: 'anthropic' })` returns a valid `LlmProvider` instance without error.
  - `LlmProviderFactory.create({ provider: 'gemini' })` returns a valid `LlmProvider` instance without error.
  - `LlmProviderFactory.create({ provider: 'ollama' })` throws a `LocalLlmNotSupportedError` with `requirementId: "1_PRD-REQ-OOS-011"`.
  - `LlmProviderFactory.create({ provider: 'llama.cpp' })` throws a `LocalLlmNotSupportedError`.
  - `LlmProviderFactory.create({ provider: 'lm-studio' })` throws a `LocalLlmNotSupportedError`.
  - `LlmProviderFactory.create({ provider: 'huggingface-local' })` throws a `LocalLlmNotSupportedError`.
  - `LlmProviderFactory.create({ provider: 'custom-local', baseUrl: 'http://localhost:11434' })` throws a `LocalLlmNotSupportedError` (local `baseUrl` detection via `localhost` or `127.0.0.1`).
  - `LocalLlmNotSupportedError` has a `futureRoadmapHook` property set to `"9_ROADMAP-FUTURE-001"`.
- [ ] In `src/llm/__tests__/local-llm-boundary.guard.test.ts`, write unit tests covering:
  - `LocalLlmBoundaryGuard.validate(request)` returns a `BoundaryViolation` when `request.llmConfig.provider` is in the local LLM blocklist.
  - `LocalLlmBoundaryGuard.validate(request)` returns a `BoundaryViolation` when `request.llmConfig.baseUrl` resolves to `localhost` or `127.0.0.1`.
  - `LocalLlmBoundaryGuard.validate(request)` returns `null` for all supported remote providers.

## 2. Task Implementation
- [ ] Create `src/errors/local-llm-not-supported.error.ts`:
  ```typescript
  export class LocalLlmNotSupportedError extends Error {
    public readonly requirementId = '1_PRD-REQ-OOS-011';
    public readonly futureRoadmapHook = '9_ROADMAP-FUTURE-001';
    constructor(provider: string) {
      super(
        `Local LLM provider "${provider}" is not supported by devs (1_PRD-REQ-OOS-011). ` +
        `devs requires a remote LLM API. Local LLM hosting is planned for a future release (${this.futureRoadmapHook}).`
      );
      this.name = 'LocalLlmNotSupportedError';
    }
  }
  ```
- [ ] Create or update `src/llm/provider-factory.ts`:
  - Define `LOCAL_LLM_BLOCKLIST: string[]` containing: `'ollama'`, `'llama.cpp'`, `'lm-studio'`, `'huggingface-local'`, `'jan'`, `'gpt4all'`.
  - Define `isLocalBaseUrl(baseUrl?: string): boolean` — returns `true` if the URL hostname is `localhost`, `127.0.0.1`, or `0.0.0.0`.
  - Implement `LlmProviderFactory.create(config: LlmProviderConfig): LlmProvider`:
    - If `config.provider` is in `LOCAL_LLM_BLOCKLIST`, throw `LocalLlmNotSupportedError`.
    - If `config.baseUrl` is provided and `isLocalBaseUrl(config.baseUrl)` is true, throw `LocalLlmNotSupportedError(config.provider ?? 'custom-local')`.
    - Otherwise, instantiate and return the appropriate provider adapter.
- [ ] Create `src/guards/local-llm-boundary.guard.ts`:
  - Implement `LocalLlmBoundaryGuard.validate(request: OrchestratorRequest): BoundaryViolation | null`:
    - Check `request.llmConfig` for local provider or local `baseUrl`.
    - Return violation with `requirementId: "1_PRD-REQ-OOS-011"` and `futureRoadmapHook: "9_ROADMAP-FUTURE-001"` if matched.
  - Export singleton: `export const localLlmBoundaryGuard = new LocalLlmBoundaryGuard()`.
- [ ] Register `LocalLlmBoundaryGuard` in the orchestrator's request validation pipeline.

## 3. Code Review
- [ ] Verify `LOCAL_LLM_BLOCKLIST` is a `const` exported array so external modules can reference it (e.g., for UI hints).
- [ ] Verify `isLocalBaseUrl` handles edge cases: `undefined` input → `false`; `http://localhost:11434` → `true`; `https://api.openai.com` → `false`.
- [ ] Verify `LocalLlmNotSupportedError` extends `Error` correctly (prototype chain set for `instanceof` checks).
- [ ] Verify that the `LlmProviderFactory` does not contain any `require()` or dynamic `import()` of local LLM packages — no accidental dependency on `ollama` npm package.
- [ ] Verify TypeScript strict mode passes; no `any`.

## 4. Run Automated Tests to Verify
- [ ] Run `npx jest src/llm/__tests__/provider-factory.test.ts src/llm/__tests__/local-llm-boundary.guard.test.ts --coverage` and confirm all tests pass with 100% branch coverage on `LOCAL_LLM_BLOCKLIST` checks and `isLocalBaseUrl`.
- [ ] Run `npm test` to confirm no regressions.

## 5. Update Documentation
- [ ] Create `src/llm/provider-factory.agent.md` documenting: supported remote providers, the local LLM blocklist, `isLocalBaseUrl` logic, `LocalLlmNotSupportedError`, and the future roadmap hook.
- [ ] Update `docs/architecture/boundary-guards.md` with a row for `LocalLlmBoundaryGuard`.
- [ ] Add a section `## LLM Provider Support` to `docs/architecture/llm-integration.md` (create if absent) listing supported remote providers, explicitly listing local providers as unsupported with a reference to `1_PRD-REQ-OOS-011` and `9_ROADMAP-FUTURE-001`.

## 6. Automated Verification
- [ ] Run the following smoke test:
  ```bash
  npx ts-node -e "
  import { LlmProviderFactory } from './src/llm/provider-factory';
  import { LocalLlmNotSupportedError } from './src/errors/local-llm-not-supported.error';
  try {
    LlmProviderFactory.create({ provider: 'ollama' });
    process.exit(1);
  } catch (e) {
    if (!(e instanceof LocalLlmNotSupportedError)) process.exit(1);
    if (e.requirementId !== '1_PRD-REQ-OOS-011') process.exit(1);
    if (e.futureRoadmapHook !== '9_ROADMAP-FUTURE-001') process.exit(1);
  }
  console.log('LocalLlmBoundaryGuard: PASS');
  "
  ```
  Confirm exit code 0 and output `LocalLlmBoundaryGuard: PASS`.
