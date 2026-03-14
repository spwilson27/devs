# Task: RunSlug Format Validation and Acceptance Tests (Sub-Epic: 087_Detailed Domain Specifications (Part 52))

## Covered Requirements
- [2_TAS-REQ-510]

## Dependencies
- depends_on: none
- shared_components: [devs-core]

## 1. Initial Test Written
- [ ] In `crates/devs-core/src/types/` (or wherever `RunSlug` is defined), create a test module `tests::run_slug_format` with the following tests:
  - `test_slug_from_workflow_name_and_date`: construct a `RunSlug` from workflow name `"my-workflow"` and a fixed date `2024-01-15`. Assert the result matches regex `^my-workflow-20240115-[a-z0-9]{4}$`.
  - `test_slug_max_length_128`: generate a slug from a workflow name that is 120 characters long. Assert the resulting slug is ≤ 128 characters total (the generator must truncate the workflow-name prefix to fit).
  - `test_slug_sanitizes_special_characters`: generate a slug from workflow name `"My Workflow!!"`. Assert the slug contains only `[a-z0-9-]` characters.
  - `test_slug_uniqueness`: generate two slugs from the same workflow name and date in quick succession. Assert they differ (the random suffix provides uniqueness).
  - `test_slug_empty_workflow_name_rejected`: attempt to create a slug from an empty workflow name. Assert an error is returned.

## 2. Task Implementation
- [ ] Implement or update the `RunSlug` type in `devs-core` with a constructor `RunSlug::generate(workflow_name: &str, timestamp: DateTime<Utc>) -> Result<RunSlug, CoreError>`:
  - Sanitize the workflow name: lowercase, replace non-alphanumeric characters with `-`, collapse consecutive dashes, trim leading/trailing dashes.
  - Format the date portion as `YYYYMMDD`.
  - Generate a 4-character random alphanumeric suffix (`[a-z0-9]{4}`).
  - Concatenate as `{sanitized_name}-{date}-{suffix}`.
  - If the result exceeds 128 characters, truncate the sanitized name portion to fit within the limit while preserving the `-{date}-{suffix}` suffix (13 characters).
  - Reject empty workflow names with an appropriate error variant.
- [ ] Ensure `RunSlug` implements `Display`, `Debug`, `Clone`, `PartialEq`, `Eq`, `Hash`.
- [ ] Add `// Covers: 2_TAS-REQ-510` annotation to all test functions.

## 3. Code Review
- [ ] Verify the slug regex pattern `^[a-z0-9]([a-z0-9-]*[a-z0-9])?-\d{8}-[a-z0-9]{4}$` is satisfied by all generated slugs.
- [ ] Confirm the 128-character maximum is enforced even with very long workflow names.
- [ ] Ensure no `unwrap()` calls in production code paths.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-core -- run_slug_format` and confirm all tests pass.

## 5. Update Documentation
- [ ] Add doc comments to `RunSlug::generate` describing the format contract and 128-character limit.

## 6. Automated Verification
- [ ] Run `cargo test -p devs-core -- run_slug_format --no-fail-fast 2>&1 | tail -20` and verify exit code 0 with all tests passing.
