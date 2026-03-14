# Task: Keyboard Input & Tab Navigation (Sub-Epic: 08_TUI Visualization - DAG and Logs)

## Covered Requirements
- [7_UI_UX_DESIGN-REQ-201], [7_UI_UX_DESIGN-REQ-202], [7_UI_UX_DESIGN-REQ-203], [7_UI_UX_DESIGN-REQ-204], [7_UI_UX_DESIGN-REQ-205], [7_UI_UX_DESIGN-REQ-206], [7_UI_UX_DESIGN-REQ-207], [7_UI_UX_DESIGN-REQ-208], [7_UI_UX_DESIGN-REQ-209], [7_UI_UX_DESIGN-REQ-210]

## Dependencies
- depends_on: ["06_event_loop_and_widget_architecture.md", "07_layout_system_and_terminal_sizing.md"]
- shared_components: [devs-core (consumer)]

## 1. Initial Test Written
- [ ] Create `crates/devs-tui/src/input.rs` (empty). Create `crates/devs-tui/tests/input_tests.rs`.
- [ ] Write `test_keyboard_only_no_mouse` — verify no mouse event handlers exist at MVP (REQ-201).
- [ ] Write `test_active_tab_bold_style` — active tab rendered with STYLE_PRIMARY (BOLD) (REQ-202).
- [ ] Write `test_key_dispatch_context_computed_first` — `dispatch_key()` computes `KeyDispatchContext` (current tab, selected run, modal state) at top of function before dispatching (REQ-203).
- [ ] Write `test_tab_switch_clears_selected_stage` — switching tabs sets `selected_stage_name = None` (REQ-204).
- [ ] Write `test_missing_selected_run_on_reconnect` — if `selected_run_id` references a run no longer in state after reconnect, it is cleared to None (REQ-205).
- [ ] Write `test_all_bindings_single_key` — no chord/multi-key bindings (REQ-206).
- [ ] Write `test_help_overlay_modal_keys` — when HelpOverlay is shown, only `?`, `Esc`, `q`, `Tab` are processed; all other keys ignored (REQ-207).
- [ ] Write `test_ctrl_c_handled_before_context` — Ctrl+C is always handled regardless of current context/modal state (REQ-208).
- [ ] Write `test_cancel_key_requires_selected_run` — pressing `c` only triggers cancel when `selected_run_id.is_some()` (REQ-209).
- [ ] Write `test_pause_key_requires_running_status` — pressing `p` only triggers pause when selected run status is Running (REQ-210).

## 2. Task Implementation
- [ ] Implement `dispatch_key(key: KeyEvent, state: &mut AppState)` in `input.rs`:
  - Compute `KeyDispatchContext` at function top: `{ tab, selected_run_id, selected_stage, modal_state }` (REQ-203).
  - Ctrl+C always handled first, regardless of context (REQ-208).
  - If HelpOverlay active: only `?`/`Esc`/`q`/`Tab` processed (REQ-207).
  - Tab keys: `1`-`4` or `Tab` switch tabs; switching clears `selected_stage_name` (REQ-204).
  - Action keys: `c` (cancel, requires selected run — REQ-209), `p` (pause, requires Running — REQ-210), `r` (resume), `q` (quit), `?` (toggle help).
  - All bindings are single-key, no chords (REQ-206).
- [ ] Handle missing `selected_run_id` after reconnect: clear to None if run no longer exists (REQ-205).
- [ ] Active tab style: BOLD (STYLE_PRIMARY) (REQ-202).
- [ ] No mouse support at MVP (REQ-201).

## 3. Code Review
- [ ] Verify Ctrl+C is handled before any context check in dispatch_key.
- [ ] Verify no multi-key chord patterns.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-tui --lib input` and `cargo test -p devs-tui --test input_tests`.

## 5. Update Documentation
- [ ] Document all key bindings in a table in input.rs doc comments.

## 6. Automated Verification
- [ ] Run `./do test` and confirm all input tests pass.
