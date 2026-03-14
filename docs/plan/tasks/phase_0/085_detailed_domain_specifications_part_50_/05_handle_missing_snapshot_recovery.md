# Task: Handle Missing Snapshot Recovery (Sub-Epic: 085_Detailed Domain Specifications (Part 50))

## Covered Requirements
- [2_TAS-REQ-500]

## Dependencies
- depends_on: [03_enforce_snapshot_immutability.md]
- shared_components: [devs-core, devs-checkpoint, devs-scheduler]

## 1. Initial Test Written
- [ ] In `devs-core/src/template.rs` (or the module containing `TemplateResolver`), write `test_resolve_fails_with_missing_snapshot`:
  - Create a `TemplateResolver` with no snapshot (snapshot = `None`).
  - Call `resolve("{{stage.plan.output.summary}}", &context)`.
  - Assert it returns `Err(TemplateError::MissingSnapshot)`.
- [ ] Write `test_resolve_succeeds_with_snapshot_present`:
  - Create a `TemplateResolver` with a valid snapshot.
  - Call `resolve("{{stage.plan.output.summary}}", &context)` where the context has the referenced stage output.
  - Assert it returns `Ok(resolved_string)`.
- [ ] In `devs-scheduler` (or an integration test module), write `test_recovered_run_missing_snapshot_fails_template_stages_only`:
  - Set up a recovered workflow run with two stages:
    - Stage "summarize": prompt contains `{{stage.plan.output.result}}` (requires template resolution).
    - Stage "cleanup": prompt is a plain string with no template variables.
  - Simulate recovery with the `workflow_snapshot.json` missing (snapshot = `None` on the `WorkflowRun`).
  - Advance the scheduler.
  - Assert "summarize" transitions to `Failed` with error containing `MissingSnapshot`.
  - Assert "cleanup" transitions to `Eligible` (or `Running`) — it is NOT failed.
- [ ] Write `test_recovered_run_with_snapshot_present_all_stages_proceed`:
  - Same two-stage workflow but with a valid snapshot present.
  - Assert both stages proceed normally.
- [ ] Add `// Covers: 2_TAS-REQ-500` annotation to all test functions.

## 2. Task Implementation
- [ ] Add `MissingSnapshot` variant to `TemplateError` in `devs-core/src/template.rs`.
- [ ] Implement `Display`: `"workflow definition snapshot is missing; cannot resolve template variables"`.
- [ ] In `TemplateResolver::resolve()`, before performing any `{{...}}` substitution, check if the snapshot is available. If `self.snapshot.is_none()` and the template contains `{{stage.` references, return `Err(TemplateError::MissingSnapshot)`.
- [ ] If the template has NO `{{stage.` references (plain text or only workflow-level variables), resolution should succeed even without a snapshot.
- [ ] In the scheduler's stage dispatch logic, when preparing a stage for execution:
  1. Attempt template resolution on the prompt.
  2. If `TemplateError::MissingSnapshot` is returned, transition the stage to `Failed` with error `MissingSnapshot`.
  3. Continue processing other stages in the run — do NOT abort the entire run.
- [ ] In the checkpoint restore path (`devs-checkpoint`), if `workflow_snapshot.json` is absent, set `WorkflowRun.definition_snapshot = None` (do not crash).

## 3. Code Review
- [ ] Verify that only stages needing template resolution are failed — stages with plain-text prompts must be unaffected.
- [ ] Confirm the scheduler does not abort the entire run when one stage fails due to `MissingSnapshot`.
- [ ] Ensure checkpoint restore handles missing snapshot file gracefully (log a warning, proceed with `None`).
- [ ] Verify `TemplateResolver` correctly identifies whether a template string references stage outputs vs. having no template variables at all.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-core -- template` and `cargo test -p devs-scheduler -- snapshot`.

## 5. Update Documentation
- [ ] Add doc comment on `TemplateError::MissingSnapshot` explaining when it occurs.
- [ ] Add doc comment on the checkpoint restore behavior for missing snapshots.

## 6. Automated Verification
- [ ] Run `./do test` and verify that `target/traceability.json` includes `2_TAS-REQ-500` as covered.
- [ ] Run `./do lint` to confirm no clippy warnings or formatting issues.
