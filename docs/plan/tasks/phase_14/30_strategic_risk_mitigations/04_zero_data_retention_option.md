# Task: Implement Zero-Data-Retention LLM Endpoint Option (Sub-Epic: 30_Strategic Risk Mitigations)

## Covered Requirements
- [8_RISKS-REQ-134]

## 1. Initial Test Written
- [ ] In `src/llm/__tests__/zero_retention.test.ts`, write unit tests covering:
  - `buildZeroRetentionConfig(provider: LlmProvider): LlmClientConfig` — assert that returned config includes `data_logging: false`, `training_opt_out: true`, and the correct enterprise endpoint URL per provider (Gemini Enterprise, Azure OpenAI, Anthropic Enterprise).
  - `isZeroRetentionEndpoint(config: LlmClientConfig): boolean` — returns `true` only when `data_logging === false` AND the endpoint URL matches the expected enterprise domain for the given provider.
  - `validateZeroRetentionResponse(response: LlmApiResponse): void` — throws `RetentionPolicyViolationError` if the response headers include `X-Data-Logged: true`.
  - Write an integration test using a mock HTTP server that emulates an enterprise endpoint: confirm the `LlmClient` sends the correct `data-logging` header and that `validateZeroRetentionResponse` passes when the mock returns `X-Data-Logged: false`.

## 2. Task Implementation
- [ ] Add a `zeroDataRetention` boolean field to `src/config/devs_config.ts` (the `.devs/config.json` schema):
  ```typescript
  zeroDataRetention?: boolean; // default: false
  enterpriseLlmEndpoint?: string; // custom endpoint URL when zeroDataRetention is true
  ```
- [ ] Create `src/llm/zero_retention.ts` exporting:
  - `buildZeroRetentionConfig(provider, baseConfig)` — returns a cloned config with enterprise endpoint set and `data_logging: false`.
  - `isZeroRetentionEndpoint(config)` — validation helper.
  - `validateZeroRetentionResponse(response)` — response guard.
- [ ] Modify `src/llm/llm_client.ts`:
  - On construction, read `config.zeroDataRetention`; if `true`, call `buildZeroRetentionConfig` to override the base config.
  - After each API response, call `validateZeroRetentionResponse(response)` and log a `SECURITY_ALERT` to the `SecurityAlertTable` if a violation is detected (do not throw in production; instead escalate to the user via Webview notification).
- [ ] Add a `devs config --set zero-data-retention=true --endpoint <url>` CLI subcommand variant in `src/cli/commands/config.ts` that writes the new fields to `.devs/config.json`.
- [ ] Display a persistent "🔒 Zero-Data-Retention Mode Active" badge in the Webview status bar when `zeroDataRetention: true`.

## 3. Code Review
- [ ] Confirm `enterpriseLlmEndpoint` is validated as a valid HTTPS URL before being written to config; reject HTTP endpoints.
- [ ] Verify that `buildZeroRetentionConfig` creates a deep clone and does not mutate the original `baseConfig`.
- [ ] Ensure `validateZeroRetentionResponse` is always called even when the feature flag is `false` (it should be a no-op in that case) — this prevents accidental bypass.
- [ ] Confirm no API keys or endpoints are logged to `agent_logs` at any log level.

## 4. Run Automated Tests to Verify
- [ ] Run `npm test -- --testPathPattern="zero_retention"` and confirm all tests pass.
- [ ] Run `npm test -- --testPathPattern="llm_client"` to confirm integration tests pass.
- [ ] Run full suite `npm test`.

## 5. Update Documentation
- [ ] Add a `## Zero-Data-Retention Mode` section to `docs/configuration.md` explaining:
  - When to use it (commercial projects, enterprise environments).
  - How to configure it (`devs config --set zero-data-retention=true --endpoint <url>`).
  - Supported providers and their enterprise endpoints.
- [ ] Update `src/llm/llm_client.agent.md` with the `zeroDataRetention` logic flow.
- [ ] Add to `CHANGELOG.md` under `[Phase 14]`: "Added Zero-Data-Retention enterprise LLM endpoint option".

## 6. Automated Verification
- [ ] Run `npm run validate-all` and confirm exit code `0`.
- [ ] Execute `node scripts/verify_requirement_coverage.js --req 8_RISKS-REQ-134` and confirm `covered`.
- [ ] Run the integration test with mock enterprise server: `npm test -- --testPathPattern="zero_retention" --verbose` and confirm `X-Data-Logged: false` path succeeds and `X-Data-Logged: true` path logs a `SECURITY_ALERT`.
