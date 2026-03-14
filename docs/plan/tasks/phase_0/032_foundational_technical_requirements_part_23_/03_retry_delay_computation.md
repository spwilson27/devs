# Task: Retry Delay Computation Logic (Sub-Epic: 032_Foundational Technical Requirements (Part 23))

## Covered Requirements
- [2_TAS-REQ-033B]

## Dependencies
- depends_on: ["none"]
- shared_components: ["devs-core (consumer — uses Duration and error types)"]

## 1. Initial Test Written
- [ ] Create a test module in `devs-core` (e.g., `src/retry.rs` tests) with the following test cases written before any implementation:
  1. **`test_fixed_delay_constant_across_attempts`**: `Fixed { initial_delay: 5s }`. Assert attempts 1, 2, 3, 10 all return `Duration::from_secs(5)`.
  2. **`test_exponential_delay_grows`**: `Exponential { initial: 1s, max: 60s }`. Assert attempt 1 → 1s, attempt 2 → 2s, attempt 3 → 4s, attempt 4 → 8s.
  3. **`test_exponential_delay_capped_at_max`**: `Exponential { initial: 1s, max: 10s }`. Assert attempt 5 → 10s (not 16s), attempt 6 → 10s.
  4. **`test_exponential_delay_formula`**: Verify the formula is `min(initial ^ attempt, max)`. For `initial: 2s, max: 120s`: attempt 1 → 2s, attempt 2 → 4s, attempt 3 → 8s, attempt 7 → 120s (capped from 128s).
  5. **`test_linear_delay_grows_linearly`**: `Linear { initial: 3s, max: 30s }`. Assert attempt 1 → 3s, attempt 2 → 6s, attempt 3 → 9s.
  6. **`test_linear_delay_capped_at_max`**: `Linear { initial: 3s, max: 10s }`. Assert attempt 4 → 10s (not 12s), attempt 100 → 10s.
  7. **`test_linear_delay_formula`**: Verify the formula is `min(initial * attempt, max)`. For `initial: 5s, max: 25s`: attempt 1 → 5s, attempt 5 → 25s, attempt 6 → 25s.
  8. **`test_attempt_zero_returns_zero_or_initial`**: For all three strategies, assert attempt 0 returns a sensible value (either 0 or initial_delay — define and document the choice).
  9. **`test_backoff_strategy_serde_roundtrip`**: Serialize and deserialize each variant through `serde_json` and assert equality.

## 2. Task Implementation
- [ ] In `devs-core`, define:
  ```rust
  #[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
  #[serde(tag = "type", rename_all = "snake_case")]
  enum BackoffStrategy {
      Fixed { initial_delay: Duration },
      Exponential { initial: Duration, max: Duration },
      Linear { initial: Duration, max: Duration },
  }
  ```
- [ ] Implement `fn compute_retry_delay(strategy: &BackoffStrategy, attempt: u32) -> Duration` that:
  1. **Fixed**: returns `initial_delay` regardless of attempt number.
  2. **Exponential**: returns `min(initial.as_millis().pow(attempt), max.as_millis())` as a Duration. Use saturating arithmetic to avoid overflow.
  3. **Linear**: returns `min(initial * attempt, max)`. Use saturating multiplication.
- [ ] Add `// Covers: 2_TAS-REQ-033B` annotations to each test function.

## 3. Code Review
- [ ] Verify all arithmetic uses saturating/checked operations — no panics on overflow with large attempt counts.
- [ ] Verify the exponential formula matches the spec: `min(initial^attempt, max)`, not `min(initial * 2^attempt, max)`.
- [ ] Verify `Duration` is used throughout (not raw integers) to prevent unit confusion.
- [ ] Verify serde tag-based serialization produces clean TOML/JSON (e.g., `{"type": "exponential", "initial": ..., "max": ...}`).

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test retry_delay` and confirm all 9 tests pass.
- [ ] Run `cargo clippy --all-targets` and confirm no warnings.

## 5. Update Documentation
- [ ] Add doc comments to `BackoffStrategy` and `compute_retry_delay` with the exact formulas for each variant and examples.

## 6. Automated Verification
- [ ] Run `./do test` and confirm the new tests appear in output and pass.
- [ ] Grep test source for `// Covers: 2_TAS-REQ-033B` and confirm the annotation exists at least once.
