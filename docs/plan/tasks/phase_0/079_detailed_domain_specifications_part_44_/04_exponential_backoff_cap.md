# Task: Exponential Backoff Cap Validation (Sub-Epic: 079_Detailed Domain Specifications (Part 44))

## Covered Requirements
- [2_TAS-REQ-473]

## Dependencies
- depends_on: ["03_retry_attempt_limits.md"]
- shared_components: ["devs-core (Consumer — extend RetryConfig validation)"]

## 1. Initial Test Written
- [ ] In the module containing `RetryConfig`, write a test module `tests::exponential_backoff_cap` with these tests:
  - `test_exponential_no_max_delay_uses_300s_cap`: Create `RetryConfig { backoff: Backoff::Exponential, initial_delay: Duration::from_secs(2), max_delay: None, max_attempts: 5 }`. Call `effective_max_delay()` and assert it returns `Duration::from_secs(300)`.
  - `test_exponential_with_explicit_max_delay_uses_it`: Set `max_delay = Some(Duration::from_secs(60))`. Assert `effective_max_delay()` returns 60s.
  - `test_initial_delay_zero_rejected`: Set `initial_delay = Duration::from_secs(0)`. Assert validation error indicating minimum 1 second.
  - `test_initial_delay_subsecond_rejected`: Set `initial_delay = Duration::from_millis(999)`. Assert validation error.
  - `test_initial_delay_1s_accepted`: Set `initial_delay = Duration::from_secs(1)`. Assert validation succeeds.
  - `test_fixed_backoff_no_max_delay_no_cap_applied`: Create with `backoff: Backoff::Fixed`, `max_delay: None`. Assert `effective_max_delay()` returns `None` (cap only applies to exponential).
- [ ] Add `// Covers: 2_TAS-REQ-473` annotation to each test.

## 2. Task Implementation
- [ ] Define `const DEFAULT_EXPONENTIAL_MAX_DELAY: Duration = Duration::from_secs(300);`.
- [ ] Define `enum Backoff { Fixed, Exponential }`.
- [ ] Add method `RetryConfig::effective_max_delay(&self) -> Option<Duration>`:
  - If `backoff == Exponential` and `max_delay.is_none()`, return `Some(DEFAULT_EXPONENTIAL_MAX_DELAY)`.
  - If `backoff == Exponential` and `max_delay.is_some()`, return `max_delay`.
  - Otherwise return `max_delay` (which may be `None`).
- [ ] In `RetryConfig::validate()`, add: if `initial_delay < Duration::from_secs(1)`, return error `MinimumViolation { field: "initial_delay", minimum: "1 second", actual: initial_delay }`.

## 3. Code Review
- [ ] Verify the 300-second cap is a named constant.
- [ ] Verify `effective_max_delay()` is a pure function with no side effects.
- [ ] Verify `initial_delay` validation uses `>=` comparison against exactly 1 second (not 1000ms with floating point).

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-core -- exponential_backoff_cap` and confirm all tests pass.

## 5. Update Documentation
- [ ] Add doc comments to `effective_max_delay()` explaining the 300s default cap for exponential backoff, referencing `2_TAS-REQ-473`.
- [ ] Add doc comment to `initial_delay` field documenting the ≥1s constraint.

## 6. Automated Verification
- [ ] Run `cargo test -p devs-core` and confirm zero failures.
- [ ] Run `grep -r "Covers: 2_TAS-REQ-473" crates/devs-core/` and confirm at least one match.
