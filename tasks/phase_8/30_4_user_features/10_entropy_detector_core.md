# Task: Implement EntropyDetector Core (SHA-256 Observation Hashing) (Sub-Epic: 30_4_USER_FEATURES)

## Covered Requirements
- [4_USER_FEATURES-REQ-022]

## 1. Initial Test Written
- [ ] Create unit tests in `src/entropy/__tests__/detector.test.ts`:
  - Test that `EntropyDetector.hash(outputString)` produces deterministic SHA-256 hex string for identical inputs.
  - Test that `EntropyDetector.record(hash)` stores the hash in a bounded recent-history queue and returns the current frequency for that hash.
  - Test that when frequency for a hash crosses the configured threshold (e.g., 3 repeats), the detector emits an event or returns a signal to trigger pivoting.
- [ ] Create integration tests that simulate sequences of agent outputs and assert the detector flags repeated patterns when they occur within a sliding time window.

## 2. Task Implementation
- [ ] Implement `src/entropy/detector.ts` exporting `EntropyDetector` with methods:
  - `hash(output: string): string` — canonicalize whitespace, normalize dynamic tokens (timestamps, UUIDs) via regex, then compute SHA-256 hex.
  - `recordObservation(agentId: string, output: string): Promise<{ hash, count, triggered }>` — store hash in a compact bounded cache (SQLite table `entropy_observations` or in-memory LRU) with timestamps and return whether threshold exceeded.
  - Provide configuration for window size, threshold, and normalization rules.
- [ ] Emit structured events (`entropy:threshold_exceeded`) with contextual payload `{ agentId, hash, count, recentOutputs }` so other components (StrategyPivotAgent) can subscribe.

## 3. Code Review
- [ ] Ensure normalization rules are configurable and include safe defaults to mask timestamps and UUID-like tokens to reduce false negatives.
- [ ] Verify the storage backend supports persistence across restarts if configured; otherwise, document ephemeral mode.
- [ ] Confirm the detector is performant: hashing is CPU-light and queue operations are O(1) per insert.

## 4. Run Automated Tests to Verify
- [ ] Run `npm test -- --testPathPattern="entropy.detector"` and ensure tests pass.
- [ ] Run a performance microbenchmark test simulating 1000 observations/sec and assert memory growth is bounded.

## 5. Update Documentation
- [ ] Add `docs/entropy/DETECTOR.md` describing normalization rules, configuration parameters (threshold, window), and emitted event schema.
- [ ] Add an ops note for tuning thresholds for different project sizes.

## 6. Automated Verification
- [ ] CI test that simulates repeated failing outputs and asserts an `entropy:threshold_exceeded` event is emitted within expected time.
- [ ] Add a regression test ensuring normalization prevents trivial timestamp differences from defeating detection.
