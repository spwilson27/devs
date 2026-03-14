# Task: Stage Output Truncation Logic (Sub-Epic: 082_Detailed Domain Specifications (Part 47))

## Covered Requirements
- [2_TAS-REQ-487]

## Dependencies
- depends_on: []
- shared_components: [devs-core (consumer)]

## 1. Initial Test Written
- [ ] In `crates/devs-core/tests/output_truncation.rs`, create the following tests:
- [ ] `test_stdout_under_limit_not_truncated`: Create a `StageOutput` with 500 KiB stdout and 500 KiB stderr. Assert `truncated == false` and both fields are unchanged.
- [ ] `test_stdout_over_limit_truncated_to_tail`: Create stdout of 2 MiB. After truncation, assert stdout length is exactly 1,048,576 bytes and contains the **last** 1,048,576 bytes of the original (tail preservation). Assert `truncated == true`.
- [ ] `test_stderr_over_limit_truncated_to_tail`: Same as above but for stderr exceeding 1 MiB.
- [ ] `test_both_over_limit_truncated_independently`: Both stdout (1.5 MiB) and stderr (1.5 MiB) exceed limits. Assert each is independently truncated to 1 MiB. Assert `truncated == true`.
- [ ] `test_exactly_at_limit_not_truncated`: stdout and stderr each exactly 1,048,576 bytes. Assert `truncated == false`.
- [ ] `test_truncation_logs_warning`: Capture log output using `tracing_subscriber::fmt::TestWriter` or equivalent. Verify a `WARN`-level message matching `"stage <name> output truncated: stdout=<original_len> stderr=<original_len>"` is emitted when truncation occurs.

## 2. Task Implementation
- [ ] Add a `truncated: bool` field to the `StageOutput` struct in `devs-core` if not already present.
- [ ] Implement a function `truncate_output(stage_name: &str, output: &mut StageOutput)` in `devs-core` that:
  1. Checks `output.stdout.len()` against `1_048_576`.
  2. If over: replaces stdout with its last 1,048,576 bytes, sets `output.truncated = true`.
  3. Checks `output.stderr.len()` against `1_048_576`.
  4. If over: replaces stderr with its last 1,048,576 bytes, sets `output.truncated = true`.
  5. If any truncation occurred: logs `tracing::warn!("stage {stage_name} output truncated: stdout={orig_stdout_len} stderr={orig_stderr_len}")`.
- [ ] Call `truncate_output` at the point where stage output is stored (before persisting to `StageOutput` struct in the completion handler).

## 3. Code Review
- [ ] Verify truncation keeps the **tail** (last N bytes), not the head — most recent output is most relevant for completion detection.
- [ ] Verify the 1 MiB limit is per-stream, not combined.
- [ ] Verify `truncated` flag is only set when actual truncation occurs.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-core output_truncation` and confirm all tests pass.

## 5. Update Documentation
- [ ] Add `// Covers: 2_TAS-REQ-487` annotation to each test function.

## 6. Automated Verification
- [ ] Run `cargo test -p devs-core output_truncation -- --nocapture 2>&1 | grep -E "test result:.*passed"` and verify 0 failures.
