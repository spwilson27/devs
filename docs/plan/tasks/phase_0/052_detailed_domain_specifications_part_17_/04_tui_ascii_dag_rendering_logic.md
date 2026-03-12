# Task: TUI ASCII DAG Rendering Logic (Sub-Epic: 052_Detailed Domain Specifications (Part 17))

## Covered Requirements
- [2_TAS-REQ-134]

## Dependencies
- depends_on: [02_tui_test_infrastructure_setup.md]
- shared_components: [devs-tui, devs-core]

## 1. Initial Test Written
- [ ] Create a test in `devs-tui` that passes a complex `WorkflowDefinition` (with multiple dependencies) and renders it using the `DagWidget`.
- [ ] Verify that:
    - Stage boxes have the correct format: `[ stage-name | STATUS | 0:05 ]`.
    - Dependency edges are drawn with ASCII arrows.
    - Large workflows (>20 stages) correctly show only immediate predecessors and successors.
- [ ] Capture snapshots of the rendered output and save them as `.txt` files in the snapshot directory.

## 2. Task Implementation
- [ ] Implement a `DagWidget` in `devs-tui/src/widgets/dag.rs` that renders the DAG as per [2_TAS-REQ-134].
    - Use ASCII box-drawing characters for boxes and edges.
    - Implement a topological sort (or use `devs-scheduler` logic) to determine layout.
    - Implement status abbreviations as defined in the spec (e.g., `WAIT`, `ELIG`, `RUN`, `DONE`, `FAIL`, `TIME`, `CANC`, `PAUS`).
- [ ] Implement scrollable container logic for the DAG view if the number of stages exceeds the pane size.
- [ ] Implement the "filtering" logic for workflows with more than 20 stages: only render the selected stage and its immediate neighbors.
- [ ] Ensure the third field in the box shows the elapsed time in `M:SS` format.

## 3. Code Review
- [ ] Verify that the ASCII drawing is efficient and doesn't redraw more than necessary.
- [ ] Check that all status abbreviations match the specification exactly.
- [ ] Ensure the 20-stage threshold logic is correctly applied and tested.
- [ ] Confirm `missing_docs = "deny"` for the `DagWidget` and its methods.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-tui` and verify the snapshots match expectations.
- [ ] Manually verify horizontal and vertical scrolling in a terminal emulator.

## 5. Update Documentation
- [ ] Update `devs-tui/README.md` with a description of the DAG rendering strategy.
- [ ] Note the filtering logic for large workflows in the developer "memory."

## 6. Automated Verification
- [ ] Run `./do lint` and ensure no clippy errors in the rendering logic.
- [ ] Run `./do test` and check `target/traceability.json` to ensure [2_TAS-REQ-134] is covered.
