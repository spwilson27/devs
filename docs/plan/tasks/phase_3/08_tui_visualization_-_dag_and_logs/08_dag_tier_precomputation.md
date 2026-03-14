# Task: DAG Tier Precomputation & Layout (Sub-Epic: 08_TUI Visualization - DAG and Logs)

## Covered Requirements
- [7_UI_UX_DESIGN-REQ-168], [7_UI_UX_DESIGN-REQ-211], [7_UI_UX_DESIGN-REQ-262], [7_UI_UX_DESIGN-REQ-263], [7_UI_UX_DESIGN-REQ-264], [7_UI_UX_DESIGN-REQ-265], [7_UI_UX_DESIGN-REQ-266], [7_UI_UX_DESIGN-REQ-267], [7_UI_UX_DESIGN-REQ-268], [7_UI_UX_DESIGN-REQ-269], [7_UI_UX_DESIGN-REQ-271], [7_UI_UX_DESIGN-REQ-370], [7_UI_UX_DESIGN-REQ-371], [7_UI_UX_DESIGN-REQ-372], [7_UI_UX_DESIGN-REQ-373], [7_UI_UX_DESIGN-REQ-374], [7_UI_UX_DESIGN-REQ-375], [7_UI_UX_DESIGN-REQ-396], [7_UI_UX_DESIGN-REQ-397], [7_UI_UX_DESIGN-REQ-398], [7_UI_UX_DESIGN-REQ-399], [7_UI_UX_DESIGN-REQ-400]

## Dependencies
- depends_on: [03_status_labels_typography_render_utils.md, 06_event_loop_and_widget_architecture.md]
- shared_components: [devs-core (consumer), devs-proto (consumer)]

## 1. Initial Test Written
- [ ] Create `crates/devs-tui/src/widgets/dag_view.rs` (empty). Create `crates/devs-tui/tests/dag_tier_tests.rs`.
- [ ] Write `test_linear_dag_tiers` — stages A→B→C produce 3 tiers, one stage each (REQ-262).
- [ ] Write `test_parallel_dag_tiers` — A→{B,C}→D produces tiers: [A], [B,C], [D] (REQ-263).
- [ ] Write `test_diamond_dag_tiers` — A→{B,C}, {B,C}→D produces correct tiering (REQ-264).
- [ ] Write `test_single_stage_dag` — one stage produces one tier (REQ-265).
- [ ] Write `test_complex_dag_tier_ordering` — stages within a tier are sorted deterministically (alphabetically by name) (REQ-266).
- [ ] Write `test_tier_assignment_is_longest_path` — each stage's tier = 1 + max(tier of dependencies) (REQ-267).
- [ ] Write `test_dag_layout_total_width` — `DagLayout::total_width` = `num_tiers * (box_width + gutter_width) - gutter_width` (REQ-168, REQ-271).
- [ ] Write `test_dag_layout_total_height` — height = `max_stages_per_tier * (box_height + vertical_gap) - vertical_gap` (REQ-268).
- [ ] Write `test_dag_layout_recomputed_on_state_change` — when stages are added/completed, tier layout is recomputed (REQ-269, REQ-211).
- [ ] Write tests for acceptance criteria REQ-370 through REQ-375: tier computation edge cases (empty DAG, single node, wide fan-out, deep chain, disconnected subgraphs if applicable).
- [ ] Write tests for REQ-396 through REQ-400: layout stability (same input produces same layout), performance (compute under 1ms for 100 stages), gutter sizing.

## 2. Task Implementation
- [ ] Implement `DagTierComputer` in `widgets/dag_view.rs`:
  - `compute_tiers(stages: &[StageInfo]) -> Vec<Vec<&StageInfo>>` — assigns each stage to its tier using longest-path algorithm (REQ-267).
  - Stages within a tier sorted alphabetically (REQ-266).
- [ ] Implement `DagLayout` struct:
  - `tiers: Vec<Vec<StageLayoutInfo>>` — pre-computed positions.
  - `total_width: u16` — computed as `num_tiers * (BOX_WIDTH + GUTTER) - GUTTER` (REQ-168, REQ-271).
  - `total_height: u16` — based on tallest tier (REQ-268).
  - `BOX_WIDTH = 41` (38 content + brackets + separators), `GUTTER = 5` (REQ-271).
- [ ] Layout is recomputed when stage state changes (REQ-269, REQ-211), but cached between identical states.
- [ ] Handle edge cases: empty DAG, single stage, wide fan-out, deep linear chain (REQ-370-375).
- [ ] Performance: tier computation completes in <1ms for 100 stages (REQ-396-400).

## 3. Code Review
- [ ] Verify tier computation uses no quadratic algorithms.
- [ ] Verify layout is deterministic (same input → same output).

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-tui --lib widgets::dag_view` and `cargo test -p devs-tui --test dag_tier_tests`.

## 5. Update Documentation
- [ ] Document the tier computation algorithm and layout constants.

## 6. Automated Verification
- [ ] Run `./do test` and confirm all dag_tier tests pass.
