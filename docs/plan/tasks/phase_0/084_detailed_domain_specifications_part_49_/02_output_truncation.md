# Task: Output Truncation Acceptance (Sub-Epic: 084_Detailed Domain Specifications (Part 49))

## Covered Requirements
- [2_TAS-REQ-496]

## Dependencies
- depends_on: [none]
- shared_components: [devs-core, devs-scheduler]

## 1. Initial Test Written
- [ ] Create a unit test in `devs-core` that mocks a `StageOutput` with a large stdout string (e.g., 2 MiB of data).
- [ ] Verify that after processing this output, the `stdout` field in `StageOutput` is exactly 1,048,576 bytes (1 MiB) and contains the **last** 1 MiB of the original output.
- [ ] Verify that the `truncated` boolean field is set to `true`.
- [ ] Use a test log recorder to capture log output and assert that a `WARN` message exists mentioning the original stdout length (e.g., "Original stdout length: 2,097,152 bytes").

## 2. Task Implementation
- [ ] Implement the truncation logic in the `StageOutput` constructor or in the stage completion handler within `devs-core`.
- [ ] Ensure the truncation takes the *end* of the string (the most recent output).
- [ ] Set the `truncated` flag correctly.
- [ ] Add the `WARN` log message using the `tracing` or `log` crate.

## 3. Code Review
- [ ] Ensure the truncation is memory-efficient (avoid unnecessary copies of large buffers).
- [ ] Verify that the truncation limit is exactly 1,048,576 bytes as specified.
- [ ] Confirm that the log message is correctly formatted and includes the original length in bytes.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-core` and check for output truncation test results.
- [ ] Verify the logs during test execution (or via the log recorder) to confirm the warning message.

## 5. Update Documentation
- [ ] Document the output truncation policy in the `devs-core` crate documentation.
- [ ] Update `MEMORY.md` noting the truncation behavior as a system constraint.

## 6. Automated Verification
- [ ] Run `./do verify_requirements` and ensure `2_TAS-REQ-496` passes verification.
