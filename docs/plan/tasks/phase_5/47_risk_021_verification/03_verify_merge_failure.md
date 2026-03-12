# Task: Verify Default Merge Handler with Sub-agent Failures (Sub-Epic: 47_Risk 021 Verification)

## Covered Requirements
- [AC-RISK-021-04]

## Dependencies
- depends_on: [01_verify_cancellation.md]
- shared_components: [devs-scheduler, devs-core]

## 1. Initial Test Written
- [ ] Create an integration test `tests/risk_021_merge_failure_test.rs`.
- [ ] The test should:
    - Register a workflow with a fan-out stage (64 sub-agents).
    - Configure the sub-agents to exit with 0, except for one sub-agent (e.g., index 42) which exits with 1.
    - Submit the run and wait for the fan-out stage to complete.
    - Assert that the parent stage status is `Failed`.
    - Retrieve the parent stage's structured output.
    - Assert that it contains `failed_indices: [42]`.
    - Verify that no other indices are marked as failed.

## 2. Task Implementation
- [ ] Implement the `DefaultMergeHandler` in `devs-scheduler/src/fan_out/merge.rs`.
- [ ] Ensure that it iterates over all sub-agent results and collects indices of sub-agents that did not complete with success.
- [ ] Populate the `failed_indices` field in the parent stage's structured output when a failure is detected.
- [ ] Ensure the parent stage transitions to `Failed` if the collected `failed_indices` array is non-empty.

## 3. Code Review
- [ ] Verify that the indices are zero-based as per requirement.
- [ ] Check that the merge handler correctly handles cases where multiple sub-agents fail.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test --test risk_021_merge_failure_test`.
- [ ] Ensure the test passes consistently.

## 5. Update Documentation
- [ ] Ensure `AC-RISK-021-04` is documented as verified by this test.

## 6. Automated Verification
- [ ] Run `./do coverage` and ensure `risk_021_merge_failure_test.rs` covers the failure collection logic in `DefaultMergeHandler`.
- [ ] Verify traceability using `./tools/verify_requirements.py`.
