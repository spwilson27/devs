# Task: Connection State Machine and Reconnect Logic (Sub-Epic: 07_TUI Framework and Navigation)

## Covered Requirements
- [2_TAS-REQ-059], [6_UI_UX_ARCHITECTURE-REQ-137], [6_UI_UX_ARCHITECTURE-REQ-153], [6_UI_UX_ARCHITECTURE-REQ-154], [6_UI_UX_ARCHITECTURE-REQ-155], [6_UI_UX_ARCHITECTURE-REQ-156], [6_UI_UX_ARCHITECTURE-REQ-157], [6_UI_UX_ARCHITECTURE-REQ-158], [6_UI_UX_ARCHITECTURE-REQ-159], [6_UI_UX_ARCHITECTURE-REQ-160], [6_UI_UX_ARCHITECTURE-REQ-161], [6_UI_UX_ARCHITECTURE-REQ-162], [6_UI_UX_ARCHITECTURE-REQ-163], [6_UI_UX_ARCHITECTURE-REQ-164], [6_UI_UX_ARCHITECTURE-REQ-165], [6_UI_UX_ARCHITECTURE-REQ-166], [6_UI_UX_ARCHITECTURE-REQ-167], [6_UI_UX_ARCHITECTURE-REQ-168], [6_UI_UX_ARCHITECTURE-REQ-169], [6_UI_UX_ARCHITECTURE-REQ-170], [6_UI_UX_ARCHITECTURE-REQ-434], [6_UI_UX_ARCHITECTURE-REQ-435], [6_UI_UX_ARCHITECTURE-REQ-436], [6_UI_UX_ARCHITECTURE-REQ-437]

## Dependencies
- depends_on: ["01_tui_crate_scaffold_and_event_loop.md", "02_app_state_and_state_management.md", "03_grpc_client_and_discovery.md"]
- shared_components: [devs-core (consumer)]

## 1. Initial Test Written
- [ ] Write test for `ConnectionStatus` state machine transitions: `Connected → Reconnecting → Connected` (successful reconnect) (REQ-153)
- [ ] Write test for `Connected → Reconnecting → Disconnected` (timeout exceeded) (REQ-153)
- [ ] Write test for exponential backoff sequence: delays are 1s, 2s, 4s, 8s, 16s, 30s (capped at 30s) (2_TAS-REQ-059, REQ-155)
- [ ] Write test that total reconnect budget is 30 seconds cumulative, then 5-second grace period, then exit code 1 (2_TAS-REQ-059, REQ-156, REQ-434)
- [ ] Write test that StatusBar shows `"RECONNECTING"` during backoff attempts and `"DISCONNECTED"` after timeout (REQ-435, REQ-436)
- [ ] Write test that successful reconnect transitions StatusBar to `"CONNECTED"` and clears reconnect banner (REQ-437)
- [ ] Write test for `TuiEvent::ConnectionLost` triggering transition from Connected to Reconnecting (REQ-157)
- [ ] Write test for `TuiEvent::ConnectionRestored` resetting backoff state and transitioning to Connected (REQ-158)
- [ ] Write test that quit command (`q`) during reconnect exits with code 0 regardless of connection status (REQ-165)

## 2. Task Implementation
- [ ] Implement `ConnectionStateMachine` in `crates/devs-tui/src/reconnect.rs` with states: `Connected`, `Reconnecting { attempt: u32, next_backoff_ms: u64, total_elapsed_ms: u64 }`, `Disconnected`
- [ ] Implement backoff calculator: `next_delay(attempt) -> Duration` returning 1s, 2s, 4s, 8s, 16s, 30s cap (REQ-155)
- [ ] Implement reconnect loop: on connection loss, spawn tokio task that attempts reconnection with backoff, emitting `TuiEvent::ConnectionLost` / `TuiEvent::ConnectionRestored` / `TuiEvent::ReconnectTimeout` (REQ-156, REQ-157, REQ-158)
- [ ] Implement 30-second total budget tracking: sum of all backoff delays must not exceed 30s (REQ-156)
- [ ] Implement 5-second grace period after budget exhaustion before exit (REQ-434)
- [ ] Implement exit with code 1 and message `"Disconnected from server. Exiting."` when grace period expires (REQ-434)
- [ ] Wire `ConnectionStatus` changes to `AppState.connection_status` in `handle_event()` (REQ-137)
- [ ] Ensure `q` key exits cleanly (code 0) regardless of connection state (REQ-165)

## 3. Code Review
- [ ] Verify backoff sequence matches spec exactly: 1, 2, 4, 8, 16, 30 (REQ-155)
- [ ] Verify total budget is 30s + 5s grace, not per-attempt (REQ-156)
- [ ] Verify exit code is 1 on timeout, 0 on quit (REQ-165, REQ-434)

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-tui -- reconnect`

## 5. Update Documentation
- [ ] Add doc comments to ConnectionStateMachine and all transitions

## 6. Automated Verification
- [ ] Run `cargo test -p devs-tui 2>&1 | tail -5` and confirm `test result: ok`
