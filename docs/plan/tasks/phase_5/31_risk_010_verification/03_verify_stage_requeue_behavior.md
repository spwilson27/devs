# Task: Verify Stage Re-queue Behavior (Sub-Epic: 31_Risk 010 Verification)

## Covered Requirements
- [RISK-010-BR-004], [MIT-010]

## Dependencies
- depends_on: ["01_verify_report_rate_limit_mcp"]
- shared_components: [devs-scheduler, devs-pool, devs-core]

## 1. Initial Test Written
- [ ] Write a scheduler integration test in `devs-scheduler/tests/requeue_integration.rs` that:
    - Defines a stage with specific `required_capabilities` and `depends_on` constraints.
    - Submits the run and allows the stage to transition to `Running`.
    - Simulates a rate-limit event (via mock adapter exit code or mock `report_rate_limit` call).
    - Asserts that the stage transitions back to `Eligible` (verified in the authoritative state machine).
    - Asserts that the stage's `required_capabilities` and `depends_on` fields are identical to the original definition.
    - Asserts that the stage is re-dispatched to the next available agent that meets those requirements.
    - Verifies that the stage's status is never set to `Pending` during this transition.

## 2. Task Implementation
- [ ] In `devs-scheduler`, ensure that rate-limit induced transitions use the `Eligible` state rather than `Pending`.
- [ ] Verify that the re-queue logic in the scheduler preserves the full context of the stage definition.
- [ ] Ensure that `StageRun` metadata is updated correctly to reflect the re-queue event (e.g., adding a log entry for the rate limit cooldown).
- [ ] In `devs-core`, verify the `StateMachine` has a direct transition from `Running` to `Eligible` (or similar) when the event is `RateLimited`.

## 3. Code Review
- [ ] Confirm that `RISK-010-BR-004` is fully satisfied by checking the state machine diagram and code.
- [ ] Verify that the `required_capabilities` are not modified during the re-selection process.
- [ ] Ensure that no other terminal states (Failed, Cancelled) are triggered during a standard rate-limit re-queue.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-scheduler --test requeue_integration`.
- [ ] Run `cargo test -p devs-core` to verify the state machine's transitions.

## 5. Update Documentation
- [ ] Ensure the scheduler documentation clarifies the `Running -> Eligible` transition on rate limiting.

## 6. Automated Verification
- [ ] Run `./do test` and verify that `RISK-010-BR-004` is marked as covered in `target/traceability.json`.
