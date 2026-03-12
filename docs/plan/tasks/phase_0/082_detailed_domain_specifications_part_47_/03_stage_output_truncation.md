# Task: Stage Output Truncation Logic (Sub-Epic: 082_Detailed Domain Specifications (Part 47))

## Covered Requirements
- [2_TAS-REQ-487]

## Dependencies
- depends_on: [none]
- shared_components: [devs-core]

## 1. Initial Test Written
- [ ] Create a unit test for the `StageOutput` builder or truncation function in `devs-core`.
- [ ] Simulate stdout exceeding 1 MiB (e.g. 1.5 MiB) and stderr exceeding 1 MiB.
- [ ] Verify that the final `StageOutput.stdout` contains only the last 1,048,576 bytes.
- [ ] Verify that the `StageOutput.truncated` field is set to `true`.
- [ ] Verify that the original lengths are captured (for logging purposes).

## 2. Task Implementation
- [ ] In `devs-core`, implement the `StageOutput` structure with `stdout: BoundedString`, `stderr: BoundedString`, and `truncated: bool`.
- [ ] Implement a truncation algorithm: if the input string exceeds 1 MiB (1,048,576 bytes), keep only the last 1,048,576 bytes.
- [ ] Ensure the truncation logic handles UTF-8 boundaries correctly (do not split in the middle of a multi-byte character).
- [ ] Add a `WARN` level log entry if truncation occurs, stating the original length and the stage name.
- [ ] Integration: ensure that when an agent's process completes, the collector uses this truncation logic before storing the output in the state machine.

## 3. Code Review
- [ ] Verify that the truncation is "last-N bytes" and not "first-N bytes" as requested in [2_TAS-REQ-487].
- [ ] Check for potential performance bottlenecks in the truncation of very large strings (e.g. avoid unnecessary copies).
- [ ] Ensure that the 2 MiB combined limit (1 MiB each) is strictly enforced as a maximum for in-memory and checkpoint storage.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-core` and check the truncation unit tests.

## 5. Update Documentation
- [ ] Document the truncation behavior in the developer documentation, explaining how agents should handle large outputs.

## 6. Automated Verification
- [ ] Run `./do verify_requirements.py` to ensure `[2_TAS-REQ-487]` is correctly mapped to the test.
