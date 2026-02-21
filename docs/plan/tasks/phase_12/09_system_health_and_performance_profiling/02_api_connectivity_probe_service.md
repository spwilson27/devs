# Task: Implement API Connectivity Probe Service (Sub-Epic: 09_System Health and Performance Profiling)

## Covered Requirements
- [4_USER_FEATURES-REQ-070]

## 1. Initial Test Written

- [ ] In `packages/core/src/health/__tests__/ApiConnectivityProbe.test.ts`, write unit tests for the `ApiConnectivityProbe` class:
  - Test that `startProbing(intervalMs: number)` begins emitting `system.connectivity.status` events on the RTES `EventBus` at the given interval.
  - Test that the emitted payload conforms to `ConnectivityStatus`: `{ timestamp: number, services: { geminiApi: ServiceStatus, dockerSocket: ServiceStatus, searchProvider: ServiceStatus } }` where `ServiceStatus = { ok: boolean, latencyMs: number | null, error?: string }`.
  - Test `stopProbing()` halts further emissions (use `jest.useFakeTimers()`).
  - Test that when the Gemini API HTTP probe returns a 200, `geminiApi.ok === true` and `latencyMs` is a non-negative number.
  - Test that when the Gemini API probe throws a network error, `geminiApi.ok === false`, `latencyMs === null`, and `error` contains the error message.
  - Test Docker socket probe: when the socket file exists and responds to a ping, `dockerSocket.ok === true`; when the socket is unreachable, `dockerSocket.ok === false`.
  - Test search provider probe analogously.
  - Mock all outbound network/socket calls using `jest.mock` or `nock`; do not make real network calls in tests.
  - Use `jest.useFakeTimers()` to control interval advancement.

## 2. Task Implementation

- [ ] Create `packages/core/src/health/ApiConnectivityProbe.ts`:
  - Define and export `ServiceStatus` and `ConnectivityStatus` interfaces.
  - Accept an injectable `ProbeConfig` object in the constructor containing:
    - `geminiApi.healthEndpoint: string` (e.g., `"https://generativelanguage.googleapis.com"`).
    - `dockerSocket.socketPath: string` (e.g., `"/var/run/docker.sock"`).
    - `searchProvider.healthEndpoint: string`.
  - For Gemini API: perform an HTTP HEAD request using the native `fetch` API (Node 18+) with a 5-second timeout. Record round-trip time with `performance.now()`.
  - For Docker socket: attempt a `net.createConnection({ path: socketPath })` and send a minimal HTTP/1.1 `GET /_ping` request; expect `200 OK`. Use a 3-second timeout.
  - For the search provider: perform an HTTP HEAD request with a 5-second timeout, analogous to Gemini.
  - Run all three probes concurrently via `Promise.allSettled`.
  - Emit `system.connectivity.status` with the aggregated `ConnectivityStatus` payload on the injected `EventBus`.
  - Implement `startProbing(intervalMs = 15000)` and `stopProbing()` using `setInterval`/`clearInterval`.
  - Wrap individual probe calls in try/catch to ensure one failure does not prevent others from being reported.
- [ ] Export `ApiConnectivityProbe`, `ConnectivityStatus`, and `ServiceStatus` from `packages/core/src/index.ts`.

## 3. Code Review

- [ ] Confirm all three probes execute concurrently (`Promise.allSettled`), never sequentially, to avoid latency compounding.
- [ ] Confirm timeouts are enforced using `AbortController` (for fetch) and socket timeout options (for Docker), not left open indefinitely.
- [ ] Confirm no credentials or API keys are hard-coded; all config is injected via `ProbeConfig`.
- [ ] Confirm `stopProbing()` is idempotent.
- [ ] Confirm the `ConnectivityStatus` type is re-exported from the core package index for consumption by UI packages.

## 4. Run Automated Tests to Verify

- [ ] Run `pnpm --filter @devs/core test -- --testPathPattern="ApiConnectivityProbe"` and confirm all tests pass.
- [ ] Run `pnpm --filter @devs/core test -- --coverage --testPathPattern="ApiConnectivityProbe"` and confirm line/branch coverage ≥ 90%.

## 5. Update Documentation

- [ ] Add JSDoc to the `ApiConnectivityProbe` class describing constructor parameters, emitted events, and the `ConnectivityStatus` payload schema.
- [ ] Update `packages/core/README.md` with an "API Connectivity Probing" section documenting the probe configuration and emitted event schema.
- [ ] Update `docs/agent_memory/phase_12_decisions.md`: "`ApiConnectivityProbe` polls every 15s by default. All probe calls are concurrent via `Promise.allSettled`. Config is injected; no hardcoded endpoints."

## 6. Automated Verification

- [ ] CI pipeline runs `pnpm --filter @devs/core test -- --ci --testPathPattern="ApiConnectivityProbe"` and exits with code 0.
- [ ] The test output must contain `"PASS"` for `ApiConnectivityProbe.test.ts`.
- [ ] Run `pnpm --filter @devs/core build` to confirm zero TypeScript compilation errors.
