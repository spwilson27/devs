# Task: Scheduler Fan-Out Race Condition Verification (Sub-Epic: 12_MIT-001)

## Covered Requirements
- [AC-RISK-001-03]

## Dependencies
- depends_on: [02_scheduler_mutex_locking.md]
- shared_components: [devs-scheduler, devs-core]

## 1. Initial Test Written
- [ ] Create an E2E test in `tests/e2e/scheduler_fanout_race.rs` that submits a workflow with a fan-out stage where `count=64`.
- [ ] Mock the agent tool to complete immediately with `exit_code: 0`.
- [ ] Submit the run and wait for it to complete.
- [ ] Assert that exactly 64 sub-`StageRun` records are created in `checkpoint.json`.
- [ ] Assert that the parent `StageRun` transitions to `Completed` exactly ONCE and only after ALL 64 sub-stages have completed.

## 2. Task Implementation
- [ ] Ensure that `devs-scheduler`'s `FanOutManager` handles 64 concurrent completions of sub-stages without triggering premature parent stage transitions.
- [ ] Verify that the `checkpoint.json` correctly reflects all 64 sub-stage records.
- [ ] Implement a verification loop in the E2E test to check the `StageStatus` of all 64 sub-stages before and after the parent completion.

## 3. Code Review
- [ ] Check if the `FanOutManager` uses atomic counters or the per-run `Mutex` correctly to track sub-stage completion.
- [ ] Ensure no sub-stage records are lost or overwritten during concurrent writes.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test --test e2e_scheduler_fanout_race` and ensure it passes consistently.

## 5. Update Documentation
- [ ] Document the fan-out concurrency limits and race condition safeguards in `docs/plan/specs/2_tas.md` (§3.6.1 updates if needed).

## 6. Automated Verification
- [ ] Run `./do lint` and `./do test` to ensure 100% requirement-to-test traceability for [AC-RISK-001-03].
- [ ] Verify traceability via `target/traceability.json`.
