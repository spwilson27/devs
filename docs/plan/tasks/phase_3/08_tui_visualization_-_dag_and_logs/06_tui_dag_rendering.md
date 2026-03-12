# Task: TUI DAG Rendering (Sub-Epic: 08_TUI Visualization - DAG and Logs)

## Covered Requirements
- [2_TAS-REQ-057], [7_UI_UX_DESIGN-REQ-118], [7_UI_UX_DESIGN-REQ-119], [7_UI_UX_DESIGN-REQ-120], [7_UI_UX_DESIGN-REQ-121], [7_UI_UX_DESIGN-REQ-122], [7_UI_UX_DESIGN-REQ-270], [7_UI_UX_DESIGN-REQ-309], [7_UI_UX_DESIGN-REQ-310], [7_UI_UX_DESIGN-REQ-420], [7_UI_UX_DESIGN-REQ-435]

## Dependencies
- depends_on: [01_tui_foundational_strings_hygiene.md, 02_tui_theme_styling.md, 05_tui_dag_tier_precomputation.md]
- shared_components: [devs-tui]

## 1. Initial Test Written
- [ ] Create TUI integration tests using `TestBackend` to verify:
    - `DagView` renders a stage box in the format `[ name | STAT | M:SS ]`.
    - Stage name truncation with `~` suffix if over 20 chars.
    - Status label uses 4-character fixed-width (e.g., `"RUN "`).
    - Elapsed time format `M:SS` or `--:--` if not started.
    - Dependency arrows `──►` connect stage boxes between adjacent tiers.
    - Multiple dependents branch from a single horizontal trunk.
    - ASCII-only characters (U+0020–U+007E) used for all structural elements.
    - Fan-out indicator `(×N)` is appended to stage name.

## 2. Task Implementation
- [ ] Implement `DagView` widget.
- [ ] Implement `render_stage_box()` helper that handles name truncation and formatting.
- [ ] Implement `render_dependency_arrows()` helper that connects stages in tier `i` to their dependents in tier `i+1`.
- [ ] Implement support for fan-out sub-run counts in labels.
- [ ] Use `Theme` to apply colors to the `STAT` cell based on the `StageStatus`.
- [ ] Ensure all layout calculations use the deterministic widths (38 columns per box + gutter).

## 3. Code Review
- [ ] Verify that no Unicode box-drawing characters are used.
- [ ] Confirm that `render()` does NOT mutate `AppState` or recompute tiers.
- [ ] Ensure name truncation correctly handles the `(×N)` suffix.

## 4. Run Automated Tests to Verify
- [ ] `cargo test -p devs-tui -- widgets::dag`

## 5. Update Documentation
- [ ] Document the DAG box format and arrow layout in `crates/devs-tui/README.md`.

## 6. Automated Verification
- [ ] Run a `TestBackend` snapshot test for a diamond-shaped DAG and verify the ASCII output line by line.
