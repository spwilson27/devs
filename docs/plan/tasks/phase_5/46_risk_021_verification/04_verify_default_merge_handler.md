# Task: Verify Default Fan-out Merge Handler (Sub-Epic: 46_Risk 021 Verification)

## Covered Requirements
- [RISK-021-BR-003]

## Dependencies
- depends_on: [none]
- shared_components: [devs-scheduler, devs-core, devs-proto]

## 1. Initial Test Written
- [ ] Write an E2E test in `tests/e2e/fanout_merge_test.rs` that:
    - Submits a fan-out workflow with `count: 10` (no custom `merge_handler`).
    - Configures mock agents such that sub-agents with index 3 and 7 fail (exit 1) and others succeed (exit 0).
    - Waits for the run to finish.
    - Asserts that the parent fan-out stage transitions to `Failed`.
    - Fetches the parent stage output via `get_run` (MCP) or `devs status --format json` (CLI).
    - Asserts that `structured.failed_indices` is an array containing exactly `[3, 7]`.
- [ ] The test MUST be annotated with `// Covers: RISK-021-BR-003`.

## 2. Task Implementation
- [ ] Implement the default fan-out result aggregation logic in `devs-scheduler`.
- [ ] Ensure that if any sub-agent is `Failed`, the parent stage also becomes `Failed` (unless a custom merge handler specifies otherwise, which is out of scope for this task).
- [ ] Populate the `failed_indices` field in the parent stage's `StructuredOutput` with the indices of all failed sub-agents.
- [ ] Ensure that `StructuredOutput` is correctly serialized to the `checkpoint.json`.

## 3. Code Review
- [ ] Verify that the `failed_indices` are zero-based and match the sub-agent's fan-out index.
- [ ] Confirm that parent stage `Failed` status is only reached after ALL sub-agents have completed.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test --test fanout_merge_test` and ensure it passes.
- [ ] Run `./do test` and ensure no traceability violations are reported for `RISK-021-BR-003`.

## 5. Update Documentation
- [ ] Update the internal "Memory" to reflect that the default fan-out merge failure behavior is verified.

## 6. Automated Verification
- [ ] Run `.tools/verify_requirements.py` and confirm that `RISK-021-BR-003` is 100% covered.
- [ ] Inspect the `target/traceability.json` to ensure the new test is correctly mapped.
