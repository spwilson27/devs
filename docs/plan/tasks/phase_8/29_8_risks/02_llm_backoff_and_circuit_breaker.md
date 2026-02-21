# Task: Add Jittered Exponential Backoff & Circuit Breaker for LLM calls (Sub-Epic: 29_8_RISKS)

## Covered Requirements
- [8_RISKS-REQ-120]

## 1. Initial Test Written
- [ ] Create unit tests at tests/llm/backoff.spec.ts and tests/llm/circuit-breaker.spec.ts.
  - backoff.spec.ts: Use Jest fake timers to verify that the retry module waits expected intervals under a sequence of transient failures, and that jitter randomization is within expected bounds. Simulate the LLM endpoint first returning transient 500/429 errors and then a success; assert that the wrapper resolves after N retries.
  - circuit-breaker.spec.ts: Simulate consecutive 5xx/429 failures and assert the circuit opens after the configured threshold, rejects immediately while open, and resets after configured cooldown.
  - Ensure tests run with `npm test -- tests/llm/backoff.spec.ts tests/llm/circuit-breaker.spec.ts`.

## 2. Task Implementation
- [ ] Implement `src/lib/llm/retry.ts` with an exported `retryWithBackoff(fn, opts)` that performs jittered exponential backoff with configurable `initialDelayMs`, `maxDelayMs`, `factor`, `jitterPct`, and `maxAttempts`.
- [ ] Implement `src/lib/llm/circuitBreaker.ts` exporting a `CircuitBreaker` class with method `exec(fn)` and configuration options `failureThreshold`, `cooldownMs`, and `successThreshold`.
- [ ] Integrate `retryWithBackoff` and `CircuitBreaker` into `src/lib/llm/client.ts` so all external LLM calls use these protections by default. Make the integration opt-out via options for tests.
- [ ] Add configuration keys to `config/llm.json` for backoff and circuit-breaker defaults.

## 3. Code Review
- [ ] Confirm the backoff uses safe math (no overflow), caps at `maxDelayMs`, and jitter is seeded per-call.
- [ ] Confirm the circuit breaker is thread/process aware (uses a central store or in-memory with clear docs about single-process assumptions).
- [ ] Confirm tests mock timers and network calls deterministically; ensure the code avoids blocking the event loop during waits.

## 4. Run Automated Tests to Verify
- [ ] Run `npm test -- tests/llm/backoff.spec.ts tests/llm/circuit-breaker.spec.ts` and ensure they pass deterministically.
- [ ] Check coverage reports for the new modules and ensure no uncovered edge conditions.

## 5. Update Documentation
- [ ] Add `docs/risks/llm-backoff-circuit-breaker.md` explaining configuration knobs, recommended production settings, and examples for how the DeveloperAgent should handle `CircuitOpenError` or backoff delays.

## 6. Automated Verification
- [ ] Add a CI step that executes the two new tests and fails the build if the behavior regresses; include a short health-check script `scripts/check-llm-protections.sh` that verifies config keys are present.
