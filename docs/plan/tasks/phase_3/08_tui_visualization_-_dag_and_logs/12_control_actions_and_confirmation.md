# Task: Control Actions & Confirmation Dialogs (Sub-Epic: 08_TUI Visualization - DAG and Logs)

## Covered Requirements
- [7_UI_UX_DESIGN-REQ-212], [7_UI_UX_DESIGN-REQ-213], [7_UI_UX_DESIGN-REQ-214], [7_UI_UX_DESIGN-REQ-215], [7_UI_UX_DESIGN-REQ-216], [7_UI_UX_DESIGN-REQ-217], [7_UI_UX_DESIGN-REQ-218], [7_UI_UX_DESIGN-REQ-219], [7_UI_UX_DESIGN-REQ-220], [7_UI_UX_DESIGN-REQ-221], [7_UI_UX_DESIGN-REQ-298], [7_UI_UX_DESIGN-REQ-299], [7_UI_UX_DESIGN-REQ-300], [7_UI_UX_DESIGN-REQ-301], [7_UI_UX_DESIGN-REQ-302], [7_UI_UX_DESIGN-REQ-303], [7_UI_UX_DESIGN-REQ-304]

## Dependencies
- depends_on: [11_keyboard_input_and_tab_navigation.md]
- shared_components: [devs-proto (consumer), devs-core (consumer)]

## 1. Initial Test Written
- [ ] Create `crates/devs-tui/src/confirmation.rs` (empty). Create `crates/devs-tui/tests/confirmation_tests.rs`.
- [ ] Write `test_cancel_key_triggers_confirmation` — pressing `c` on selected run sets `AppState.confirmation` to `Some(ConfirmationPrompt)` (REQ-212).
- [ ] Write `test_confirmation_accepts_y_n_esc` — confirmation prompt accepts only `y`, `n`, `Esc` (REQ-213).
- [ ] Write `test_no_multi_step_modal` — confirmation is single step, not a wizard (REQ-214).
- [ ] Write `test_submitting_state` — after `y`, state transitions to `ConfirmationStatus::Submitting` while gRPC call in flight (REQ-215).
- [ ] Write `test_confirmation_text_constructed_at_key_press` — prompt text includes run name, constructed when `c` is pressed (REQ-216).
- [ ] Write `test_dismissed_clears_confirmation` — after dismissal (`n`/`Esc`), `AppState.confirmation` is `None` (REQ-217).
- [ ] Write `test_control_result_event_type` — `TuiEvent::ControlResult` carries success/failure and message (REQ-218).
- [ ] Write `test_transient_status_message` — gRPC errors shown as transient `StatusMessage` in status bar (REQ-219).
- [ ] Write `test_status_bar_full_width_one_row` — status bar always exactly 1 row, spans full terminal width (REQ-220).
- [ ] Write `test_run_delta_cancelled` — `RunDelta` event for cancelled run updates run state in AppState (REQ-221).
- [ ] Write tests for REQ-298 through REQ-304: Dashboard focus state (RunList vs RunDetail), cancel confirmation rendering, confirmation keyboard handling edge cases, confirmation timeout behavior.

## 2. Task Implementation
- [ ] Implement `ConfirmationPrompt` struct: `run_id: RunId`, `run_name: String`, `status: ConfirmationStatus`.
- [ ] Implement `ConfirmationStatus` enum: `Awaiting`, `Submitting`, `Dismissed` (REQ-215, REQ-217).
- [ ] On `c` key: construct confirmation text with run name (REQ-216), set `AppState.confirmation = Some(...)` (REQ-212).
- [ ] On `y`: transition to Submitting, send cancel gRPC request async (REQ-215).
- [ ] On `n`/`Esc`: transition to Dismissed → None (REQ-213, REQ-217).
- [ ] No multi-step dialog (REQ-214).
- [ ] Handle `TuiEvent::ControlResult`: on success, clear confirmation; on error, show transient StatusMessage (REQ-218, REQ-219).
- [ ] Handle `RunDelta` for cancelled runs: update run status in AppState (REQ-221).
- [ ] Status bar: always 1 row, full width (REQ-220). Shows connection status and transient messages.
- [ ] Dashboard focus state and confirmation rendering (REQ-298-304).

## 3. Code Review
- [ ] Verify confirmation is strictly single-step.
- [ ] Verify status message is transient (auto-clears after timeout or next event).

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-tui --lib confirmation` and `cargo test -p devs-tui --test confirmation_tests`.

## 5. Update Documentation
- [ ] Document the confirmation flow state machine.

## 6. Automated Verification
- [ ] Run `./do test` and confirm all confirmation tests pass.
