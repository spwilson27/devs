# Task: TUI State Synchronization (Snapshots and Deltas) (Sub-Epic: 07_TUI Framework and Navigation)

## Covered Requirements
- [6_UI_UX_ARCHITECTURE-REQ-176]
- [6_UI_UX_ARCHITECTURE-REQ-177]
- [6_UI_UX_ARCHITECTURE-REQ-178]
- [6_UI_UX_ARCHITECTURE-REQ-180]
- [6_UI_UX_ARCHITECTURE-REQ-181]
- [6_UI_UX_ARCHITECTURE-REQ-182]
- [6_UI_UX_ARCHITECTURE-REQ-183]

## Dependencies
- depends_on: [06_tui_grpc_reconnect_loop.md]
- shared_components: [devs-tui]

## 1. Initial Test Written
- [ ] Create a unit test for `handle_event(RunSnapshot)` that verifies `AppState::runs` is replaced and sorted.
- [ ] Create a unit test for `handle_event(RunDelta)` that verifies an existing run is updated in-place and re-sorted.
- [ ] Create a unit test for `handle_event(LogLine)` that verifies a new `LogBuffer` is created if one doesn't exist.
- [ ] Create a test that verifies `selected_run_id` is cleared if it's no longer present in a `RunSnapshot`.

## 2. Task Implementation
- [ ] Implement `handle_event()` in `src/state.rs` to process `RunSnapshot`, `RunDelta`, and `LogLine`.
- [ ] Implement sorting of `AppState::runs` by `created_at` descending.
- [ ] Implement `LogBuffer` logic to store the last 500 lines per stage and handle the `total_received` counter.
- [ ] Handle the `run.snapshot` vs `run.delta` semantics: snapshots replace state, deltas update it.
- [ ] Ensure `render()` is blocked while `handle_event()` is executing to prevent inconsistent state rendering.

## 3. Code Review
- [ ] Verify that `handle_event()` is the ONLY place where `AppState` is mutated.
- [ ] Ensure that `LogLine` events for stages without a buffer are handled correctly (create-on-demand).
- [ ] Verify that first event after gRPC stream establishment is always treated as a snapshot.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-tui`.

## 5. Update Documentation
- [ ] Update `docs/plan/tasks/phase_3_grouping.json` if necessary to reflect implementation progress.

## 6. Automated Verification
- [ ] Run `cargo test -p devs-tui` and check the unit test results.
