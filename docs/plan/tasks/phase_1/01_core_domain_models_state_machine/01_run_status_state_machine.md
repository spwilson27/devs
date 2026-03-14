# Task: Implement RunStatus State Machine (Sub-Epic: 01_Core Domain Models & State Machine)

## Covered Requirements
- [2_TAS-REQ-019]

## Dependencies
- depends_on: [none]
- shared_components: [devs-core (Owner — this task extends the existing devs-core crate)]

## 1. Initial Test Written
- [ ] Create `crates/devs-core/src/state_machine/run_status_tests.rs` (or equivalent test module in `crates/devs-core/tests/`)
- [ ] Write a test `test_run_status_pending_to_running` that creates a `RunStatus::Pending` and asserts `transition(RunEvent::Start)` returns `Ok(RunStatus::Running)`
- [ ] Write a test `test_run_status_running_to_completed` that asserts `Running -> Completed` is valid
- [ ] Write a test `test_run_status_running_to_failed` that asserts `Running -> Failed` is valid
- [ ] Write a test `test_run_status_running_to_paused` that asserts `Running -> Paused` is valid
- [ ] Write a test `test_run_status_paused_to_running` that asserts `Paused -> Running` (resume) is valid
- [ ] Write a test `test_run_status_invalid_pending_to_completed` that asserts `Pending -> Completed` returns an `Err(InvalidTransition)`
- [ ] Write a test `test_run_status_invalid_completed_to_running` that asserts terminal states reject all transitions
- [ ] Write a test `test_run_status_invalid_failed_to_running` that asserts `Failed` is terminal
- [ ] Write a test `test_run_status_all_terminal_states_reject_transitions` parameterized over `Completed` and `Failed`, asserting all transition attempts return `Err`
- [ ] Write a test `test_run_status_display` that asserts each variant has a human-readable `Display` impl

## 2. Task Implementation
- [ ] Define `RunStatus` enum in `crates/devs-core/src/state_machine/mod.rs` (or `run_status.rs`) with variants: `Pending`, `Running`, `Paused`, `Completed`, `Failed`
- [ ] Derive `Debug`, `Clone`, `Copy`, `PartialEq`, `Eq`, `Hash`, `serde::Serialize`, `serde::Deserialize` on `RunStatus`
- [ ] Implement `RunStatus::transition(&self, event: RunEvent) -> Result<RunStatus, InvalidTransition>` enforcing the legal transitions: `Pending -> Running -> {Paused, Completed, Failed}`, `Paused <-> Running`
- [ ] Define `RunEvent` enum with variants: `Start`, `Pause`, `Resume`, `Complete`, `Fail`
- [ ] Define `InvalidTransition` error struct containing `from: RunStatus`, `event: RunEvent` with `Display` and `std::error::Error` impls
- [ ] Implement `RunStatus::is_terminal(&self) -> bool` returning `true` for `Completed` and `Failed`
- [ ] Implement `Display` for `RunStatus`
- [ ] Add doc comments on all public types and methods

## 3. Code Review
- [ ] Verify `RunStatus` transition table exactly matches the spec: `Pending -> Running -> Paused <-> Running -> {Completed, Failed}`
- [ ] Verify no `unsafe` code is used
- [ ] Verify `InvalidTransition` error includes enough context for debugging (from state + attempted event)
- [ ] Verify no runtime dependencies are added to `devs-core` (no tokio, no git2, etc.)

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-core -- run_status` and verify all tests pass
- [ ] Run `cargo clippy -p devs-core -- -D warnings` and verify zero warnings

## 5. Update Documentation
- [ ] Ensure doc comments describe the state machine transition rules inline on the `transition` method

## 6. Automated Verification
- [ ] Run `cargo test -p devs-core -- run_status --nocapture 2>&1 | tail -5` and confirm "test result: ok" appears
- [ ] Run `cargo doc -p devs-core --no-deps` and verify it succeeds without warnings
