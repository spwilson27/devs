# Task: Verify Fan-out Sub-run Persistence Structure (Sub-Epic: 46_Risk 021 Verification)

## Covered Requirements
- [RISK-021-BR-004]

## Dependencies
- depends_on: []
- shared_components: [devs-core, devs-checkpoint, devs-proto]

## 1. Initial Test Written
- [ ] Write an E2E test in `tests/e2e/fanout_structure_test.rs` that:
    - Submits a workflow with a fan-out stage (e.g., `count: 2`).
    - Waits for the run to reach `Completed`.
    - Fetches the run status via both `devs status <run-id> --format json` (CLI) and `get_run` (MCP).
    - Asserts that the `stage_runs` array for the workflow run does NOT contain the sub-agent runs.
    - Asserts that the parent stage run contains a `fan_out_sub_runs` field which is an array of exactly 2 `StageRun` objects.
    - Asserts that `RunSummary` fields (`stage_count`, `completed_stage_count`, `failed_stage_count`) accurately reflect only top-level stages (e.g., if there's only 1 fan-out stage, the count is 1, not 1 + 2 sub-agents).
- [ ] The test MUST be annotated with `// Covers: RISK-021-BR-004`.

## 2. Task Implementation
- [ ] Ensure `WorkflowRun` and `StageRun` domain types in `devs-core` correctly define the nested structure for fan-out sub-runs.
- [ ] Verify that the `CheckpointStore` in `devs-checkpoint` correctly serializes this nested structure to `checkpoint.json`.
- [ ] Ensure the `RunSummary` calculation logic in `devs-core` explicitly ignores stages that have a parent (i.e., are sub-runs of a fan-out).
- [ ] Update gRPC and MCP response mapping logic to correctly populate the `fan_out_sub_runs` field.

## 3. Code Review
- [ ] Verify that sub-runs are excluded from the main `stage_runs` list in all external interfaces (CLI, TUI, MCP) to prevent "flat" view confusion.
- [ ] Ensure that `RunSummary` counts are derived from the top-level stage graph, not the flat list of all internal stage records.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test --test fanout_structure_test` and ensure it passes.
- [ ] Run `./do test` and ensure no traceability violations are reported for `RISK-021-BR-004`.

## 5. Update Documentation
- [ ] Update the internal "Memory" to reflect that fan-out sub-runs are now verified to be nested under their parent stage and excluded from top-level counts.

## 6. Automated Verification
- [ ] Run `.tools/verify_requirements.py` and confirm that `RISK-021-BR-004` is 100% covered.
- [ ] Inspect the `target/traceability.json` to ensure the new test is correctly mapped.
