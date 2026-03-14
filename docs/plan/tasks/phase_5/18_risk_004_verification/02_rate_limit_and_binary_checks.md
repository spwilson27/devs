# Task: Enhanced Rate-Limit Detection and Binary Presence Validation (Sub-Epic: 18_Risk 004 Verification)

## Covered Requirements
- [RISK-004-BR-004], [AC-RISK-004-02]

## Dependencies
- depends_on: []
- shared_components: [devs-adapters]

## 1. Initial Test Written
- [ ] Add unit tests in `crates/devs-adapters/src/rate_limit.rs` that:
    - Exercise `detect_rate_limit()` with case-insensitive variations of known rate-limit strings.
    - Verify that substring matching (not regex) is used.
- [ ] Add an integration test in `crates/devs-adapters/tests/missing_binary_test.rs` that:
    - Spawns an agent with a non-existent binary path (e.g., `/usr/bin/not-real-adapter`).
    - Asserts that the spawn fails with a `failure_reason: "binary_not_found"` within 100ms.
    - Verifies that no retry is performed.

## 2. Task Implementation
- [ ] Update `devs-adapters` common rate-limit detection logic:
    - Implement a case-insensitive substring search for rate-limit patterns in stderr.
    - Ensure `regex` is not used and not added to `Cargo.toml`.
- [ ] Update the `AgentAdapter::spawn` implementation:
    - Perform a pre-spawn check for binary existence using `which` crate or `std::fs::metadata`.
    - If the binary is missing or not executable, immediately return an error mapped to `failure_reason: "binary_not_found"`.
    - Ensure this check is performed synchronously before any PTY or async task is spawned.

## 3. Code Review
- [ ] Verify that `binary_not_found` error is correctly handled by the scheduler's retry logic (it should be treated as non-retryable per [3_PRD-BR-021]).
- [ ] Ensure that the rate-limit pattern matching is efficient (avoid unnecessary string allocations).
- [ ] Confirm `regex` crate is NOT present in `devs-adapters/Cargo.toml`.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test --package devs-adapters`.
- [ ] Run `cargo test --package devs-adapters --test missing_binary_test`.

## 5. Update Documentation
- [ ] Update `GEMINI.md` memory to reflect the new `binary_not_found` handling and case-insensitive rate-limiting.

## 6. Automated Verification
- [ ] Run `grep "regex" crates/devs-adapters/Cargo.toml` and ensure it returns nothing.
- [ ] Run `grep -ri "substring" crates/devs-adapters/src` or verify the implementation uses `.contains()` for pattern matching.
