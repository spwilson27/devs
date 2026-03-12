# Task: Implement RunSlug Format Validation (Sub-Epic: 087_Detailed Domain Specifications (Part 52))

## Covered Requirements
- [2_TAS-REQ-510]

## Dependencies
- depends_on: [none]
- shared_components: [devs-core]

## 1. Initial Test Written
- [ ] Create a unit test in `crates/devs-core/src/domain/run_slug.rs` (or equivalent) that:
    - Verifies `RunSlug::generate("my-workflow", NaiveDate::from_ymd(2024, 1, 15))` produces a string matching `my-workflow-20240115-[a-z0-9]{4}`.
    - Verifies that `RunSlug` validation rejects slugs longer than 128 characters.
    - Verifies that `RunSlug` validation rejects slugs with invalid characters or date formats.
    - Verifies that the random suffix is indeed present and 4 characters long.

## 2. Task Implementation
- [ ] Implement the `RunSlug` struct in `devs-core`.
- [ ] Implement `FromStr` and `Display` for `RunSlug`.
- [ ] Implement a `generate` method:
    - Sanitize the workflow name (lowercase, replace invalid chars with hyphens).
    - Format the provided date as `YYYYMMDD`.
    - Generate 4 random hexadecimal characters using the `rand` crate.
    - Concatenate: `{sanitized_name}-{date}-{suffix}`.
- [ ] Add validation logic in the constructor to enforce the 128-character limit and character set constraints.
- [ ] Ensure `RunSlug` is used in `WorkflowRun` and related gRPC messages via `devs-proto`.

## 3. Code Review
- [ ] Verify that `chrono` and `rand` are used correctly for deterministic date formatting and random suffix generation.
- [ ] Ensure the validation logic is performant (e.g., uses a pre-compiled Regex or manual scan).
- [ ] Check that the error types for failed validation are consistent with `devs-core` error patterns.

## 4. Run Automated Tests to Verify
- [ ] Execute `./do test --package devs-core` and ensure all `RunSlug` tests pass.

## 5. Update Documentation
- [ ] Update `devs-core` internal documentation to reflect the `RunSlug` format and constraints.

## 6. Automated Verification
- [ ] Run `cargo test` and verify that the test output includes successful execution of `RunSlug` validation tests.
- [ ] Verify traceability annotations are present: `/// Verifies [2_TAS-REQ-510]`.
