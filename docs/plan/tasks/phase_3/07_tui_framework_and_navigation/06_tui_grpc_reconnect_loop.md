# Task: gRPC Connection and Reconnect Loop (Sub-Epic: 07_TUI Framework and Navigation)

## Covered Requirements
- [2_TAS-REQ-059]
- [6_UI_UX_ARCHITECTURE-REQ-013]
- [6_UI_UX_ARCHITECTURE-REQ-014]
- [6_UI_UX_ARCHITECTURE-REQ-039]
- [6_UI_UX_ARCHITECTURE-REQ-337]
- [6_UI_UX_ARCHITECTURE-REQ-338]
- [6_UI_UX_ARCHITECTURE-REQ-339]
- [6_UI_UX_ARCHITECTURE-REQ-340]
- [6_UI_UX_ARCHITECTURE-REQ-341]
- [6_UI_UX_ARCHITECTURE-REQ-342]
- [6_UI_UX_ARCHITECTURE-REQ-343]
- [6_UI_UX_ARCHITECTURE-REQ-469]

## Dependencies
- depends_on: [05_tui_tab_navigation.md, 01_shared_discovery_logic.md]
- shared_components: [devs-tui, devs-client-util]

## 1. Initial Test Written
- [ ] Create a test for the TUI reconnect loop that simulates 30s of failure + 5s grace and asserts the app exits with code 1.
- [ ] Create a mock gRPC server using `mockall` or `tonic::test` that simulates a connection drop and verify the TUI enters the reconnect state.
- [ ] Create a test that verifies `x-devs-client-version` is sent with every request.

## 2. Task Implementation
- [ ] Implement the `ConnectionLoop` as a background tokio task.
- [ ] Handle server discovery and lazy connection using `devs-client-util`.
- [ ] Implement the `StreamRunEvents` and `StreamLogLines` gRPC streaming subscriptions.
- [ ] Handle `UNAVAILABLE` errors by transitioning `AppState::connection_status` to `Reconnecting`.
- [ ] Implement the 30-second reconnect timer + 5-second final grace period before exiting.
- [ ] Ensure that `MSG_TERMINAL_TOO_SMALL` takes precedence over connection error displays if both occur.

## 3. Code Review
- [ ] Verify that gRPC streams are correctly re-established on reconnect.
- [ ] Ensure that no real network connections are made in unit tests (use mocks).
- [ ] Verify that `x-devs-client-version` major version mismatch returns `FAILED_PRECONDITION`.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-tui`.

## 5. Update Documentation
- [ ] Update `docs/plan/tasks/phase_3_grouping.json` if necessary to reflect implementation progress.

## 6. Automated Verification
- [ ] Run `cargo test -p devs-tui` and check the unit test results.
