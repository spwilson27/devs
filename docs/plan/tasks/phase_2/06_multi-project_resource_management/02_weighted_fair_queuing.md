# Task: Weighted Fair Queuing Scheduling (Sub-Epic: 06_Multi-Project Resource Management)

## Covered Requirements
- [1_PRD-REQ-034]

## Dependencies
- depends_on: [01_global_dispatcher_strict_priority.md]
- shared_components: [devs-scheduler, devs-pool, devs-config]

## 1. Initial Test Written
- [ ] Create a unit test for `GlobalDispatcher` that simulates multiple projects with different weights.
- [ ] Enqueue 100 stages from two projects: `ProjectA (weight: 3)` and `ProjectB (weight: 1)`.
- [ ] Mock the `AgentPool` to signal availability.
- [ ] Verify that the dispatch ratio is within 10% of 3:1 over 100 dispatches [AC-ROAD-P2-007].
- [ ] Specifically, `ProjectA` should receive roughly 75 dispatches and `ProjectB` roughly 25.
- [ ] Ensure that a project with `weight = 0` is rejected at registration (this is a `devs-config` check but the scheduler should handle it by assuming `weight >= 1`) [3_PRD-BR-041].

## 2. Task Implementation
- [ ] Implement the `Weighted Fair Queuing` algorithm in `GlobalDispatcher`.
- [ ] Maintain `virtual_time` per project within the `GlobalDispatcher` state.
- [ ] For each dispatch request:
    - [ ] Score = `project.virtual_time / project.weight`.
    - [ ] Select the stage from the project with the minimum score.
    - [ ] After dispatch, increment `virtual_time` for the chosen project by 1.
- [ ] Ensure that `virtual_time` is initialized to 0 for new projects and persists across scheduling decisions within a server session.
- [ ] Tie-break between equal scores using `project_id` or `eligible_at`.

## 3. Code Review
- [ ] Verify that the `Score = virtual_time / weight` formula is correctly implemented.
- [ ] Check that `virtual_time` does not overflow for long-running servers.
- [ ] Ensure the algorithm correctly handles projects joining and leaving the queue dynamically.

## 4. Run Automated Tests to Verify
- [ ] Run the newly created unit tests: `cargo test -p devs-scheduler --lib global_dispatcher_wfq`.
- [ ] Verify 100% pass rate and compliance with the 3:1 ratio requirement [AC-3-032].

## 5. Update Documentation
- [ ] Update the `GlobalDispatcher` README.md to describe the Weighted Fair Queuing algorithm.
- [ ] Update agent "memory" with the implementation details of the WFQ policy.

## 6. Automated Verification
- [ ] Verify requirement traceability: `// Covers: 1_PRD-REQ-034` should be present in the tests.
- [ ] Run `./do lint` to ensure code style compliance.
