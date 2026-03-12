# Task: Timestamp Generation Utility and Policy (Sub-Epic: 035_Foundational Technical Requirements (Part 26))

## Covered Requirements
- [2_TAS-REQ-086L]

## Dependencies
- depends_on: [none]
- shared_components: [devs-core]

## 1. Initial Test Written
- [ ] Create unit tests in `devs-core` for a new timestamp utility module:
    - Test that the utility function for wall-clock timestamps always returns `chrono::DateTime<Utc>`.
    - Test that the utility function for wall-clock timestamps matches the current system time (within reasonable precision).
    - Test that monotonic clocks (e.g., `std::time::Instant`) are only used for elapsed time measurements, not for absolute timestamps.
    - Create a test that verifies stored timestamps are consistently in UTC.

## 2. Task Implementation
- [ ] Create a `timestamp` module in `devs-core`.
- [ ] Implement a utility function (e.g., `devs_core::timestamp::now()`) that wraps `chrono::Utc::now()`.
- [ ] Add a policy (e.g., as a module-level doc comment or a trait) that enforces the use of wall-clock UTC for all storage-related timestamps.
- [ ] Ensure any domain types that use timestamps (e.g., in `devs-core`) use this utility.
- [ ] (Optional but recommended) Add a custom lint or a simple `grep` check in `./do lint` to ensure `chrono::Local` is not used in the codebase.

## 3. Code Review
- [ ] Verify that all timestamp generation in `devs-core` (and other crates if applicable) uses the new utility.
- [ ] Ensure monotonic clocks are only used for duration/elapsed-time calculations.
- [ ] Confirm that stored timestamps are wall-clock UTC as required.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-core` to verify the timestamp utility.
- [ ] Ensure all existing tests pass with the new utility.

## 5. Update Documentation
- [ ] Add doc comments to the `timestamp` module explaining the project policy on wall-clock vs. monotonic clocks.
- [ ] Update the `devs-core` README to reflect the timestamp generation standards.

## 6. Automated Verification
- [ ] Run `./do lint` to ensure the new utility and its usage follow the project standards.
- [ ] Verify that no instances of `chrono::Local` or non-UTC wall-clock generation exist in the codebase.
