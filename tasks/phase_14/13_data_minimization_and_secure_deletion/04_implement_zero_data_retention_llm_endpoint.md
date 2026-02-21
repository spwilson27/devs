# Task: Implement Zero-Data-Retention LLM Endpoint Configuration (Sub-Epic: 13_Data Minimization and Secure Deletion)

## Covered Requirements
- [8_RISKS-REQ-063]

## 1. Initial Test Written
- [ ] Create `src/core/llm/__tests__/zeroRetentionEndpoint.test.ts`:
  - Test `LLMClientFactory.create(config: LLMClientConfig): LLMClient`:
    - When `config.zeroDataRetention = true` and `config.enterpriseEndpoint` is set, asserts that the resulting client sends requests to `config.enterpriseEndpoint` (not the default Gemini endpoint).
    - Asserts the `X-Zero-Data-Retention: true` HTTP header is present on every request made by the client.
    - Asserts that when `zeroDataRetention = true`, the client throws a `ZeroRetentionEndpointRequiredError` if `config.enterpriseEndpoint` is not provided.
    - Asserts that when `zeroDataRetention = false` (default), no special header is added and the default endpoint is used.
    - Asserts the `LLMClientConfig` is validated with Zod at construction time: `enterpriseEndpoint` must be a valid HTTPS URL; non-HTTPS URLs must throw `InsecureEndpointError`.
  - Test `loadLLMConfig(devsConfig: DevsConfig): LLMClientConfig`:
    - Asserts it reads `llm.zeroDataRetention` and `llm.enterpriseEndpoint` from `devs.config.json`.
    - Asserts it falls back to `process.env.DEVS_ENTERPRISE_LLM_ENDPOINT` if config key is absent.
    - Asserts missing `enterpriseEndpoint` when `zeroDataRetention=true` produces a descriptive error at config-load time.

## 2. Task Implementation
- [ ] Define `LLMClientConfig` interface in `src/core/llm/types.ts`:
  ```typescript
  interface LLMClientConfig {
    provider: 'gemini' | 'enterprise';
    apiKey: string;
    model: string;
    zeroDataRetention: boolean;          // [8_RISKS-REQ-063]
    enterpriseEndpoint?: string;         // Required when zeroDataRetention=true
    timeoutMs: number;
  }
  ```
- [ ] Create `src/core/llm/zeroRetentionEndpoint.ts`:
  - Export `ZeroRetentionEndpointRequiredError extends Error`.
  - Export `InsecureEndpointError extends Error`.
  - Export `validateZeroRetentionConfig(config: LLMClientConfig): void` — throws if `zeroDataRetention=true` and `enterpriseEndpoint` is missing or non-HTTPS.
  - Export `applyZeroRetentionHeaders(headers: Record<string, string>, config: LLMClientConfig): Record<string, string>` — adds `X-Zero-Data-Retention: true` when enabled.
  - Add comment: `// [8_RISKS-REQ-063] Zero-data-retention support for enterprise endpoints.`
- [ ] Update `src/core/llm/LLMClientFactory.ts`:
  - Call `validateZeroRetentionConfig(config)` at construction.
  - Use `config.enterpriseEndpoint ?? DEFAULT_GEMINI_ENDPOINT` as the base URL.
  - Apply `applyZeroRetentionHeaders` in the request interceptor.
- [ ] Update `src/core/config/configLoader.ts` to parse `llm.zeroDataRetention` and `llm.enterpriseEndpoint` from `devs.config.json`, with fallback to `DEVS_ENTERPRISE_LLM_ENDPOINT` env var.
- [ ] Add `llm.zeroDataRetention` and `llm.enterpriseEndpoint` entries to `devs.config.schema.json` (JSON Schema) with descriptions.

## 3. Code Review
- [ ] Verify `validateZeroRetentionConfig` is called BEFORE any network request — not lazily on first use.
- [ ] Verify `enterpriseEndpoint` URL validation enforces `https://` scheme (reject `http://` at startup).
- [ ] Verify `X-Zero-Data-Retention` header is sent on EVERY request, not just the first (test with multiple sequential requests in unit tests).
- [ ] Verify the `apiKey` is never included in error messages or logs.
- [ ] Verify `devs.config.schema.json` is updated and `ajv` validation at startup catches missing required fields.

## 4. Run Automated Tests to Verify
- [ ] Run `npx jest src/core/llm/__tests__/zeroRetentionEndpoint.test.ts --coverage` and confirm all tests pass with ≥ 95% branch coverage.
- [ ] Run `npx tsc --noEmit` and confirm zero TypeScript errors.
- [ ] Validate the JSON Schema: `node -e "const s = require('./devs.config.schema.json'); console.log('schema valid')"` — confirm no parse errors.

## 5. Update Documentation
- [ ] Add `docs/configuration/zero-data-retention.md` documenting: how to configure `llm.zeroDataRetention`, the `enterpriseEndpoint` field, the `DEVS_ENTERPRISE_LLM_ENDPOINT` env var fallback, and the `X-Zero-Data-Retention` header semantics.
- [ ] Update `docs/security/data-minimization.md` with a section on zero-data-retention endpoints.
- [ ] Update `docs/agent-memory/phase_14_decisions.md` with: "Zero-data-retention mode (REQ-063) routes all LLM traffic to `enterpriseEndpoint` and adds `X-Zero-Data-Retention: true` header. Validated at config load time."

## 6. Automated Verification
- [ ] Run `node scripts/verify-zero-retention-header.js` (create if absent): spins up a local HTTP mock server, sets `llm.zeroDataRetention=true` and `llm.enterpriseEndpoint=https://localhost:<port>`, fires one LLM request, asserts the received request has the `X-Zero-Data-Retention: true` header. Exit code 0 = pass.
- [ ] Confirm `npm run validate-all` passes.
