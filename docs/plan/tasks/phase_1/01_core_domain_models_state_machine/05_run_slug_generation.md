# Task: Implement Run Slug Generation and Validation (Sub-Epic: 01_Core Domain Models & State Machine)

## Covered Requirements
- [2_TAS-REQ-030], [2_TAS-REQ-076], [1_PRD-REQ-008]

## Dependencies
- depends_on: ["03_server_state_structure.md"]
- shared_components: [devs-core (Owner)]

## 1. Initial Test Written
- [ ] Create test module `run_slug_tests` in `crates/devs-core/`
- [ ] Write `test_auto_slug_format` that generates a slug with workflow name "my-workflow" and asserts it matches regex `^my-workflow-\d{8}-[a-z0-9]{4}$`
- [ ] Write `test_auto_slug_character_set` that generates a slug and asserts every character is in `[a-z0-9-]`
- [ ] Write `test_auto_slug_max_length_128` that generates a slug with a very long workflow name (200 chars) and asserts the result is at most 128 bytes
- [ ] Write `test_auto_slug_non_alphanumeric_replacement` that uses a workflow name with special characters like "My Workflow!" and asserts they are replaced/collapsed (e.g., "my-workflow-")
- [ ] Write `test_auto_slug_date_component` that generates a slug and asserts the date portion matches today's date in YYYYMMDD format
- [ ] Write `test_auto_slug_randomness` that generates two slugs for the same workflow and asserts they differ (the 4-char random suffix)
- [ ] Write `test_user_provided_name_preserved` that submits a run with name "custom-run" and asserts the slug is "custom-run" (not auto-generated)
- [ ] Write `test_duplicate_slug_rejected` that registers a slug, then attempts to register the same slug again and asserts `DuplicateRunName` error
- [ ] Write `test_slug_unicode_normalization` that uses a workflow name with unicode chars and asserts they are stripped/replaced to produce valid `[a-z0-9-]+`

## 2. Task Implementation
- [ ] Create `crates/devs-core/src/slug.rs`
- [ ] Implement `generate_run_slug(workflow_name: &str) -> String` that:
  1. Lowercases the workflow name
  2. Replaces non-alphanumeric characters with `-`
  3. Collapses consecutive `-` into one
  4. Appends `-YYYYMMDD-XXXX` where XXXX is 4 random lowercase alphanumeric chars
  5. Truncates to 128 bytes
- [ ] Implement `validate_run_slug(slug: &str) -> Result<(), SlugError>` that checks: non-empty, matches `[a-z0-9-]+`, max 128 bytes
- [ ] Define `SlugError` enum with variants: `Empty`, `TooLong`, `InvalidCharacters`
- [ ] Define `DuplicateRunName` error type
- [ ] Implement `RunSlugRegistry` (or a method on `ServerState`) with `register_slug(&mut self, project: &str, slug: &str) -> Result<(), DuplicateRunName>` that checks uniqueness within a project
- [ ] Add `pub mod slug;` to `crates/devs-core/src/lib.rs`
- [ ] Add doc comments referencing [2_TAS-REQ-030] and [2_TAS-REQ-076]

## 3. Code Review
- [ ] Verify slug format exactly matches `<workflow-name>-<YYYYMMDD>-<4 random lowercase alphanum>` per [2_TAS-REQ-076]
- [ ] Verify truncation preserves the random suffix (truncate the workflow name portion, not the suffix)
- [ ] Verify duplicate detection works within project scope per [1_PRD-REQ-008]
- [ ] Verify no `unsafe` code

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-core -- run_slug` and verify all tests pass
- [ ] Run `cargo clippy -p devs-core -- -D warnings`

## 5. Update Documentation
- [ ] Add doc comments on `generate_run_slug` describing the algorithm and format

## 6. Automated Verification
- [ ] Run `cargo test -p devs-core -- run_slug --nocapture 2>&1 | tail -5` and confirm "test result: ok"
