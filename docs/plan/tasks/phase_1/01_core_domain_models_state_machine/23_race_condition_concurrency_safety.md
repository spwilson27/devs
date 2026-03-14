# Task: Implement Race Condition Prevention and Concurrency Safety Types (Sub-Epic: 01_core_domain_models_state_machine)

## Covered Requirements
- [AC-RISK-NNN-NN], [AC-SEC-N-NNN], [SEC-NNN], [AC-SEC-1-007], [AC-SEC-1-025]

## Dependencies
- depends_on: []
- shared_components: [devs-core (Owner)]

## 1. Initial Test Written
- [ ] Write test `test_lock_acquisition_order_enum` asserting `LockAcquisitionOrder` enum has variants `ProjectRegistry`, `WorkflowRuns`, `PoolState`, `Checkpoint` in defined acquisition order and implements `Ord` correctly
- [ ] Write test `test_lock_order_project_before_runs` asserting `LockAcquisitionOrder::ProjectRegistry < LockAcquisitionOrder::WorkflowRuns`
- [ ] Write test `test_run_mutex_spec` asserting `RunMutexSpec` documents per-run mutex requirement with `Arc<tokio::sync::Mutex<()>>`
- [ ] Write test `test_idempotent_terminal_event` asserting `IdempotentTerminalGuard` type documents that duplicate terminal events are silently accepted

## 2. Task Implementation
- [ ] Define `LockAcquisitionOrder` enum in `crates/devs-core/src/concurrency.rs` with variants in canonical order: `ProjectRegistry = 0`, `WorkflowRuns = 1`, `PoolState = 2`, `Checkpoint = 3`
- [ ] Derive `Debug`, `Clone`, `Copy`, `PartialEq`, `Eq`, `PartialOrd`, `Ord` on `LockAcquisitionOrder`
- [ ] Define `RunMutexSpec` documentation struct describing per-run `Arc<tokio::sync::Mutex<RunState>>` for stage transitions
- [ ] Define `IdempotentTerminalGuard` documentation type describing how duplicate terminal events are handled (accepted silently, not errored)
- [ ] Define `ConcurrencyInvariant` enum documenting lock ordering rules and DAG eligibility evaluation requirements
- [ ] Add `pub mod concurrency;` to `crates/devs-core/src/lib.rs`

## 3. Code Review
- [ ] Verify lock order matches spec: project registry → workflow runs → pool state → checkpoint
- [ ] Verify ordinal values enforce correct comparison ordering
- [ ] Verify no runtime dependencies added

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-core concurrency` and confirm all four tests pass
- [ ] Run `cargo clippy -p devs-core -- -D warnings` and confirm no warnings

## 5. Update Documentation
- [ ] Add module-level doc comment to `crates/devs-core/src/concurrency.rs` explaining lock acquisition order invariant and its role in deadlock prevention

## 6. Automated Verification
- [ ] Confirm `cargo test -p devs-core` passes with zero failures
- [ ] Confirm `cargo doc -p devs-core --no-deps` generates documentation without errors
