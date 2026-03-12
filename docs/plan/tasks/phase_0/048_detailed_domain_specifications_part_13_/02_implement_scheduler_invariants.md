# Task: Implement Scheduler Event Loop Invariants (Sub-Epic: 048_Detailed Domain Specifications (Part 13))

## Covered Requirements
- [2_TAS-REQ-112]

## Dependencies
- depends_on: [none]
- shared_components: [devs-scheduler, devs-core]

## 1. Initial Test Written
- [ ] Create a property-based test in `devs-scheduler/src/invariants.rs` that validates state transitions for a variety of dependency graphs.
- [ ] Verify that a stage transitions from `Waiting` to `Eligible` as soon as all its dependencies reach `Completed`.
- [ ] Verify that if any dependency reaches `Failed`, `Cancelled`, or `TimedOut`, the stage transitions to `Cancelled` and is not dispatched.
- [ ] Test the `Eligible` to `Running` transition when a pool slot is acquired.

## 2. Task Implementation
- [ ] Implement the `DagScheduler` event loop in `devs-scheduler`.
- [ ] Add logic to the event loop to check stage eligibility whenever a `StageStatus` changes to a terminal state (`Completed`, `Failed`, `Cancelled`, `TimedOut`).
- [ ] Enforce the following invariants:
    - **Waiting → Eligible:** Only when all dependencies in `depends_on` are in `Completed` status.
    - **Waiting → Cancelled:** If any dependency in `depends_on` reaches `Failed`, `Cancelled`, or `TimedOut`.
    - **Eligible → Running:** Only after a successful `AgentPool::acquire()` permit is obtained.
    - **Running → terminal:** Based on completion signal dispatch.
- [ ] Ensure that cycles in the dependency graph are detected during workflow validation (in `devs-config` or `devs-core`) to prevent the scheduler from hanging.

## 3. Code Review
- [ ] Verify that the state transitions align exactly with [2_TAS-REQ-020].
- [ ] Confirm that dependency checking is efficient and doesn't re-scan the entire graph unnecessarily.
- [ ] Check for edge cases, such as an empty `depends_on` list (should start as `Eligible` immediately).
- [ ] Ensure that transitions are atomic with respect to the run state.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-scheduler`.
- [ ] Ensure all scheduler invariant tests pass.

## 5. Update Documentation
- [ ] Document the internal scheduler event loop logic and how it maintains graph-wide invariants.

## 6. Automated Verification
- [ ] Verify traceability: `// Covers: 2_TAS-REQ-112` in `devs-scheduler/src/lib.rs` (or `engine.rs`).
- [ ] Run `./do test` to confirm 100% traceability for [2_TAS-REQ-112].
