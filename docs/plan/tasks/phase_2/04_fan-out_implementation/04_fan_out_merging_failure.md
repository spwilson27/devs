# Task: Fan-Out Merging and Failure Propagation (Sub-Epic: 04_Fan-Out Implementation)

## Covered Requirements
- [1_PRD-REQ-026]

## Dependencies
- depends_on: [03_fan_out_authoring.md]
- shared_components: [devs-scheduler, devs-core]

## 1. Initial Test Written
- [ ] Create a test in `devs-scheduler` for the default "array join" merge strategy.
- [ ] Test that if any sub-agent in a fan-out stage fails, the entire stage is marked `Failed` [3_PRD-BR-032].
- [ ] Test a custom merge handler that successfully reduces multiple sub-agent outputs into a single JSON object.
- [ ] Test a custom merge handler that handles a partial failure and returns a success result.
- [ ] Test that the merged output is correctly passed as a template variable to downstream stages.

## 2. Task Implementation
- [ ] Implement the `DefaultMergeStrategy` in `devs-scheduler` which collects sub-agent outputs into a JSON array.
- [ ] Implement support for `CustomMergeHandler` in both the Rust Builder API and declarative configurations (named handlers).
- [ ] Modify `FanOutManager` to invoke the appropriate merge handler after all sub-agents reach a terminal state.
- [ ] Implement the error propagation logic: a stage fails if any sub-agent fails, unless a custom handler provides a successful result.
- [ ] Ensure the final merged output is stored in the `StageRun` and committed to the checkpoint.

## 3. Code Review
- [ ] Verify that the default merge strategy is efficient for large numbers of sub-agents.
- [ ] Ensure that custom merge handlers receive all sub-agent outputs, including exit codes and structured JSON data.
- [ ] Check that failure indices are correctly reported in the final stage error message [3_PRD-BR-032].

## 4. Run Automated Tests to Verify
- [ ] Execute `cargo test -p devs-scheduler` and ensure all merge and failure propagation tests pass.

## 5. Update Documentation
- [ ] Update documentation to describe the default and custom merge behaviors for fan-out stages.

## 6. Automated Verification
- [ ] Run `./do test` to confirm all fan-out implementation requirements are fully verified.
