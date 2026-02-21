# Task: Implement System Health Metrics Collector Backend Service (Sub-Epic: 09_System Health and Performance Profiling)

## Covered Requirements
- [4_USER_FEATURES-REQ-069]

## 1. Initial Test Written

- [ ] In `packages/core/src/health/__tests__/SystemHealthCollector.test.ts`, write unit tests for the `SystemHealthCollector` class:
  - Test that `startPolling(intervalMs: number)` begins emitting `system.health.metrics` events on the RTES `EventBus` at the specified interval.
  - Test that emitted payloads conform to the `SystemHealthMetrics` interface: `{ timestamp: number, cpu: { usagePercent: number }, memory: { usedBytes: number, totalBytes: number, usagePercent: number }, tokens: { activeSessionUsed: number, activeSessionBudget: number } }`.
  - Test that `stopPolling()` stops further event emissions (assert no events after calling stop).
  - Test that CPU usage is a number between 0 and 100.
  - Test that memory `usedBytes` does not exceed `totalBytes`.
  - Test that if the OS polling call throws, the collector emits a `system.health.error` event with an `{ error: string }` payload instead of crashing.
  - Use `jest.useFakeTimers()` to control interval advancement.
  - Mock the `os` module (`os.cpus()`, `os.totalmem()`, `os.freemem()`) to provide deterministic results.
  - Mock the `EventBus` to spy on `publish()` calls.

## 2. Task Implementation

- [ ] Create `packages/core/src/health/SystemHealthCollector.ts`:
  - Import `os` from Node.js standard library.
  - Import `EventBus` from `../events/EventBus`.
  - Define and export the `SystemHealthMetrics` interface (fields: `timestamp`, `cpu.usagePercent`, `memory.usedBytes`, `memory.totalBytes`, `memory.usagePercent`, `tokens.activeSessionUsed`, `tokens.activeSessionBudget`).
  - Implement CPU usage sampling by taking two snapshots of `os.cpus()` idle/total values separated by a short window (100ms) and computing the delta as a percentage.
  - Implement memory metrics using `os.totalmem()` and `os.freemem()`.
  - Accept an `OrchestratorStateReader` (or token state interface) in the constructor to read current token usage; default to returning `0/0` if not provided.
  - Implement `startPolling(intervalMs = 2000)` using `setInterval`; emit `system.health.metrics` events on the injected `EventBus`.
  - Implement `stopPolling()` using `clearInterval`.
  - Wrap the polling body in try/catch; on error emit `system.health.error`.
- [ ] Export `SystemHealthCollector` from `packages/core/src/index.ts`.
- [ ] Add the `SystemHealthMetrics` type to `packages/core/src/types.ts` (or a dedicated `health.types.ts`).

## 3. Code Review

- [ ] Verify `SystemHealthCollector` has **no** direct UI imports; it is purely a backend/core module.
- [ ] Confirm the CPU sampling approach avoids blocking the event loop (the second snapshot must be taken asynchronously after a `setTimeout` of ≤100ms, not with a synchronous spin-wait).
- [ ] Confirm `stopPolling()` is idempotent (calling it multiple times does not throw).
- [ ] Confirm events are emitted using the established RTES `EventBus` publish API (not a custom emitter).
- [ ] Confirm all public types are exported from the package's index barrel.

## 4. Run Automated Tests to Verify

- [ ] Run `pnpm --filter @devs/core test -- --testPathPattern="SystemHealthCollector"` and confirm all tests pass with zero failures.
- [ ] Run `pnpm --filter @devs/core test -- --coverage --testPathPattern="SystemHealthCollector"` and confirm line and branch coverage ≥ 90% for `SystemHealthCollector.ts`.

## 5. Update Documentation

- [ ] Add a JSDoc block to `SystemHealthCollector` class describing its purpose, constructor parameters, and emitted events (`system.health.metrics`, `system.health.error`).
- [ ] Update `packages/core/README.md` under a "Health Monitoring" section documenting the `SystemHealthCollector` API, payload schema, and usage example.
- [ ] Update the agent memory file `docs/agent_memory/phase_12_decisions.md` with a note: "`SystemHealthCollector` polls OS metrics every 2s by default and emits on the shared RTES EventBus. Token usage is injected via `OrchestratorStateReader`."

## 6. Automated Verification

- [ ] CI pipeline runs `pnpm --filter @devs/core test -- --ci --testPathPattern="SystemHealthCollector"` and exits with code 0.
- [ ] The test output (stdout) must contain the string `"PASS"` for the `SystemHealthCollector.test.ts` suite.
- [ ] Run `pnpm --filter @devs/core build` and confirm TypeScript compilation succeeds with zero errors.
