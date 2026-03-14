# Task: Multi-Project Scheduling Policy Types and Selection Logic (Sub-Epic: 032_Foundational Technical Requirements (Part 23))

## Covered Requirements
- [2_TAS-REQ-033A]

## Dependencies
- depends_on: []
- shared_components: ["devs-core (consumer — uses domain types like BoundedString, ProjectId)"]

## 1. Initial Test Written
- [ ] Create a test module in `devs-core` (e.g., `src/scheduling.rs` tests) with the following test cases written before any implementation:
  1. **`test_strict_priority_selects_highest_priority_project`**: Given 3 projects with priorities 1, 5, 10 (lower = higher priority), each with one pending stage, assert `select_next_stage` in Strict mode returns the stage from the priority-1 project.
  2. **`test_strict_priority_same_priority_fifo`**: Given 2 projects both with priority 1, the project whose stage was enqueued first is selected. Assert FIFO ordering within equal priority.
  3. **`test_strict_priority_empty_queue_returns_none`**: No pending stages from any project. Assert `select_next_stage` returns `None`.
  4. **`test_weighted_fair_queuing_proportional_allocation`**: Given project A (weight=3) and project B (weight=1), run `select_next_stage` 100 times (both always have pending stages). Assert project A is selected approximately 75 times (±15 tolerance) and project B approximately 25 times.
  5. **`test_weighted_fair_queuing_single_project_gets_all`**: Only one project has pending stages. Regardless of weights, that project's stage is always selected.
  6. **`test_weighted_fair_queuing_zero_weight_never_selected`**: A project with weight=0 is never selected when another project with weight>0 has pending stages. Run 50 iterations and assert weight-0 project is never picked.
  7. **`test_scheduling_policy_enum_variants`**: Assert the `SchedulingPolicy` enum has exactly two variants: `StrictPriority` and `WeightedFairQueuing`.
  8. **`test_project_scheduling_entry_fields`**: Construct a `ProjectSchedulingEntry` and assert it has `project_id`, `priority` (for strict), `weight` (for weighted), and `pending_stages` fields.

## 2. Task Implementation
- [ ] In `devs-core`, define:
  - `enum SchedulingPolicy { StrictPriority, WeightedFairQueuing }` with `Debug`, `Clone`, `PartialEq`, `serde::Serialize`, `serde::Deserialize`.
  - `struct ProjectSchedulingEntry { project_id: ProjectId, priority: u32, weight: u32, pending_stages: VecDeque<StageName> }`.
- [ ] Implement `fn select_next_stage(policy: &SchedulingPolicy, projects: &mut [ProjectSchedulingEntry]) -> Option<(ProjectId, StageName)>` that:
  1. **StrictPriority**: sorts by `priority` ascending (lowest number = highest priority), breaks ties by FIFO (first pending stage enqueued), pops and returns the selected stage.
  2. **WeightedFairQueuing**: computes weighted random selection — each project's probability is `weight / total_weight`. Uses a deterministic selection mechanism (accepts an `&mut impl Rng` parameter or similar) to pick the project, then pops its first pending stage.
- [ ] Add `// Covers: 2_TAS-REQ-033A` annotations to each test function.

## 3. Code Review
- [ ] Verify strict priority mode is deterministic with no randomness.
- [ ] Verify weighted fair queuing handles the edge case of all weights being 0 (should return `None` or round-robin).
- [ ] Verify `VecDeque` is used for pending stages to ensure O(1) FIFO pop.
- [ ] Verify the function signature allows external RNG injection for testability of weighted mode.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test scheduling` and confirm all 8 tests pass.
- [ ] Run `cargo clippy --all-targets` and confirm no warnings.

## 5. Update Documentation
- [ ] Add doc comments to `SchedulingPolicy`, `ProjectSchedulingEntry`, and `select_next_stage` describing the two scheduling modes and their guarantees.

## 6. Automated Verification
- [ ] Run `./do test` and confirm the new tests appear in output and pass.
- [ ] Grep test source for `// Covers: 2_TAS-REQ-033A` and confirm the annotation exists at least once.
