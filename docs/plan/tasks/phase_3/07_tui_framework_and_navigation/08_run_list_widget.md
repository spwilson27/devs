# Task: RunList Widget Implementation (Sub-Epic: 07_TUI Framework and Navigation)

## Covered Requirements
- [6_UI_UX_ARCHITECTURE-REQ-080], [6_UI_UX_ARCHITECTURE-REQ-081], [6_UI_UX_ARCHITECTURE-REQ-082], [6_UI_UX_ARCHITECTURE-REQ-083], [6_UI_UX_ARCHITECTURE-REQ-084], [6_UI_UX_ARCHITECTURE-REQ-085], [6_UI_UX_ARCHITECTURE-REQ-086], [6_UI_UX_ARCHITECTURE-REQ-087], [6_UI_UX_ARCHITECTURE-REQ-088], [6_UI_UX_ARCHITECTURE-REQ-089], [6_UI_UX_ARCHITECTURE-REQ-100], [6_UI_UX_ARCHITECTURE-REQ-101], [6_UI_UX_ARCHITECTURE-REQ-102], [6_UI_UX_ARCHITECTURE-REQ-103], [6_UI_UX_ARCHITECTURE-REQ-104], [6_UI_UX_ARCHITECTURE-REQ-249], [6_UI_UX_ARCHITECTURE-REQ-351], [6_UI_UX_ARCHITECTURE-REQ-352], [6_UI_UX_ARCHITECTURE-REQ-353], [6_UI_UX_ARCHITECTURE-REQ-354], [6_UI_UX_ARCHITECTURE-REQ-355]

## Dependencies
- depends_on: [02_app_state_and_state_management.md, 07_string_constants_and_styling.md]
- shared_components: [devs-proto (consumer)]

## 1. Initial Test Written
- [ ] Write snapshot test for RunList rendering with 3 sample runs showing name, status, elapsed time, stage progress (REQ-088)
- [ ] Write test that RunList items are sorted by `created_at` descending (newest first) (REQ-100)
- [ ] Write test for run selection: `j`/`Down` moves selection down, `k`/`Up` moves up, `Enter` selects (REQ-101)
- [ ] Write test for scroll behavior: when selection moves beyond visible area, list scrolls to keep selection visible (REQ-102)
- [ ] Write snapshot test for empty RunList showing placeholder message (REQ-103)
- [ ] Write test for RunList builder pattern: `RunList::new().items(&runs).selected(idx).build()` (REQ-089)
- [ ] Write test for UUID vs slug run resolution: UUID string parsed first, fallback to slug match (REQ-249)
- [ ] Write test that RunList fits within 42-column left pane width (REQ-104)
- [ ] Write test for run summary display: shows `completed/total` stage count, workflow name, run name (REQ-351)

## 2. Task Implementation
- [ ] Create `crates/devs-tui/src/widgets/run_list.rs` implementing `ratatui::widgets::Widget` (REQ-050, REQ-088)
- [ ] Implement `RunList` with fluent builder: `.items()`, `.selected()`, `.width()` methods (REQ-089)
- [ ] Render each run as a row: `[STATUS] run-name  workflow  3/5 stages  M:SS` (REQ-351)
- [ ] Implement vertical scrolling with selection tracking (REQ-102)
- [ ] Implement empty state rendering: centered placeholder text (REQ-103)
- [ ] Sort runs by `created_at` descending (REQ-100)
- [ ] Implement `resolve_run_id(input: &str, runs: &[RunSummary]) -> Option<Uuid>`: try `Uuid::parse_str()` first, fallback to slug prefix match (REQ-249)
- [ ] Truncate run names that exceed column width with trailing `~` (REQ-354)

## 3. Code Review
- [ ] Verify widget implements `ratatui::widgets::Widget` trait (REQ-050)
- [ ] Verify builder pattern is used (REQ-089)
- [ ] Verify sort order is correct (REQ-100)

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-tui -- run_list`

## 5. Update Documentation
- [ ] Add doc comments to RunList widget and builder methods

## 6. Automated Verification
- [ ] Run `cargo test -p devs-tui 2>&1 | tail -5` and confirm `test result: ok`
