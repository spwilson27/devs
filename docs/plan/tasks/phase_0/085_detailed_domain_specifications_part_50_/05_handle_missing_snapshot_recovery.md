# Task: Handle Missing Snapshot Recovery (Sub-Epic: 085_Detailed Domain Specifications (Part 50))

## Covered Requirements
- [2_TAS-REQ-500]

## Dependencies
- depends_on: [03_enforce_snapshot_immutability.md]
- shared_components: [devs-core, devs-server]

## 1. Initial Test Written
- [ ] Write an integration test in `devs-server` that simulates run recovery where `workflow_snapshot.json` is missing from the disk.
- [ ] Define a workflow with two stages: one that uses template variables (e.g., `{{stage.first.output}}`) and one that does not.
- [ ] Recover the run.
- [ ] Assert that the stage with template variables transitions to `Failed` with error `MissingSnapshot`.
- [ ] Assert that the stage without template variables continues to execute (transitions to `Eligible` or `Running`).

## 2. Task Implementation
- [ ] In `devs-core/src/template.rs` (TemplateResolver), add a check for the existence of the definition snapshot.
- [ ] If a template resolution is requested and no snapshot is available (returned as `None` from the provider), return `TemplateError::MissingSnapshot`.
- [ ] Update the stage transition logic in `devs-scheduler` to handle `TemplateError::MissingSnapshot` by failing the stage.
- [ ] Ensure the server's recovery logic correctly handles the absence of the file without crashing the entire project recovery.

## 3. Code Review
- [ ] Verify that stages without templates are unaffected.
- [ ] Ensure the `MissingSnapshot` error is correctly reported in the `StageRun` record.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-core` and integration tests in `devs-server`.

## 5. Update Documentation
- [ ] Document the recovery behavior in the TAS or server architecture notes.

## 6. Automated Verification
- [ ] Run `./do test` and verify that `target/traceability.json` shows `2_TAS-REQ-500` as covered.
