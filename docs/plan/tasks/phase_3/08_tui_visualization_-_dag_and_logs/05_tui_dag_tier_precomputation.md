# Task: TUI DAG Tier Pre-computation (Sub-Epic: 08_TUI Visualization - DAG and Logs)

## Covered Requirements
- [7_UI_UX_DESIGN-REQ-211], [7_UI_UX_DESIGN-REQ-262], [7_UI_UX_DESIGN-REQ-263], [7_UI_UX_DESIGN-REQ-264], [7_UI_UX_DESIGN-REQ-265], [7_UI_UX_DESIGN-REQ-266], [7_UI_UX_DESIGN-REQ-267], [7_UI_UX_DESIGN-REQ-268], [7_UI_UX_DESIGN-REQ-269], [7_UI_UX_DESIGN-REQ-370], [7_UI_UX_DESIGN-REQ-371], [7_UI_UX_DESIGN-REQ-372], [7_UI_UX_DESIGN-REQ-373], [7_UI_UX_DESIGN-REQ-374], [7_UI_UX_DESIGN-REQ-375], [7_UI_UX_DESIGN-REQ-396], [7_UI_UX_DESIGN-REQ-397], [7_UI_UX_DESIGN-REQ-398], [7_UI_UX_DESIGN-REQ-399], [7_UI_UX_DESIGN-REQ-400]

## Dependencies
- depends_on: [01_tui_foundational_strings_hygiene.md]
- shared_components: [devs-tui]

## 1. Initial Test Written
- [ ] Create unit tests for the `dag_tiers` computation in `crates/devs-tui/src/state/convert.rs`:
    - Linear DAG `A→B→C` returns `[["A"], ["B"], ["C"]]`.
    - Parallel DAG `A→{B,C}→D` returns `[["A"], ["B", "C"], ["D"]]`.
    - Tiers are sorted alphabetically within each tier.
    - Computation handles disconnected components (each starts at tier 0).
    - Computation handles large graphs (up to 256 nodes) within the 16ms frame budget (though it should run in `handle_event`, not render).

## 2. Task Implementation
- [ ] Implement `compute_dag_tiers(stages: &StageMap) -> Vec<Vec<StageID>>` using Kahn's topological sort adapted for tier assignment.
- [ ] Update `App::handle_event()` to recompute `dag_tiers` whenever a `RunSnapshot` or `RunDelta` event is received.
- [ ] Store the pre-computed tiers in `RunDetail::dag_tiers` within `AppState`.
- [ ] Ensure `dag_tiers` is NOT recomputed in `render()`.
- [ ] Implement `RunDetail::dag_layout` computation logic if needed (per [REQ-374]).

## 3. Code Review
- [ ] Verify that disconnected subgraphs correctly align to the same starting tier.
- [ ] Confirm that tier computation is synchronous and completes before the next event is processed.
- [ ] Check alphabetical sorting within tiers.

## 4. Run Automated Tests to Verify
- [ ] `cargo test -p devs-tui -- state::convert`

## 5. Update Documentation
- [ ] Document the DAG tier assignment algorithm and the synchronous pre-computation policy.

## 6. Automated Verification
- [ ] Run a test with a complex DAG (diamond with parallel fan-outs) and assert the exact tier structure and sorting.
