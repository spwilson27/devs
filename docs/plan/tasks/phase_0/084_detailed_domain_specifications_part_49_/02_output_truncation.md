# Task: Stage Output Truncation to 1 MiB with Warning Log (Sub-Epic: 084_Detailed Domain Specifications (Part 49))

## Covered Requirements
- [2_TAS-REQ-496]

## Dependencies
- depends_on: [none]
- shared_components: [devs-core (consume — StageOutput type), devs-scheduler (consume — stage completion handler)]

## 1. Initial Test Written
- [ ] In `crates/devs-core/src/stage_output/tests.rs` (or equivalent), write `test_stdout_truncation_at_2mib`:
  1. Construct a `StageOutput` with a `stdout` field containing exactly 2,097,152 bytes (2 MiB) of known data (e.g., repeating pattern `"ABCDEFGHIJ"` to fill the buffer).
  2. Pass it through the truncation/finalization logic.
  3. Assert `stdout.len() == 1_048_576` (exactly 1 MiB).
  4. Assert the retained bytes are the **last** 1,048,576 bytes of the original (verify by checking the tail pattern matches).
  5. Assert `truncated == true`.
- [ ] Write `test_stdout_no_truncation_under_limit`:
  1. Construct a `StageOutput` with `stdout` of exactly 1,048,576 bytes (at the limit).
  2. Assert `stdout` is unchanged and `truncated == false`.
- [ ] Write `test_stdout_truncation_logs_warning`:
  1. Set up a `tracing` test subscriber or `tracing_test::TracingSubscriber` to capture log events.
  2. Process a 2 MiB stdout through the truncation logic.
  3. Assert a `WARN`-level log event was emitted containing the original byte count (`2097152` or `2,097,152`).
- [ ] Write `test_stdout_truncation_preserves_utf8_boundary`:
  1. Construct stdout with multi-byte UTF-8 characters near the 1 MiB boundary.
  2. Verify truncation does not split a multi-byte character (truncate to the nearest valid UTF-8 boundary before 1 MiB, or treat as raw bytes per design decision).

## 2. Task Implementation
- [ ] Define `const MAX_STDOUT_BYTES: usize = 1_048_576;` in `devs-core`.
- [ ] Implement a `fn finalize_output(raw_stdout: Vec<u8>) -> StageOutput` (or equivalent method) that:
  1. Checks `raw_stdout.len() > MAX_STDOUT_BYTES`.
  2. If over limit: slices from `raw_stdout.len() - MAX_STDOUT_BYTES` to end, sets `truncated = true`, emits `tracing::warn!("Stage stdout truncated: original length {} bytes, retained last {} bytes", original_len, MAX_STDOUT_BYTES)`.
  3. If within limit: keeps stdout as-is, sets `truncated = false`.
- [ ] Ensure the `StageOutput` struct has a `truncated: bool` field.
- [ ] Add `// Covers: 2_TAS-REQ-496` annotation to each test.

## 3. Code Review
- [ ] Verify truncation takes the **tail** (last N bytes), not the head, as the requirement specifies.
- [ ] Confirm the constant is exactly `1_048_576` bytes (not KiB shorthand that could be wrong).
- [ ] Verify no unnecessary allocation — use `Vec::split_off` or slice-then-to-vec to avoid copying 2x.
- [ ] Check the WARN log includes the original length in bytes as required.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-core -- truncat` and verify all truncation tests pass.

## 5. Update Documentation
- [ ] Add doc comment on the `finalize_output` function describing the 1 MiB truncation policy.

## 6. Automated Verification
- [ ] Run `./do test` and confirm zero failures.
- [ ] Grep test files for `// Covers: 2_TAS-REQ-496` to verify traceability annotation is present.
