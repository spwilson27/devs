# Task: Scheduler State and Pool Concurrency Foundation (Sub-Epic: 019_Foundational Technical Requirements (Part 10))

## Covered Requirements
- [2_TAS-REQ-002N], [2_TAS-REQ-002O]

## Dependencies
- depends_on: [01_async_concurrency_and_lock_order_policies.md, docs/plan/tasks/phase_0/009_core_domain_types/03_define_core_proto_messages_and_services.md]
- shared_components: [devs-core, devs-pool]

## 1. Initial Test Written
- [ ] Create unit tests in `crates/devs-core/src/state/scheduler_state.rs`:
  - Test that `SchedulerState` can be initialized from an empty checkpoint.
  - Test that `Arc<tokio::sync::RwLock<SchedulerState>>` correctly handles concurrent readers and a single writer.
  - Test the loading of `WorkflowRun` and `StageRun` instances from a mock checkpoint on startup.
- [ ] Create unit tests in `crates/devs-pool/src/concurrency.rs` (if folder exists, otherwise in `devs-core` for now):
  - Test that `Arc<tokio::sync::Semaphore>` correctly enforces `max_concurrent` permits.
  - Verify that `acquire_owned()` returns a permit that stays valid across task boundaries.
  - Verify that when the `OwnedSemaphorePermit` is dropped, the permit is correctly released.

## 2. Task Implementation
- [ ] Implement `SchedulerState` struct in `crates/devs-core/src/state/scheduler_state.rs`:
  - Add fields: `workflow_runs: BTreeMap<RunID, WorkflowRun>`, `stage_runs: BTreeMap<StageID, StageRun>`.
  - Implement a `load_from_checkpoint` method that populates these collections.
- [ ] Implement a wrapper type `PoolConcurrency` in `crates/devs-core/src/concurrency/pool.rs` (or `devs-pool` if crate is already scaffolded):
  - Wraps `Arc<tokio::sync::Semaphore>`.
  - Provides a method `acquire_permit() -> OwnedSemaphorePermit`.
- [ ] Implement a `RunId` type if not already defined (or import from `devs-core` types).
- [ ] Ensure `SchedulerState` is the canonical source of truth for runtime state and initialized from git checkpoints.

## 3. Code Review
- [ ] Verify that `SchedulerState` uses `tokio::sync::RwLock` as per [2_TAS-REQ-002O].
- [ ] Ensure that `Semaphore` permits are acquired using `acquire_owned()` as per [2_TAS-REQ-002N].
- [ ] Check that no heavy dependencies are introduced.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-core` and verify that scheduler state and concurrency tests pass.
- [ ] Ensure ≥ 90% unit test coverage for the new modules.

## 5. Update Documentation
- [ ] Add doc comments explaining the `SchedulerState` and `PoolConcurrency` roles in the overall system.

## 6. Automated Verification
- [ ] Run `grep -r "Arc<RwLock<SchedulerState>>" crates/devs-core/` and `grep -r "acquire_owned" crates/devs-core/` to verify implementation matches requirements.
- [ ] Run `grep -r "2_TAS-REQ-002N" crates/devs-core/` and `grep -r "2_TAS-REQ-002O" crates/devs-core/` for traceability.
