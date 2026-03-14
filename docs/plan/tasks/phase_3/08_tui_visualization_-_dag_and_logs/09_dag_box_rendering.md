# Task: DAG Box Rendering & Edge Drawing (Sub-Epic: 08_TUI Visualization - DAG and Logs)

## Covered Requirements
- [2_TAS-REQ-057], [7_UI_UX_DESIGN-REQ-118], [7_UI_UX_DESIGN-REQ-119], [7_UI_UX_DESIGN-REQ-120], [7_UI_UX_DESIGN-REQ-121], [7_UI_UX_DESIGN-REQ-122], [7_UI_UX_DESIGN-REQ-270], [7_UI_UX_DESIGN-REQ-309], [7_UI_UX_DESIGN-REQ-310], [7_UI_UX_DESIGN-REQ-420], [7_UI_UX_DESIGN-REQ-435]

## Dependencies
- depends_on: [08_dag_tier_precomputation.md, 02_theme_and_color_mode_system.md, 03_status_labels_typography_render_utils.md]
- shared_components: [devs-core (consumer), devs-proto (consumer)]

## 1. Initial Test Written
- [ ] Create rendering functions in `crates/devs-tui/src/widgets/dag_view.rs`. Create `crates/devs-tui/tests/dag_render_tests.rs`.
- [ ] Write `test_stage_box_format` — a stage box renders as `[ name | STAT | M:SS ]` with name padded/truncated to 20 chars, STAT 4 chars, elapsed 5 chars (REQ-118, 2_TAS-REQ-057).
- [ ] Write `test_stage_box_ascii_only` — all box characters are ASCII U+0020-U+007E: `[`, `]`, `|`, spaces. No Unicode box-drawing (REQ-119, REQ-270).
- [ ] Write `test_stage_box_width_deterministic` — each box is exactly 41 columns wide (REQ-120).
- [ ] Write `test_dependency_edges_arrow` — horizontal arrows `-->` connect stages between adjacent tiers (REQ-121, 2_TAS-REQ-057).
- [ ] Write `test_multiple_dependents_branch` — one stage with multiple dependents shows branching edges (REQ-122).
- [ ] Write `test_status_cell_themed` — STAT cell gets theme-aware color based on `StageStatus`; brackets and separators use `Style::new()` (REQ-309, REQ-310).
- [ ] Write snapshot test `test_dag_render_linear_snapshot` — 3-stage linear DAG rendered to TestBackend, compared to golden snapshot (REQ-420).
- [ ] Write snapshot test `test_dag_render_parallel_snapshot` — A→{B,C}→D rendered (REQ-435).
- [ ] Write `test_dag_render_monochrome` — same DAGs rendered in Monochrome mode; status distinguishable by text alone.
- [ ] Write `test_fanout_indicator` — fan-out stage shows `(xN)` appended to name (REQ-087 from task 03).

## 2. Task Implementation
- [ ] Implement `render_stage_box(stage: &StageLayoutInfo, theme: &Theme) -> Vec<Span>` in `dag_view.rs`:
  - Format: `[ {name:20} | {status:4} | {elapsed:5} ]` (REQ-118, 2_TAS-REQ-057).
  - Name: `truncate_with_tilde(name, 20)` (from render_utils).
  - Status: `STATUS_*` constant from strings.rs.
  - Elapsed: `format_elapsed(elapsed_secs)` from render_utils.
  - Only STAT cell gets status-derived style (REQ-309, REQ-310).
- [ ] Implement `render_edges(from_tier: &[StageLayoutInfo], to_tier: &[StageLayoutInfo]) -> Vec<(u16, u16, u16, u16)>`:
  - Horizontal arrows using `--` and `>` ASCII chars (REQ-121, REQ-270).
  - Branch from single trunk for multiple dependents (REQ-122).
- [ ] All structural elements use ASCII only (REQ-119, REQ-270). No Unicode box-drawing.
- [ ] Deterministic 41-column box width (REQ-120).

## 3. Code Review
- [ ] Verify no Unicode characters in box drawing code.
- [ ] Verify STAT cell is the only themed cell in the box.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-tui --lib widgets::dag_view` and `cargo test -p devs-tui --test dag_render_tests`.

## 5. Update Documentation
- [ ] Document the stage box format and edge drawing conventions.

## 6. Automated Verification
- [ ] Run `./do test` and confirm all DAG render tests and snapshots pass.
