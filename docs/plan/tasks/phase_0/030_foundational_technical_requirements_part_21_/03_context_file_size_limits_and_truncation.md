# Task: Implement Context File Size Limits and Truncation (Sub-Epic: 030_Foundational Technical Requirements (Part 21))

## Covered Requirements
- [2_TAS-REQ-023B]

## Dependencies
- depends_on: ["02_context_file_schema_and_dependency_scope.md"]
- shared_components: ["devs-core (consumer — extends context file module)"]

## 1. Initial Test Written
- [ ] Write a unit test `test_context_file_under_size_limit_not_truncated` that creates a `ContextFile` with small stage outputs (total serialized < 10 MiB), calls the enforcement function, and verifies all `truncated` flags are `false` and content is unchanged.
- [ ] Write a unit test `test_context_file_over_size_limit_truncates_proportionally` that creates a `ContextFile` with two stages where `stdout` fields total > 10 MiB. Verify after enforcement: (a) total serialized size <= 10 MiB, (b) `truncated` flag is `true` on entries whose fields were shortened, (c) both stages' `stdout` fields are truncated roughly proportionally to their original sizes.
- [ ] Write a unit test `test_context_file_truncation_preserves_structured_output` that verifies `structured_output` fields are NOT truncated — only `stdout` and `stderr` are subject to truncation.
- [ ] Write a unit test `test_context_file_truncation_logs_warning` using a test logger or log capture to verify a `WARN`-level log is emitted when truncation occurs.
- [ ] Write a unit test `test_context_file_exactly_at_limit` with content that serializes to exactly 10 MiB and verify no truncation occurs.
- [ ] Write a unit test `test_size_limit_constant` verifying `CONTEXT_FILE_MAX_SIZE` equals `10 * 1024 * 1024`.

## 2. Task Implementation
- [ ] In `crates/devs-core/src/context_file.rs`, define `pub const CONTEXT_FILE_MAX_SIZE: usize = 10 * 1024 * 1024;`.
- [ ] Implement `pub fn enforce_size_limit(context: &mut ContextFile) -> bool` that: (1) serializes to JSON and checks size, (2) if over limit, calculates how many bytes to remove, (3) identifies all `stdout` and `stderr` fields and their sizes, (4) truncates them proportionally so the total fits within 10 MiB, (5) sets `truncated = true` on affected entries, (6) emits a `tracing::warn!` log with the original and truncated sizes, (7) returns `true` if truncation was applied.
- [ ] Ensure proportional truncation: if stage A has 6 MiB stdout and stage B has 4 MiB stdout and we need to remove 2 MiB total, stage A loses ~1.2 MiB and stage B loses ~0.8 MiB.
- [ ] Add `// Covers: 2_TAS-REQ-023B` annotation to all test functions.

## 3. Code Review
- [ ] Verify truncation math handles edge cases: single oversized field, all fields empty except one, many stages with small fields.
- [ ] Verify `tracing` is the logging framework used (not `log` or `println!`).
- [ ] Verify no panic paths on serialization failure.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-core -- context_file` and confirm all tests pass.

## 5. Update Documentation
- [ ] Add doc comments to `enforce_size_limit` explaining the 10 MiB limit, proportional truncation strategy, and WARN log behavior.

## 6. Automated Verification
- [ ] Run `cargo test -p devs-core -- context_file` and verify exit code 0.
- [ ] Run `grep -r "Covers: 2_TAS-REQ-023B" crates/devs-core/` and verify at least one match.
