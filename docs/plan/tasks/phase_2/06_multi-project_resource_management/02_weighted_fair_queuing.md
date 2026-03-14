# Task: Weighted Fair Queuing Scheduling (Sub-Epic: 06_Multi-Project Resource Management)

## Covered Requirements
- [1_PRD-REQ-034]

## Dependencies
- depends_on: [01_global_dispatcher_strict_priority.md]
- shared_components: [devs-scheduler (owner — extends GlobalDispatcher), devs-config (consumer — project weight from ProjectEntry)]

## 1. Initial Test Written
- [ ] Add tests to `crates/devs-scheduler/src/dispatcher/tests.rs` (or the existing test module from task 01).
- [ ] **Test: `test_wfq_proportional_dispatch_3_to_1`**
  - Create `GlobalDispatcher` with `SchedulingPolicy::WeightedFairQueuing`.
  - Set up `ProjectA(weight=3)` and `ProjectB(weight=1)`.
  - Run 100 dispatch cycles: each cycle, enqueue one stage from each project, then call `pick_next()`.
  - Count dispatches per project over the 100 cycles.
  - Assert `ProjectA` received between 70–80 dispatches and `ProjectB` received between 20–30 (within 10% of ideal 75/25 ratio).
  - Annotate: `// Covers: 1_PRD-REQ-034`
- [ ] **Test: `test_wfq_equal_weights_round_robin`**
  - Two projects, both `weight=1`.
  - Enqueue one stage from each, call `pick_next()` twice. Repeat 10 times.
  - Assert each project gets exactly 10 dispatches (50/50 split).
  - Annotate: `// Covers: 1_PRD-REQ-034`
- [ ] **Test: `test_wfq_single_project_gets_all`**
  - Only one project has eligible stages. Verify it gets all dispatches regardless of weight.
- [ ] **Test: `test_wfq_virtual_time_resets_on_no_pending`**
  - Dispatch all stages from a project. Its virtual_time accumulates. Then a new batch arrives. Verify the algorithm still dispatches proportionally (virtual_time doesn't cause unfairness for a project that was idle).
- [ ] **Test: `test_wfq_project_join_mid_session`**
  - Start with `ProjectA(weight=2)`. After 10 dispatches, `ProjectB(weight=1)` joins with eligible stages. Verify `ProjectB` is immediately considered and receives proportional share going forward.
- [ ] **Test: `test_wfq_tiebreak_deterministic`**
  - Two projects with identical `virtual_time / weight` scores. Verify tie is broken deterministically (e.g., by `project_id` lexicographic order or by `eligible_at`).

## 2. Task Implementation
- [ ] Add per-project virtual time tracking to `GlobalDispatcher`:
  ```rust
  struct ProjectSchedulingState {
      virtual_time: u64,
      weight: u32,
  }
  ```
  Store as `HashMap<ProjectId, ProjectSchedulingState>` inside `GlobalDispatcher`.
- [ ] Implement the WFQ branch of `pick_next()`:
  1. Group pending stages by `project_id`.
  2. For each project with at least one pending stage, compute score = `virtual_time / weight` (use integer division; or for precision: compare `a.virtual_time * b.weight` vs `b.virtual_time * a.weight` to avoid floating point).
  3. Select the project with the **minimum** score (it has used the least relative to its share).
  4. Tie-break: lowest `project_id` (lexicographic), then earliest `eligible_at`.
  5. Within the selected project, pick the stage with earliest `eligible_at` (FIFO within project).
  6. Increment the selected project's `virtual_time` by 1.
  7. Remove and return the selected `PendingDispatch`.
- [ ] On `enqueue()`: if the project's `ProjectSchedulingState` doesn't exist yet in the map, initialize it with `virtual_time = current_min_virtual_time` (not 0, to avoid a new project getting a burst of dispatches). `weight` is taken from the `PendingDispatch.weight` field.
- [ ] Add `GlobalDispatcher::reset_virtual_times(&mut self)` — optional method to normalize virtual times if they grow unbounded (subtract the minimum from all). Call this periodically or when all projects have drained their queues.
- [ ] Ensure `virtual_time` uses `u64` — at 1 increment per dispatch, this won't overflow in practice (2^64 dispatches).

## 3. Code Review
- [ ] Verify the comparison uses cross-multiplication (`a.vt * b.w <=> b.vt * a.w`) to avoid floating-point imprecision.
- [ ] Verify that a newly joined project doesn't starve existing projects by starting at `virtual_time = 0` (it should start at the current minimum).
- [ ] Verify that `weight` is always `>= 1` (the config layer rejects `weight = 0` per `[3_PRD-BR-041]`, but add a debug_assert here).
- [ ] Ensure no `unwrap()` or `expect()` in non-test code.
- [ ] Check that the `HashMap` lookup and scoring loop is O(P) where P = number of active projects (acceptable for MVP).

## 4. Run Automated Tests to Verify
- [ ] Run: `cargo test -p devs-scheduler -- dispatcher`
- [ ] Verify all tests from task 01 and task 02 pass (no regressions).
- [ ] Run: `cargo clippy -p devs-scheduler -- -D warnings`

## 5. Update Documentation
- [ ] Add doc comments to the WFQ implementation explaining the virtual-time algorithm, the cross-multiplication comparison, and the new-project initialization strategy.

## 6. Automated Verification
- [ ] Run `grep -r 'Covers: 1_PRD-REQ-034' crates/devs-scheduler/src/dispatcher` and verify at least 5 test functions contain the annotation (cumulative with task 01).
- [ ] Run `./do lint` and confirm zero warnings/errors.
- [ ] Run `./do test` and confirm all dispatcher tests pass.
