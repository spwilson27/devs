# Task: Implement Context File Truncation (Sub-Epic: 085_Detailed Domain Specifications (Part 50))

## Covered Requirements
- [2_TAS-REQ-502]

## Dependencies
- depends_on: [none]
- shared_components: [devs-core, devs-executor]

## 1. Initial Test Written
- [ ] In `devs-core/src/context.rs` (or a new module for context file building), write `test_context_file_under_limit_not_truncated`:
  - Build a context with 3 stages, each with small stdout/stderr (< 1 KiB).
  - Call `ContextFileBuilder::build()`.
  - Assert the output size is well under 10 MiB.
  - Assert all stages have `truncated: false`.
- [ ] Write `test_context_file_exceeding_limit_truncated_to_10mib`:
  - Build a context with 3 stages, each with ~5 MiB of stdout data (total ~15 MiB).
  - Call `ContextFileBuilder::build()`.
  - Assert the serialized JSON output is ≤ 10 MiB (10 * 1024 * 1024 bytes).
  - Assert all 3 stages have `truncated: true`.
- [ ] Write `test_truncation_is_proportional`:
  - Build a context with 2 stages: stage A has 8 MiB stdout, stage B has 4 MiB stdout.
  - After truncation, assert the ratio of truncated lengths is approximately 2:1 (stage A gets ~2x the bytes of stage B).
  - Assert both stages have `truncated: true`.
- [ ] Write `test_truncation_emits_warn_log`:
  - Use `tracing_test` or a log capture mechanism.
  - Build an over-limit context.
  - Assert a WARN-level log was emitted containing a message about context file truncation.
- [ ] Write `test_empty_stages_not_affected_by_truncation`:
  - Build a context with 1 stage having 12 MiB stdout and 1 stage with empty stdout/stderr.
  - After truncation, the empty stage should have `truncated: false`.
- [ ] Add `// Covers: 2_TAS-REQ-502` annotation to all test functions.

## 2. Task Implementation
- [ ] Create a `ContextFileBuilder` struct in `devs-core/src/context.rs` (or `devs-executor` if context file generation belongs there).
- [ ] Define constant `const MAX_CONTEXT_FILE_SIZE: usize = 10 * 1024 * 1024;` (10 MiB).
- [ ] Implement `ContextFileBuilder::build(stages: &[StageOutput]) -> ContextFile`:
  1. Serialize all stage outputs to JSON to compute the total size.
  2. If total ≤ `MAX_CONTEXT_FILE_SIZE`, return as-is with all `truncated: false`.
  3. If total > limit, compute the overhead (metadata/structure bytes excluding stdout/stderr content).
  4. Compute the available budget = `MAX_CONTEXT_FILE_SIZE - overhead`.
  5. Distribute budget proportionally across stages based on their original `stdout.len() + stderr.len()`.
  6. Truncate each stage's `stdout` and `stderr` to their proportional share (truncate from the beginning, keeping the tail — or from the end, keeping the head; document which).
  7. Set `truncated: true` for each stage whose data was shortened.
  8. Emit `tracing::warn!("context file truncated: {} stages affected, original size {} bytes", count, original_size)`.
- [ ] Add a `truncated: bool` field to the per-stage entry in the context file JSON schema (in `ContextFileStageEntry` or equivalent struct).

## 3. Code Review
- [ ] Verify proportional truncation math: stages with 0 bytes of output should not receive budget and should not be marked truncated.
- [ ] Ensure the final serialized output genuinely fits in 10 MiB (account for JSON escaping of truncated content).
- [ ] Verify the WARN log includes actionable information (original size, number of affected stages).
- [ ] Confirm `devs-core` has no new runtime dependencies if the builder lives there.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-core -- context` (or `-p devs-executor` depending on placement).

## 5. Update Documentation
- [ ] Add doc comment on `ContextFileBuilder` explaining the 10 MiB limit and proportional truncation strategy.
- [ ] Document the `truncated` field in the context file JSON schema.

## 6. Automated Verification
- [ ] Run `./do test` and verify that `target/traceability.json` includes `2_TAS-REQ-502` as covered.
- [ ] Run `./do lint` to confirm no clippy warnings or formatting issues.
