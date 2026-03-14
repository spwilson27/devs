# Task: Implement StageStatus State Machine (Sub-Epic: 01_Core Domain Models & State Machine)

## Covered Requirements
- [2_TAS-REQ-020]

## Dependencies
- depends_on: [01_run_status_state_machine.md]
- shared_components: [devs-core (Owner — extends the existing devs-core crate)]

## 1. Initial Test Written
- [ ] Create test module `stage_status_tests` in `crates/devs-core/src/state_machine/`
- [ ] Write `test_stage_pending_to_waiting` asserting `Pending -> Waiting` is valid
- [ ] Write `test_stage_waiting_to_eligible` asserting `Waiting -> Eligible` is valid
- [ ] Write `test_stage_eligible_to_running` asserting `Eligible -> Running` is valid
- [ ] Write `test_stage_running_to_completed` asserting `Running -> Completed` is valid
- [ ] Write `test_stage_running_to_failed` asserting `Running -> Failed` is valid
- [ ] Write `test_stage_running_to_paused` asserting `Running -> Paused` is valid
- [ ] Write `test_stage_paused_to_running` asserting `Paused -> Running` (resume) is valid
- [ ] Write `test_stage_running_to_retrying` asserting `Running -> Retrying` is valid (for retry scenarios where the stage failed but has retries remaining)
- [ ] Write `test_stage_retrying_to_running` asserting `Retrying -> Running` is valid
- [ ] Write `test_stage_invalid_pending_to_running` asserting direct `Pending -> Running` skipping intermediate states returns `Err(InvalidTransition)`
- [ ] Write `test_stage_invalid_completed_is_terminal` asserting `Completed` rejects all transitions
- [ ] Write `test_stage_invalid_failed_is_terminal` asserting `Failed` rejects all transitions
- [ ] Write `test_stage_is_terminal` asserting `is_terminal()` returns `true` only for `Completed` and `Failed`
- [ ] Write `test_stage_display` asserting each variant has a human-readable `Display` impl

## 2. Task Implementation
- [ ] Define `StageStatus` enum with variants: `Pending`, `Waiting`, `Eligible`, `Running`, `Paused`, `Retrying`, `Completed`, `Failed`
- [ ] Derive `Debug`, `Clone`, `Copy`, `PartialEq`, `Eq`, `Hash`, `serde::Serialize`, `serde::Deserialize`
- [ ] Define `StageEvent` enum with variants: `DependenciesDeclared`, `DependenciesMet`, `Dispatch`, `Pause`, `Resume`, `Complete`, `Fail`, `Retry`
- [ ] Implement `StageStatus::transition(&self, event: StageEvent) -> Result<StageStatus, InvalidTransition>` enforcing the legal transitions per [2_TAS-REQ-020]: `Pending -> Waiting -> Eligible -> Running -> {Paused, Completed, Failed, Retrying}`, `Paused <-> Running`, `Retrying -> Running`
- [ ] Reuse the `InvalidTransition` error type from task 01 (make it generic or use `impl From` for both status types)
- [ ] Implement `StageStatus::is_terminal(&self) -> bool`
- [ ] Implement `Display` for `StageStatus`
- [ ] Add doc comments on all public types

## 3. Code Review
- [ ] Verify transition table matches the spec exactly: `Pending -> Waiting -> Eligible -> Running -> {Paused, Retrying, Completed, Failed}`, `Paused <-> Running`, `Retrying -> Running`
- [ ] Verify `InvalidTransition` is reused consistently with `RunStatus` transitions
- [ ] Verify no runtime dependencies added to `devs-core`

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-core -- stage_status` and verify all tests pass
- [ ] Run `cargo clippy -p devs-core -- -D warnings`

## 5. Update Documentation
- [ ] Ensure doc comments describe the full stage state machine transition diagram

## 6. Automated Verification
- [ ] Run `cargo test -p devs-core -- stage_status --nocapture 2>&1 | tail -5` and confirm "test result: ok"
