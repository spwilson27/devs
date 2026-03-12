# Task: Implement Crash Recovery Logic (Sub-Epic: 070_Detailed Domain Specifications (Part 35))

## Covered Requirements
- [2_TAS-REQ-428]

## Dependencies
- depends_on: [none]
- shared_components: ["devs-scheduler", "devs-checkpoint"]

## 1. Initial Test Written
- [ ] Create a `checkpoint.json` file representing a run with a stage in the `Running` state.
- [ ] Implement a test that uses the `devs-checkpoint` loader and then initializes the `DagScheduler` with the recovered state.
- [ ] Assert that the recovered stage's status is automatically reset to `Eligible` upon scheduler startup.
- [ ] Assert that the stage eventually transitions back to `Running` when resources (slots) become available.

## 2. Task Implementation
- [ ] Implement the stage status recovery logic in the `DagScheduler`'s startup or state-loading sequence.
- [ ] When loading stages from checkpoints, identify any that are in a transient state (`Running`).
- [ ] Reset these stages to `Eligible` so they can be re-scheduled.
- [ ] Ensure that `Waiting` and `Eligible` stages are correctly re-queued in the scheduler's internal priority queue.
- [ ] Verify that this recovery logic does not duplicate work or bypass dependency checks.

## 3. Code Review
- [ ] Confirm that the state transitions during recovery are consistent with the state machine's rules.
- [ ] Verify that the checkpoint-backed recovery is robust to simulated crashes (SIGKILL).

## 4. Run Automated Tests to Verify
- [ ] Run the crash recovery unit and integration tests.
- [ ] Verify that a `Running` stage is correctly re-scheduled after a simulated server restart.

## 5. Update Documentation
- [ ] Add a technical comment in the `DagScheduler` code detailing the crash recovery logic.

## 6. Automated Verification
- [ ] Run the checkpoint recovery integration test and confirm that all stages in transient states are correctly handled.
