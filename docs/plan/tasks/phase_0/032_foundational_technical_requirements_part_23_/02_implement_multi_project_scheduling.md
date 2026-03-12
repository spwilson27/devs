# Task: Implement Multi-Project Scheduling logic (Sub-Epic: 032_Foundational Technical Requirements (Part 23))

## Covered Requirements
- [2_TAS-REQ-033A]

## Dependencies
- depends_on: [none]
- shared_components: [devs-scheduler, devs-core, devs-config]

## 1. Initial Test Written
- [ ] Create a unit test for `select_next_stage` in `devs-scheduler/src/scheduling.rs` (or equivalent).
- [ ] Mock a `ProjectRegistry` with two projects having different priorities.
- [ ] Verify that a stage from the project with lower priority value (higher priority) is selected first.
- [ ] Create a unit test for `select_next_stage_weighted`.
- [ ] Mock two projects with different weights and verify that the one with lower `virtual_time` score is selected.
- [ ] Verify that ties in `virtual_time` are broken by `project_id` string order.

## 2. Task Implementation
- [ ] Implement the `select_next_stage` function for **Strict priority mode** in `devs-scheduler`.
- [ ] Use `projects[pid].priority` to find the minimum (highest priority) and select from those using FIFO (based on `eligible_at`).
- [ ] Implement the `select_next_stage_weighted` function for **Weighted fair queuing mode** in `devs-scheduler`.
- [ ] Track `virtual_time` per project and update it by `1.0 / weight` each time a stage is dispatched.
- [ ] Implement the logic to select the project with the lowest `virtual_time / weight` score.
- [ ] Ensure the selection process is deterministic and correctly handles the global queue of eligible stages.

## 3. Code Review
- [ ] Verify that the `virtual_time` update is atomic or correctly synchronized if accessed from multiple threads (though scheduler is usually single-threaded per project).
- [ ] Ensure that `0` or negative weights/priorities are handled (validation in `devs-config` should prevent this, but defensive coding is good).
- [ ] Verify that the implementation follows the pseudocode provided in [2_TAS-REQ-033A].

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-scheduler` to verify the scheduling selection logic for both modes.

## 5. Update Documentation
- [ ] Update internal documentation for the scheduling algorithm in `devs-scheduler`.

## 6. Automated Verification
- [ ] Run `./do lint` and `./do test` to ensure 100% pass and requirement traceability.
