# Task: Debug Tab with Agent Inspection and Controls (Sub-Epic: 07_TUI Framework and Navigation)

## Covered Requirements
- [6_UI_UX_ARCHITECTURE-REQ-206], [6_UI_UX_ARCHITECTURE-REQ-207], [6_UI_UX_ARCHITECTURE-REQ-208], [6_UI_UX_ARCHITECTURE-REQ-209], [6_UI_UX_ARCHITECTURE-REQ-256], [6_UI_UX_ARCHITECTURE-REQ-257], [6_UI_UX_ARCHITECTURE-REQ-258], [6_UI_UX_ARCHITECTURE-REQ-259], [6_UI_UX_ARCHITECTURE-REQ-260], [6_UI_UX_ARCHITECTURE-REQ-261], [6_UI_UX_ARCHITECTURE-REQ-262], [6_UI_UX_ARCHITECTURE-REQ-263], [6_UI_UX_ARCHITECTURE-REQ-264], [6_UI_UX_ARCHITECTURE-REQ-265], [6_UI_UX_ARCHITECTURE-REQ-381], [6_UI_UX_ARCHITECTURE-REQ-382], [6_UI_UX_ARCHITECTURE-REQ-383], [6_UI_UX_ARCHITECTURE-REQ-384], [6_UI_UX_ARCHITECTURE-REQ-385]

## Dependencies
- depends_on: [06_layout_system_and_terminal_constraints.md, 11_log_pane_and_ansi_stripping.md, 10_stage_list_widget.md]
- shared_components: [devs-proto (consumer)]

## 1. Initial Test Written
- [ ] Write snapshot test for DebugTab three-section layout: agent selector (top), agent detail (middle), control bar (bottom) (REQ-206, REQ-307)
- [ ] Write test that DebugTab shows selected agent's progress: current stage, status, elapsed time (REQ-207)
- [ ] Write test for working directory diff display area (REQ-208)
- [ ] Write test that `c` key on DebugTab sends cancel signal for selected agent/stage (REQ-218, REQ-209)
- [ ] Write test that `p` key on DebugTab sends pause signal (REQ-218, REQ-209)
- [ ] Write test that `r` key on DebugTab sends resume signal (REQ-218, REQ-209)
- [ ] Write snapshot test for DebugTab with no agent selected: shows placeholder (REQ-256)
- [ ] Write test that control actions trigger gRPC calls to server (REQ-260)

## 2. Task Implementation
- [ ] Create `crates/devs-tui/src/tabs/debug.rs` implementing `DebugTab` as a Widget
- [ ] Implement three-section vertical layout (REQ-307): agent selector, agent detail with log view, control bar
- [ ] Implement agent selector: list agents running in selected run, navigable with arrow keys (REQ-207)
- [ ] Implement agent detail: show current stage, status, elapsed time, live log tail (REQ-207)
- [ ] Implement diff view section: display working directory diff for selected agent (REQ-208)
- [ ] Wire control keys: `c` → cancel, `p` → pause, `r` → resume — these emit gRPC RPCs (REQ-209, REQ-260)
- [ ] Guard control keys: only active when `active_tab == Tab::Debug` or `Tab::Dashboard` (REQ-218)
- [ ] Render placeholder when no agent/run selected (REQ-256)

## 3. Code Review
- [ ] Verify control keys are properly guarded by tab check (REQ-218)
- [ ] Verify gRPC calls are non-blocking (fire-and-forget with status update on response)

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-tui -- debug_tab`

## 5. Update Documentation
- [ ] Add doc comments to DebugTab

## 6. Automated Verification
- [ ] Run `cargo test -p devs-tui 2>&1 | tail -5` and confirm `test result: ok`
