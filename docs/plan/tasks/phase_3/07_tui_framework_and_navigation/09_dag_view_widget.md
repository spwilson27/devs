# Task: DagView ASCII DAG Rendering Widget (Sub-Epic: 07_TUI Framework and Navigation)

## Covered Requirements
- [6_UI_UX_ARCHITECTURE-REQ-051], [6_UI_UX_ARCHITECTURE-REQ-053], [6_UI_UX_ARCHITECTURE-REQ-062], [6_UI_UX_ARCHITECTURE-REQ-063], [6_UI_UX_ARCHITECTURE-REQ-064], [6_UI_UX_ARCHITECTURE-REQ-065], [6_UI_UX_ARCHITECTURE-REQ-090], [6_UI_UX_ARCHITECTURE-REQ-091], [6_UI_UX_ARCHITECTURE-REQ-092], [6_UI_UX_ARCHITECTURE-REQ-093], [6_UI_UX_ARCHITECTURE-REQ-094], [6_UI_UX_ARCHITECTURE-REQ-095], [6_UI_UX_ARCHITECTURE-REQ-105], [6_UI_UX_ARCHITECTURE-REQ-106], [6_UI_UX_ARCHITECTURE-REQ-107], [6_UI_UX_ARCHITECTURE-REQ-108], [6_UI_UX_ARCHITECTURE-REQ-109], [6_UI_UX_ARCHITECTURE-REQ-110], [6_UI_UX_ARCHITECTURE-REQ-111], [6_UI_UX_ARCHITECTURE-REQ-112], [6_UI_UX_ARCHITECTURE-REQ-113], [6_UI_UX_ARCHITECTURE-REQ-114], [6_UI_UX_ARCHITECTURE-REQ-115], [6_UI_UX_ARCHITECTURE-REQ-116], [6_UI_UX_ARCHITECTURE-REQ-117], [6_UI_UX_ARCHITECTURE-REQ-118], [6_UI_UX_ARCHITECTURE-REQ-119], [6_UI_UX_ARCHITECTURE-REQ-120], [6_UI_UX_ARCHITECTURE-REQ-356], [6_UI_UX_ARCHITECTURE-REQ-357], [6_UI_UX_ARCHITECTURE-REQ-358], [6_UI_UX_ARCHITECTURE-REQ-359], [6_UI_UX_ARCHITECTURE-REQ-360]

## Dependencies
- depends_on: ["02_app_state_and_state_management.md", "07_string_constants_and_styling.md"]
- shared_components: [devs-proto (consumer)]

## 1. Initial Test Written
- [ ] Write test that DagView uses ASCII only: `-`, `|`, `+`, `>`, space — NO Unicode box-drawing characters (REQ-051)
- [ ] Write snapshot test for single-stage DAG: one box `[ stage-name | PEND | --:-- ]` (REQ-053)
- [ ] Write snapshot test for linear 3-stage pipeline: `A ──► B ──► C` with tier columns (REQ-062)
- [ ] Write snapshot test for diamond DAG: A → B, A → C, B+C → D showing parallel tiers (REQ-063)
- [ ] Write test for tier calculation: each stage placed at `max(dependency_tiers) + 1`, root stages at tier 0 (REQ-064)
- [ ] Write test that stage name is truncated to 20 characters with trailing `~` if overflow (REQ-053)
- [ ] Write snapshot test for fan-out stage: single box with `(×3)` indicator (REQ-065)
- [ ] Write test for horizontal scrolling: when DAG width exceeds pane width, `←`/`→` keys shift view, `< scroll >` indicator appears (REQ-092)
- [ ] Write test that stage box format is exactly: `[ name-20 | STAT | M:SS ]` = 41 chars wide (REQ-053, REQ-310)
- [ ] Write test for tier gutter: exactly ` ──► ` (5 chars) between tier columns; fallback ` --> ` for non-Unicode terminals (REQ-312)

## 2. Task Implementation
- [ ] Create `crates/devs-tui/src/widgets/dag_view.rs` implementing `ratatui::widgets::Widget`
- [ ] Implement tier calculation: `calculate_tiers(stages: &[StageRunDisplay]) -> HashMap<String, usize>` using longest-path-from-root algorithm (REQ-064)
- [ ] Implement stage box renderer: `[ {name:20} | {status:4} | {elapsed:5} ]` exactly 41 chars (REQ-053)
- [ ] Implement name truncation: names > 20 chars get trailing `~` (REQ-053)
- [ ] Implement dependency arrow rendering: `──►` connecting stages at same vertical position across tiers (REQ-062)
- [ ] Implement multi-tier layout: stages grouped by tier in columns, 5-char gutter `  ──► ` between columns (REQ-312)
- [ ] Implement fan-out indicator: append `(×N)` to stage name before truncation (REQ-065)
- [ ] Implement horizontal scroll state: `dag_scroll_offset` in AppState, `←`/`→` key handlers (REQ-092)
- [ ] Render `< scroll >` indicator when DAG is wider than viewport (REQ-092)
- [ ] Ensure only ASCII characters used in rendering (REQ-051)

## 3. Code Review
- [ ] Verify no Unicode box-drawing characters anywhere in dag_view.rs (REQ-051)
- [ ] Verify tier calculation produces correct results for diamond DAG (REQ-064)
- [ ] Verify stage box is exactly 41 chars wide (REQ-053)

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-tui -- dag_view`

## 5. Update Documentation
- [ ] Add doc comments to DagView widget, tier calculation, and rendering functions

## 6. Automated Verification
- [ ] Run `cargo test -p devs-tui 2>&1 | tail -5` and confirm `test result: ok`
- [ ] Run `grep -P '[\x{2500}-\x{257F}]' crates/devs-tui/src/widgets/dag_view.rs` and confirm no Unicode box-drawing matches
