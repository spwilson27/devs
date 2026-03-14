# Task: StageList Widget and Stage Status Rendering (Sub-Epic: 07_TUI Framework and Navigation)

## Covered Requirements
- [6_UI_UX_ARCHITECTURE-REQ-096], [6_UI_UX_ARCHITECTURE-REQ-097], [6_UI_UX_ARCHITECTURE-REQ-098], [6_UI_UX_ARCHITECTURE-REQ-099], [6_UI_UX_ARCHITECTURE-REQ-121], [6_UI_UX_ARCHITECTURE-REQ-122], [6_UI_UX_ARCHITECTURE-REQ-123], [6_UI_UX_ARCHITECTURE-REQ-124], [6_UI_UX_ARCHITECTURE-REQ-125], [6_UI_UX_ARCHITECTURE-REQ-126], [6_UI_UX_ARCHITECTURE-REQ-127], [6_UI_UX_ARCHITECTURE-REQ-128], [6_UI_UX_ARCHITECTURE-REQ-129], [6_UI_UX_ARCHITECTURE-REQ-361], [6_UI_UX_ARCHITECTURE-REQ-362], [6_UI_UX_ARCHITECTURE-REQ-363], [6_UI_UX_ARCHITECTURE-REQ-364], [6_UI_UX_ARCHITECTURE-REQ-365]

## Dependencies
- depends_on: ["02_app_state_and_state_management.md", "07_string_constants_and_styling.md"]
- shared_components: [devs-proto (consumer)]

## 1. Initial Test Written
- [ ] Write snapshot test for StageList with 4 stages in different states (PEND, RUN, DONE, FAIL) showing tabular layout (REQ-096)
- [ ] Write test that stage rows show: name, status label (4 chars), elapsed time (M:SS), attempt count (REQ-097)
- [ ] Write test that fan-out sub-agents are shown as indented rows under parent stage (REQ-065, REQ-121)
- [ ] Write test for stage selection: `j`/`Down` and `k`/`Up` navigate, `Enter` selects stage for log viewing (REQ-122)
- [ ] Write test that selected stage highlights the row (REQ-123)
- [ ] Write snapshot test for empty stage list showing placeholder (REQ-124)
- [ ] Write test for `StageRunDisplay` conversion from proto `StageRun` message (REQ-125)

## 2. Task Implementation
- [ ] Create `crates/devs-tui/src/widgets/stage_list.rs` implementing `ratatui::widgets::Widget` (REQ-096)
- [ ] Render stage rows as table: `| name | STATUS | M:SS | attempt |` (REQ-097)
- [ ] Implement fan-out sub-agent indentation: sub-agents prefixed with `  ├─ ` or `  └─ ` (REQ-121)
- [ ] Implement vertical scrolling and selection tracking (REQ-122)
- [ ] Implement row highlighting for selected stage (REQ-123)
- [ ] Implement `StageRunDisplay` struct with conversion `From<proto::StageRun>` (REQ-125)
- [ ] Support empty state rendering (REQ-124)
- [ ] Implement stage name truncation consistent with DagView (20 char max with `~`)

## 3. Code Review
- [ ] Verify StageList implements Widget trait
- [ ] Verify fan-out sub-agents rendered correctly (REQ-121)
- [ ] Verify status labels use constants from strings.rs (REQ-052)

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-tui -- stage_list`

## 5. Update Documentation
- [ ] Add doc comments to StageList widget

## 6. Automated Verification
- [ ] Run `cargo test -p devs-tui 2>&1 | tail -5` and confirm `test result: ok`
