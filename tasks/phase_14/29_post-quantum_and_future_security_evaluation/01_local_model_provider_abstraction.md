# Task: Local-Only Model Provider Abstraction Layer (Sub-Epic: 29_Post-Quantum and Future Security Evaluation)

## Covered Requirements
- [5_SECURITY_DESIGN-REQ-SEC-QST-001]

## 1. Initial Test Written
- [ ] In `src/ai/providers/__tests__/local-model-provider.test.ts`, write unit tests that:
  - Assert `LocalModelProvider` implements the `IModelProvider` interface with methods: `complete(prompt: string, options: CompletionOptions): Promise<CompletionResult>`, `embed(text: string): Promise<number[]>`, and `healthCheck(): Promise<boolean>`.
  - Assert that constructing `LocalModelProvider` with a valid config (e.g., `{ endpoint: 'http://localhost:11434', model: 'llama3' }`) does not throw.
  - Assert that constructing `LocalModelProvider` with a missing `endpoint` throws a `ConfigurationError`.
  - Assert that `healthCheck()` returns `true` when the mock HTTP server at `endpoint/health` responds with HTTP 200.
  - Assert that `healthCheck()` returns `false` when the mock server responds with a non-200 status or times out.
  - Assert that `complete()` sends a POST request to `endpoint/api/generate` with the correct JSON body and maps the response to `CompletionResult`.
  - Assert that `complete()` throws a `ModelProviderError` when the upstream returns a 5xx status.
  - Assert that `embed()` sends a POST to `endpoint/api/embeddings` and returns a numeric array.
  - Write an integration test (tagged `@integration`) using a local [Ollama](https://ollama.ai) stub (msw or nock) that validates the full request/response cycle without any external network calls.
  - Write a test that verifies no API key, bearer token, or external credential is required or sent in request headers.

## 2. Task Implementation
- [ ] Create the interface `IModelProvider` in `src/ai/providers/model-provider.interface.ts` defining:
  ```typescript
  export interface CompletionOptions {
    maxTokens?: number;
    temperature?: number;
    stopSequences?: string[];
  }
  export interface CompletionResult {
    text: string;
    usage: { promptTokens: number; completionTokens: number };
  }
  export interface IModelProvider {
    complete(prompt: string, options?: CompletionOptions): Promise<CompletionResult>;
    embed(text: string): Promise<number[]>;
    healthCheck(): Promise<boolean>;
  }
  ```
- [ ] Create `src/ai/providers/local-model-provider.ts` implementing `IModelProvider`:
  - Accept config `{ endpoint: string; model: string; timeoutMs?: number }` validated via `zod`.
  - Use Node.js `fetch` (or `undici`) with a configurable timeout (`AbortSignal.timeout(timeoutMs ?? 30_000)`).
  - Map Ollama-compatible REST API responses to `CompletionResult`.
  - Export a `createLocalModelProvider(config)` factory function.
- [ ] Register `LocalModelProvider` in `src/ai/providers/index.ts` and update the provider registry/factory in `src/ai/model-registry.ts` to accept `provider: 'local'` as a valid option alongside `'gemini'`.
- [ ] Add a `local` block to the `devs` configuration schema (`src/config/devs-config.schema.ts`):
  ```typescript
  local: z.object({
    endpoint: z.string().url(),
    model: z.string(),
    timeoutMs: z.number().int().positive().optional(),
  }).optional(),
  ```
- [ ] Document the `local` config block in `docs/configuration.md` with a worked Ollama example.

## 3. Code Review
- [ ] Verify `LocalModelProvider` has no direct dependency on any cloud SDK; only standard `fetch`/`undici`.
- [ ] Verify all network calls go through the single `endpoint` URL — no hardcoded external domains.
- [ ] Verify config validation uses `zod.safeParse` and propagates typed `ConfigurationError` (not generic `Error`).
- [ ] Verify the timeout is applied to every outbound request to prevent hanging agents.
- [ ] Verify the provider registry change is backward-compatible — existing `gemini` configs must still work without modification.
- [ ] Verify TypeScript strict mode (`"strict": true`) compliance with no `any` casts.
- [ ] Confirm code satisfies `[TAS-005]` (TypeScript 5.4+ Strict Mode) and `[TAS-063]` (requirement mapping comment present: `// REQ: 5_SECURITY_DESIGN-REQ-SEC-QST-001`).

## 4. Run Automated Tests to Verify
- [ ] Run `npm test -- --testPathPattern="local-model-provider"` and confirm all unit tests pass.
- [ ] Run `npm test -- --testPathPattern="local-model-provider" --testNamePattern="@integration"` and confirm integration tests pass.
- [ ] Run `npm run typecheck` and confirm zero TypeScript errors.
- [ ] Run `npm run lint` and confirm zero ESLint warnings/errors on new files.

## 5. Update Documentation
- [ ] Update `docs/configuration.md` to include the `devs.local` config section with a full Ollama example (`ollama serve`, model name, endpoint).
- [ ] Create `src/ai/providers/local-model-provider.agent.md` (AOD file per `[9_ROADMAP-REQ-041]`) documenting: purpose, config schema, supported Ollama-compatible APIs, and security rationale (no external trust).
- [ ] Add an entry to `CHANGELOG.md` under `[Unreleased]`: `feat: add LocalModelProvider for zero-external-trust local inference (REQ-SEC-QST-001)`.
- [ ] Update `docs/security.md` to note that `local` provider mode eliminates external API key exposure and satisfies the enterprise trust-boundary requirement.

## 6. Automated Verification
- [ ] Run `npm run validate-all` and confirm exit code 0.
- [ ] Run `grep -r "REQ-SEC-QST-001" src/` and confirm at least one `// REQ:` comment exists in the implementation file.
- [ ] Run `node -e "const {createLocalModelProvider} = require('./dist/ai/providers/local-model-provider'); console.log(typeof createLocalModelProvider)"` and confirm output is `function`.
- [ ] Run `npm run test:coverage -- --testPathPattern="local-model-provider"` and confirm line coverage ≥ 90% for `local-model-provider.ts`.
