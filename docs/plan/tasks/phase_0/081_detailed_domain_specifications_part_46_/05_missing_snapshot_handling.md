# Task: Missing Workflow Snapshot Handling for Recovered Runs (Sub-Epic: 081_Detailed Domain Specifications (Part 46))

## Covered Requirements
- [2_TAS-REQ-484]

## Dependencies
- depends_on: ["04_resilient_checkpoint_loading.md"]
- shared_components: ["devs-checkpoint", "devs-scheduler"]

## 1. Initial Test Written
- [ ] Create a test module `tests::missing_snapshot_handling` in the checkpoint or scheduler crate.
- [ ] `test_valid_checkpoint_missing_snapshot_recovers_run` — Write a valid `checkpoint.json` but delete or omit `workflow_snapshot.json`. Call the loader. Assert the run IS recovered (not skipped) and appears in `list_runs` with a normal status (e.g., its checkpointed status).
- [ ] `test_missing_snapshot_stage_needing_templates_fails` — Recover a run with a missing snapshot. Attempt to dispatch a stage that uses `{{stage.X.output}}` template variables (which requires reading the snapshot for template definitions). Assert the stage transitions to `Failed` with error kind `MissingSnapshot`.
- [ ] `test_corrupt_snapshot_treated_as_missing` — Write a `workflow_snapshot.json` with malformed JSON. Assert the same behavior as missing: run recovers, but template-dependent stages fail with `MissingSnapshot`.
- [ ] `test_missing_snapshot_stage_without_templates_succeeds` — Recover a run with a missing snapshot. Dispatch a stage that has a literal prompt (no template variables). Assert the stage proceeds normally (does not fail with `MissingSnapshot`).
- [ ] `test_missing_snapshot_error_message_informative` — Assert the `MissingSnapshot` error includes the run ID and the expected snapshot path.

## 2. Task Implementation
- [ ] In the checkpoint restore path, after successfully parsing `checkpoint.json`, attempt to load `workflow_snapshot.json`:
  - If missing or corrupt, set a flag on the recovered `WorkflowRun` (e.g., `snapshot_available: bool` or `snapshot: Option<WorkflowDefinition>`).
  - Do NOT skip the run — it is still valid for recovery.
- [ ] In the stage dispatch/template resolution path, before resolving templates:
  - Check if the workflow snapshot is available.
  - If not available AND the stage's prompt contains template variables (`{{...}}`), transition the stage immediately to `Failed` with error `MissingSnapshot`.
  - If not available but the stage has no template references, proceed normally.
- [ ] Define a `StageError::MissingSnapshot { run_id: RunId, expected_path: PathBuf }` variant.

## 3. Code Review
- [ ] Verify a missing snapshot does NOT cause the entire run to be skipped — only stages needing templates fail.
- [ ] Verify corrupt snapshots are treated identically to missing ones.
- [ ] Verify the `MissingSnapshot` error is specific to template-dependent stages, not applied blanket to all stages.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test missing_snapshot_handling` and confirm all tests pass.

## 5. Update Documentation
- [ ] Add doc comments explaining the degraded-recovery behavior: run survives, template-dependent stages fail gracefully.

## 6. Automated Verification
- [ ] Run `cargo test missing_snapshot_handling -- --nocapture` and verify zero failures.
