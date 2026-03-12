# Task: Rate-Limit Pattern Coverage Tests (Sub-Epic: 19_Risk 004 Verification)

## Covered Requirements
- [AC-RISK-004-03]

## Dependencies
- depends_on: [none]
- shared_components: [devs-adapters]

## 1. Initial Test Written
- [ ] Create (or update) `devs-adapters/tests/<name>_rate_limit_test.rs` for each of the five adapters (`claude`, `gemini`, `opencode`, `qwen`, `copilot`).
- [ ] Write a test suite that iterates through the specific rate-limit patterns defined in the compatibility table for that adapter.
- [ ] For EACH pattern, verify that `adapter.detect_rate_limit(non_zero_exit, stderr_with_pattern)` returns `true`.
- [ ] Verify that matching is case-insensitive (e.g., "RATE LIMIT" should match "rate limit").
- [ ] Verify that substring matching works (e.g., "The rate limit has been exceeded" should match "rate limit").
- [ ] Ensure tests fail initially if any pattern is missing from the implementation.

## 2. Task Implementation
- [ ] Ensure each adapter implementation in `devs-adapters/src/<name>/rate_limit.rs` (or equivalent) includes all required patterns:
    - `claude`: "rate limit", "429", "overloaded"
    - `gemini`: "quota", "429", "resource_exhausted"
    - `opencode`: "rate limit", "429"
    - `qwen`: "rate limit", "429", "throttle"
    - `copilot`: "rate limit", "429"
- [ ] Verify `detect_rate_limit` uses `to_lowercase()` or similar case-insensitive search logic.
- [ ] Ensure the patterns are stored as a `const &[&str]` to satisfy `[MIT-004]`.

## 3. Code Review
- [ ] Confirm no regex is used for pattern matching to avoid the `regex` dependency in `devs-adapters`.
- [ ] Verify that `detect_rate_limit` still returns `false` if `exit_code == 0` even if a pattern matches (this should be covered by existing tests but verify it).

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-adapters --test '*_rate_limit_test'` and ensure all 5 suites pass.

## 5. Update Documentation
- [ ] Ensure `devs-adapters/README.md` or internal documentation reflects the current list of supported rate-limit patterns.

## 6. Automated Verification
- [ ] Run `./do test` and verify that the requirements traceability tool marks `[AC-RISK-004-03]` as verified.
