# Task: MCP Handshake Success Rate Benchmark (Sub-Epic: 23_Benchmarking Suite Core Metrics)

## Covered Requirements
- [9_ROADMAP-REQ-023]

## 1. Initial Test Written
- [ ] Create `src/benchmarking/__tests__/suites/MCPHandshakeSuite.test.ts`.
- [ ] Write a unit test asserting `MCPHandshakeSuite` implements `IBenchmarkSuite` with `name === 'MCPHandshakeSuite'` and `requirmentIds` containing `'9_ROADMAP-REQ-023'`.
- [ ] Write a unit test that mocks `@modelcontextprotocol/sdk`'s `Client` class. Configure the mock so that `client.connect()` resolves successfully for all calls. Assert `execute()` returns `{ status: 'pass', metrics: { successRate: 1.0 } }`.
- [ ] Write a unit test where the mock causes `client.connect()` to reject with an error on 1 out of 10 calls. Assert `metrics.successRate === 0.9` and `status === 'fail'` (since 0.9 < 1.0).
- [ ] Write a unit test asserting `metrics.totalHandshakes`, `metrics.successCount`, and `metrics.failureCount` are present in `SuiteResult.metrics` and sum correctly.
- [ ] Write an integration test (tagged `@integration`) in `src/benchmarking/__tests__/suites/MCPHandshakeSuite.integration.test.ts` that spins up the real `devs` MCP server via `StdioServerTransport`, performs 10 sequential tool handshakes using `@modelcontextprotocol/sdk`'s `Client`, and asserts all 10 succeed.

## 2. Task Implementation
- [ ] Create `src/benchmarking/suites/MCPHandshakeSuite.ts` implementing `IBenchmarkSuite`:
  - `name = 'MCPHandshakeSuite'`
  - `requirmentIds = ['9_ROADMAP-REQ-023']`
  - Constructor accepts `MCPHandshakeConfig`: `{ serverScriptPath: string; toolNames: string[]; handshakeAttempts: number }`. Defaults: `handshakeAttempts: 50`, `toolNames` from the registered MCP tools manifest.
  - `execute()`:
    1. Import `{ Client }` and `{ StdioClientTransport }` from `@modelcontextprotocol/sdk/client/index.js`.
    2. For each attempt up to `handshakeAttempts`:
       a. Instantiate a `Client` with `{ name: 'benchmark-client', version: '1.0.0' }`.
       b. Connect via `StdioClientTransport` pointing to `serverScriptPath`.
       c. Call `client.listTools()` to verify the handshake is functional.
       d. Close the client with `client.close()`.
       e. Record success or failure with the error message.
    3. Compute `successRate = successCount / handshakeAttempts`.
    4. Return `SuiteResult` with `metrics: { successRate, successCount, failureCount: handshakeAttempts - successCount, totalHandshakes: handshakeAttempts }`.
    5. `status = successRate === 1.0 ? 'pass' : 'fail'`.
    6. Include `details`: `"Handshake success rate: {successRate*100:.1f}% ({successCount}/{handshakeAttempts})"`.
- [ ] Register `MCPHandshakeSuite` in `src/benchmarking/index.ts`.
- [ ] Add a `DEVS_MCP_SERVER_SCRIPT` environment variable lookup in `MCPHandshakeSuite` to override the default server path without code changes.

## 3. Code Review
- [ ] Verify each `Client` instance is properly closed in a `finally` block to prevent leaked subprocess handles.
- [ ] Verify the suite does not run handshakes concurrently (sequential is required to avoid port/process conflicts in the default stdio transport setup).
- [ ] Verify the `MCPHandshakeConfig` defaults are exported as a named constant `DEFAULT_MCP_HANDSHAKE_CONFIG` for easy override in tests.
- [ ] Verify `client.listTools()` response is validated: must be a non-null object with a `tools` array; otherwise count as failure.
- [ ] Verify the integration test is guarded by `process.env.DEVS_RUN_INTEGRATION_TESTS === 'true'` so it is skipped in normal CI unless explicitly enabled.

## 4. Run Automated Tests to Verify
- [ ] Run `npm test -- --testPathPattern="src/benchmarking/__tests__/suites/MCPHandshakeSuite.test"` (unit tests only) and confirm all pass.
- [ ] Run `DEVS_RUN_INTEGRATION_TESTS=true npm test -- --testPathPattern="src/benchmarking/__tests__/suites/MCPHandshakeSuite.integration"` and confirm all 10 handshakes succeed.
- [ ] Run `npm run build` and confirm zero TypeScript errors.

## 5. Update Documentation
- [ ] Create `src/benchmarking/suites/mcp-handshake.agent.md` documenting: how to configure `MCPHandshakeConfig`, the `DEVS_MCP_SERVER_SCRIPT` env var override, what constitutes a "successful handshake," why sequential (not parallel) attempts are used, and how to run integration tests.

## 6. Automated Verification
- [ ] Run `npm test -- --testPathPattern="src/benchmarking/__tests__/suites/MCPHandshakeSuite.test" --coverage` and confirm ≥ 90% line coverage for `MCPHandshakeSuite.ts`.
- [ ] Run `npx tsc --noEmit` and confirm zero errors.
- [ ] Confirm `src/benchmarking/suites/mcp-handshake.agent.md` exists.
