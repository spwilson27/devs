# Task: TUI Layout Algorithm Correctness (Sub-Epic: 01_core_quality_gates)

## Covered Requirements
- [AC-SGL-001], [AC-SGL-002], [AC-SGL-003], [AC-SGL-004], [AC-SGL-005], [AC-SGL-006], [AC-SGL-007], [AC-SGL-008], [AC-SGL-009], [AC-SGL-010], [AC-SGL-011], [AC-SGL-012], [AC-SGL-013], [AC-SGL-014], [AC-SGL-015], [AC-SGL-016], [AC-SGL-017], [AC-SGL-018], [AC-SGL-019], [AC-SGL-020], [AC-SGL-021], [AC-SGL-022], [AC-SGL-023], [AC-SGL-024], [AC-SGL-025], [AC-SGL-026], [AC-SGL-027], [AC-SGL-028], [AC-SGL-029], [AC-SGL-030], [AC-SGL-031]

## Dependencies
- depends_on: ["02_tui_snapshots.md"]
- shared_components: [devs-tui]

## 1. Initial Test Written
- [ ] Create `crates/devs-tui/tests/layout_correctness.rs` with tests that:
  1. Assert below-minimum terminal (79×24) returns `LayoutMode::TooSmall` with correct fields ([AC-SGL-001]).
  2. Assert below-minimum terminal (80×23) returns `LayoutMode::TooSmall` ([AC-SGL-002]).
  3. Assert minimum valid size (80×24) returns `LayoutMode::Normal` with correct pane heights ([AC-SGL-003]).
  4. Assert `dashboard_layout` at various sizes produces correct dimensions ([AC-SGL-004]–[AC-SGL-005]).
  5. Assert `logs_layout` produces correct dimensions ([AC-SGL-006]).
  6. Assert `debug_layout` produces correct dimensions ([AC-SGL-007]).
  7. Assert `pools_layout` produces correct dimensions ([AC-SGL-008]).
  8. Assert `help_overlay_layout` produces correct dimensions ([AC-SGL-009]).
  9. Assert `PaneDimensions::to_rect()` returns matching `ratatui::Rect` ([AC-SGL-010]).
  10. Assert TestBackend size (200×50) returns correct `LayoutMode::Normal` content area ([AC-SGL-011]).
  11. Assert total widths of sub-panes sum exactly to content area width at 5 different sizes ([AC-SGL-012]).
  12. Assert total heights of sub-panes sum exactly to content area height at 5 different sizes ([AC-SGL-013]).
  13. Assert additional layout invariant checks ([AC-SGL-014]–[AC-SGL-031]).
  14. Annotate all with `// Covers:`.
- [ ] Run tests to confirm red:
  ```
  cargo test -p devs-tui --test layout_correctness -- --nocapture 2>&1 | tee /tmp/layout_baseline.txt
  ```

## 2. Task Implementation
- [ ] **Implement `compute_layout(width: u16, height: u16) -> LayoutMode`**:
  - Return `LayoutMode::TooSmall { min_width: 80, min_height: 24 }` for undersized terminals.
  - Return `LayoutMode::Normal { content_area, tab_bar, status_bar }` for valid sizes.
- [ ] **Implement sub-layout functions**:
  - `dashboard_layout(content_area: Rect) -> DashboardLayout` — split pane with proportional sizing.
  - `logs_layout(content_area: Rect) -> LogsLayout`.
  - `debug_layout(content_area: Rect) -> DebugLayout`.
  - `pools_layout(content_area: Rect) -> PoolsLayout`.
  - `help_overlay_layout(content_area: Rect) -> HelpOverlayLayout`.
- [ ] **Implement `PaneDimensions`** struct with `to_rect() -> ratatui::Rect` ([AC-SGL-010]).
- [ ] **Implement layout invariant enforcement**:
  - Sub-pane widths sum exactly to content area width ([AC-SGL-012]).
  - Sub-pane heights sum exactly to content area height ([AC-SGL-013]).
  - No zero-dimension panes at any valid terminal size.
- [ ] **Test at multiple sizes** ([AC-SGL-014]–[AC-SGL-031]):
  - 80×24, 120×40, 160×50, 200×60, 240×80.
  - Verify proportional scaling at each size.
  - Verify boundary conditions between layout breakpoints.

## 3. Code Review
- [ ] Verify `LayoutMode::TooSmall` thresholds match spec (80×24 minimum).
- [ ] Verify sub-pane dimension sums are exact (no off-by-one errors).
- [ ] Verify `// Covers:` annotations present for all 31 requirement IDs.
- [ ] Confirm all public symbols have doc comments.

## 4. Run Automated Tests to Verify
- [ ] Run layout correctness tests:
  ```
  cargo test -p devs-tui --test layout_correctness -- --nocapture
  ```

## 5. Update Documentation
- [ ] Document layout algorithm and proportional sizing rules in `docs/architecture/tui.md` or similar.

## 6. Automated Verification
- [ ] Confirm all requirements covered:
  ```
  ./do presubmit 2>&1 | tee /tmp/presubmit_layout.txt
  ```
