# Task: Provider Registry and Failover Configuration (Sub-Epic: 12_Model Failover and Provider Handling)

## Covered Requirements
- [8_RISKS-REQ-081]

## 1. Initial Test Written
- [ ] In `src/llm/__tests__/ProviderRegistry.test.ts`, write unit tests for the `ProviderRegistry` class covering:
  - `getProviders()` returns providers in the correct priority order: `['gemini-3-pro', 'claude-3.5-sonnet', 'gpt-4o']`.
  - `getProvider(name)` returns the correct provider config object with `name`, `apiKeyEnvVar`, `maxRetries`, and `timeoutMs` fields.
  - `getProvider('nonexistent')` throws a typed `ProviderNotFoundError`.
  - Loading config from environment variables: mock `process.env` to set `GEMINI_API_KEY`, `ANTHROPIC_API_KEY`, `OPENAI_API_KEY` and assert that the registry resolves them correctly.
  - A provider whose `apiKeyEnvVar` resolves to `undefined` is marked as `available: false` in the registry.
- [ ] In `src/llm/__tests__/ProviderRegistry.integration.test.ts`, write an integration test that reads from a real `.env.test` fixture file (using `dotenv`) and asserts that providers with valid keys are marked `available: true`.

## 2. Task Implementation
- [ ] Create `src/llm/ProviderRegistry.ts`:
  - Define the `ProviderConfig` interface: `{ name: string; apiKeyEnvVar: string; maxRetries: number; timeoutMs: number; available: boolean; }`.
  - Define the `PROVIDER_PRIORITY` constant: `['gemini-3-pro', 'claude-3.5-sonnet', 'gpt-4o']`.
  - Implement the `ProviderRegistry` class:
    - Constructor reads `process.env` to populate `available` on each provider config.
    - `getProviders(): ProviderConfig[]` returns all providers in `PROVIDER_PRIORITY` order.
    - `getAvailableProviders(): ProviderConfig[]` filters to only `available: true` providers in order.
    - `getProvider(name: string): ProviderConfig` throws `ProviderNotFoundError` if not found.
  - Define `ProviderNotFoundError extends Error` with a `providerName` property.
- [ ] Create `src/llm/providerConfig.ts` exporting the default provider configuration map keyed by provider name, sourcing API key env var names from a constants file.
- [ ] Create `src/llm/constants.ts` exporting `GEMINI_API_KEY_ENV`, `ANTHROPIC_API_KEY_ENV`, `OPENAI_API_KEY_ENV` string constants and default `MAX_RETRIES = 3`, `TIMEOUT_MS = 60000`.
- [ ] Add `GEMINI_API_KEY`, `ANTHROPIC_API_KEY`, `OPENAI_API_KEY` to `.env.example` with placeholder values and a comment: `# LLM Provider API Keys — at least one must be set`.

## 3. Code Review
- [ ] Verify that `ProviderRegistry` has no side effects at import time other than reading `process.env`.
- [ ] Confirm that all exported types/interfaces use `interface` (not `type`) for object shapes, per project TypeScript conventions.
- [ ] Ensure `ProviderNotFoundError` is a proper subclass of `Error` with `name` set to `'ProviderNotFoundError'`.
- [ ] Validate that `PROVIDER_PRIORITY` is a `readonly` constant tuple to prevent mutation.
- [ ] Check that no hardcoded API keys or secrets exist anywhere in the new files.

## 4. Run Automated Tests to Verify
- [ ] Run `npm test -- --testPathPattern="src/llm/__tests__/ProviderRegistry"` and confirm all unit and integration tests pass with 0 failures.
- [ ] Run `npm run lint -- src/llm/` and confirm 0 linting errors.
- [ ] Run `npm run typecheck` and confirm 0 TypeScript errors.

## 5. Update Documentation
- [ ] Update `docs/architecture/llm-providers.md` (create if absent) with a section "Provider Registry" documenting the priority order, the `ProviderConfig` interface fields, and how `available` is resolved at startup.
- [ ] Add a changelog entry to `CHANGELOG.md` under `[Unreleased]`: `feat(llm): add ProviderRegistry with priority-ordered failover config`.

## 6. Automated Verification
- [ ] Run `node -e "const { ProviderRegistry } = require('./dist/llm/ProviderRegistry'); const r = new ProviderRegistry(); console.log(r.getProviders().map(p => p.name))"` and assert the output equals `['gemini-3-pro','claude-3.5-sonnet','gpt-4o']`.
- [ ] Execute `npm test -- --coverage --testPathPattern="src/llm/__tests__/ProviderRegistry" --coverageThreshold='{"global":{"lines":90}}'` to confirm ≥90% line coverage on `ProviderRegistry.ts`.
