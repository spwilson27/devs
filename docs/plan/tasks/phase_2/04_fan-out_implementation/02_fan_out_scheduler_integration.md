# Task: Fan-Out Scheduler Integration (Execution & Waiting) (Sub-Epic: 04_Fan-Out Implementation)

## Covered Requirements
- [1_PRD-REQ-024]

## Dependencies
- depends_on: [01_fan_out_config_validation.md]
- shared_components: [devs-scheduler, devs-core]

## 1. Initial Test Written
- [ ] Create a mock workflow test in `devs-scheduler` with a fan-out stage (count = 3).
- [ ] Test that the scheduler spawns exactly 3 agent instances when the stage becomes `Eligible`.
- [ ] Test that the scheduler waits for ALL 3 instances to reach a terminal state before advancing [3_PRD-BR-033].
- [ ] Test that if any instance remains `Running`, the stage is not transitioned to its post-execution phase.

## 2. Task Implementation
- [ ] Update `devs-core`'s `StageRun` model to track an array of `SubAgentRun` states.
- [ ] Modify `DagScheduler` to detect `fan_out` config on eligible stages.
- [ ] Implement the `FanOutManager` within `devs-scheduler` to handle spawning of multiple sub-agents.
- [ ] Update the event-handling logic in `DagScheduler` to aggregate completion events from all sub-agents before triggering stage terminal transitions.

## 3. Code Review
- [ ] Ensure sub-agent runs are isolated from each other (e.g., using different working directories).
- [ ] Verify that the state machine transition for fan-out stages is atomic and survives crashes via the checkpoint system.
- [ ] Check for potential race conditions when multiple sub-agents complete simultaneously.

## 4. Run Automated Tests to Verify
- [ ] Execute `cargo test -p devs-scheduler` and verify that the fan-out lifecycle tests pass.

## 5. Update Documentation
- [ ] Update the `devs-scheduler` architecture document to include the `FanOutManager` and the sub-agent lifecycle.

## 6. Automated Verification
- [ ] Run `./do test` and ensure all scheduler tests are passing with the new fan-out logic.
