# Task: SecretMasker Latency Benchmarking and TDD Green-Phase Performance Gate (Sub-Epic: 22_Agent Identity and Conflict Resolution)

## Covered Requirements
- [5_SECURITY_DESIGN-REQ-SEC-RSK-002]

## 1. Initial Test Written
- [ ] Create `src/security/masking/__tests__/SecretMasker.perf.test.ts`.
- [ ] Write a performance test `should mask a 10KB string in under 5ms (p99)` that generates a 10,240-character string containing 50 embedded synthetic secrets, runs `maskString(input)` 1,000 times, collects timing samples via `performance.now()`, computes the p99 latency, and asserts `p99 < 5` ms. Fail the test if the assertion is not met.
- [ ] Write a performance test `should mask a 100KB string in under 50ms (p99)` using a 102,400-character payload with 200 embedded secrets, running 200 iterations, asserting `p99 < 50` ms.
- [ ] Write a unit test `should not add masking overhead that causes the TDD green-phase to exceed its time budget` — mock a TDD green-phase execution that takes 8,000ms total and assert that `SecretMasker` latency measured by wrapping the mock adds no more than 50ms overhead (i.e., total ≤ 8,050ms).
- [ ] Write a regression test `should produce correct output even at high throughput` — pipe 100 concurrent `maskString` calls with `Promise.all` and assert all return the correctly redacted strings (no corruption from shared state).

## 2. Task Implementation
- [ ] Open `src/security/masking/SecretMasker.ts`.
- [ ] Profile the current `maskString` implementation to identify the bottleneck (likely repeated regex construction per call or sequential entropy scanning).
- [ ] Cache compiled `RegExp` objects as class-level constants so they are not reconstructed on every `maskString` invocation.
- [ ] If the entropy scanner (Shannon entropy > 4.5 heuristic) iterates character-by-character in a synchronous loop over the whole string, refactor to use a sliding-window buffer approach that processes the string in 64-byte chunks and exits early once a high-entropy span is confirmed.
- [ ] Ensure `maskString` is a pure function with no shared mutable state so concurrent calls via `Promise.all` are safe.
- [ ] Add a `MaskingMetrics` struct that is optionally returned when `{ metrics: true }` is passed as an option: `{ inputLength: number; secretCount: number; durationMs: number }`. This struct feeds the performance monitoring dashboard.
- [ ] Integrate `MaskingMetrics` emission into the existing `TelemetryService` (`src/telemetry/TelemetryService.ts`) so every `maskString` call records its duration under the metric key `secret_masker.duration_ms` with a histogram bucket.
- [ ] Add `// REQ: 5_SECURITY_DESIGN-REQ-SEC-RSK-002` inline comment above the `maskString` method signature.

## 3. Code Review
- [ ] Verify the cached `RegExp` objects are defined as `private static readonly` fields on the class (not module-level globals), preventing them from leaking across test suites.
- [ ] Confirm the sliding-window entropy scan does not mutate the input string — operate on read-only index offsets.
- [ ] Ensure `MaskingMetrics` is only allocated when `{ metrics: true }` is passed (avoid object allocation overhead in the hot path).
- [ ] Confirm the `TelemetryService.record` call is non-blocking (fire-and-forget, wrapped in a `void` expression) so telemetry cannot slow down the masking hot path.
- [ ] Verify the performance tests set `jest.setTimeout` to at least 30,000ms to prevent false failures on slow CI runners.

## 4. Run Automated Tests to Verify
- [ ] Run `npm test -- --testPathPattern=SecretMasker.perf` and confirm all performance tests pass (p99 latency within thresholds).
- [ ] Run `npm test -- --testPathPattern=SecretMasker` (all masking tests) to confirm no regression in correctness tests introduced by the optimization.
- [ ] Run `npm run lint` and confirm zero errors in `src/security/masking/`.
- [ ] Run `npm run build` and confirm zero TypeScript compilation errors.

## 5. Update Documentation
- [ ] Update `docs/security/secret-masking.md` with a `## Performance Characteristics` section that documents the p99 latency targets (5ms / 10KB, 50ms / 100KB), the caching strategy for regex objects, and the `MaskingMetrics` option. Reference `5_SECURITY_DESIGN-REQ-SEC-RSK-002`.
- [ ] Update `docs/architecture/telemetry.md` to list `secret_masker.duration_ms` as a tracked histogram metric with its collection point and interpretation guidance.

## 6. Automated Verification
- [ ] Run `npm test -- --testPathPattern=SecretMasker.perf --coverage` and assert line coverage for the optimized code paths in `SecretMasker.ts` is ≥ 85%.
- [ ] Run `grep -rn "5_SECURITY_DESIGN-REQ-SEC-RSK-002" src/` and confirm at least one match exists in `SecretMasker.ts`.
- [ ] In CI, run the performance test suite with `--forceExit` and assert the exit code is `0`, ensuring no hanging async handles from `TelemetryService` calls.
