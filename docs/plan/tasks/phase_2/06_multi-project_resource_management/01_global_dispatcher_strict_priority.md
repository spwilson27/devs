# Task: Global Dispatcher Infrastructure & Strict Priority Scheduling (Sub-Epic: 06_Multi-Project Resource Management)

## Covered Requirements
- [1_PRD-REQ-034]

## Dependencies
- depends_on: [none]
- shared_components: [devs-scheduler, devs-pool, devs-config]

## 1. Initial Test Written
- [ ] Create a unit test for `GlobalDispatcher` that simulates multiple projects with different priorities.
- [ ] The test should enqueue several `Eligible` stages from different projects into the dispatcher.
- [ ] Mock the `AgentPool` to signal availability.
- [ ] Verify that the dispatcher selects stages in descending order of project priority (higher integer = higher priority) [1_PRD-REQ-034].
- [ ] Verify that for projects with equal priority, stages are selected in FIFO order based on their `eligible_at` timestamp.
- [ ] Use `tokio::test` and mock time if necessary to ensure deterministic FIFO ordering.

## 2. Task Implementation
- [ ] Define `SchedulingPolicy` enum in `devs-core` or `devs-scheduler` (Strict, Weighted).
- [ ] Define `PendingDispatch` struct containing `StageID`, `ProjectID`, `Priority`, `Weight`, and `eligible_at` timestamp.
- [ ] Implement `GlobalDispatcher` struct in `devs-scheduler` crate.
- [ ] The dispatcher should hold a queue of `PendingDispatch` items.
- [ ] Implement `GlobalDispatcher::enqueue(stage: PendingDispatch)` to add stages to the queue.
- [ ] Implement `GlobalDispatcher::pick_next(policy: SchedulingPolicy) -> Option<PendingDispatch>`.
- [ ] For `SchedulingPolicy::Strict`, implement the sorting logic: `sort_by(|a, b| b.priority.cmp(&a.priority).then(a.eligible_at.cmp(&b.eligible_at)))`.
- [ ] Ensure the dispatcher is thread-safe (wrapped in `Arc<Mutex<...>>` or using a message-passing actor pattern).

## 3. Code Review
- [ ] Verify that the priority ordering matches the PRD (Higher integer = higher priority).
- [ ] Ensure that "starvation" of lower-priority projects is correctly permitted in strict mode [3_PRD-BR-040].
- [ ] Check that the dispatcher does not hold locks during long-running async operations (like calling the pool).

## 4. Run Automated Tests to Verify
- [ ] Run the newly created unit tests: `cargo test -p devs-scheduler --lib global_dispatcher`.
- [ ] Verify 100% pass rate and coverage requirements.

## 5. Update Documentation
- [ ] Document the `GlobalDispatcher` architecture in the `devs-scheduler` README.md.
- [ ] Update agent "memory" with the implementation details of the strict priority policy.

## 6. Automated Verification
- [ ] Verify requirement traceability: `// Covers: 1_PRD-REQ-034` should be present in the tests.
- [ ] Run `./do lint` to ensure code style compliance.
