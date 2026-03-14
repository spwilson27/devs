# Task: Checkpoint ENOSPC and Corrupt JSON Resilience Tests (Sub-Epic: 10_Phase 1 Acceptance Criteria)

## Covered Requirements
- [AC-ROAD-P1-001], [AC-ROAD-P1-005]

## Dependencies
- depends_on: ["01_phase_0_dependency_verification.md"]
- shared_components: ["devs-checkpoint", "devs-core"]

## 1. Initial Test Written
- [ ] In `crates/devs-checkpoint/tests/resilience.rs`, write unit test `test_enospc_during_checkpoint_write_no_panic`: (1) create a `TempDir`, initialize a bare git repo in it, (2) make the `.devs/` subdirectory read-only (Unix: `fs::set_permissions` with mode `0o444`; Windows: set read-only attribute), (3) construct a valid `WorkflowRun` in-memory, (4) call `save_checkpoint(&project_ref, &workflow_run)`, (5) assert the return is `Err(...)` (not a panic), (6) assert the error message or type contains `"checkpoint.write_failed"` or an IO error variant, (7) assert the in-memory `WorkflowRun` is unchanged (clone before call, compare after). Annotate with `// Covers: AC-ROAD-P1-001`.
- [ ] Write integration test `test_corrupt_checkpoint_marks_run_unrecoverable`: (1) create `TempDir` with git repo, (2) write valid JSON to `.devs/runs/run-a/checkpoint.json`, (3) write `"{broken"` to `.devs/runs/run-b/checkpoint.json`, (4) call `restore_checkpoints(&project_ref)`, (5) assert run-a is restored with a valid state, (6) assert run-b has state `Unrecoverable`, (7) assert the function returns `Ok(vec![...])` containing both runs (no crash). Annotate with `// Covers: AC-ROAD-P1-005`.

## 2. Task Implementation
- [ ] Implement ENOSPC test using `TempDir` + read-only directory approach. On Unix, `std::os::unix::fs::PermissionsExt` to set mode. On Windows, use `FILE_ATTRIBUTE_READONLY`.
- [ ] Implement corrupt checkpoint test by writing files directly to `.devs/runs/<id>/checkpoint.json` within the temp git repo.
- [ ] If `restore_checkpoints` currently propagates JSON parse errors (panics or returns `Err`), refactor it to catch `serde_json::Error` per-run and set the affected run's state to `WorkflowRunState::Unrecoverable` while continuing to load remaining runs.
- [ ] If `Unrecoverable` is not yet a variant of `WorkflowRunState` in `devs-core`, add it with a `reason: String` field.

## 3. Code Review
- [ ] Verify ENOSPC test does not fill disk — uses permission denial only.
- [ ] Verify corrupt checkpoint test uses real filesystem (not mocks) for the `restore_checkpoints` code path.
- [ ] Verify both tests include `// Covers:` annotations.
- [ ] Verify no `unwrap()` on the checkpoint restore path in production code.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-checkpoint` and confirm both new tests pass.

## 5. Update Documentation
- [ ] Add doc comments on `restore_checkpoints` describing corrupt-checkpoint handling behavior.

## 6. Automated Verification
- [ ] Run `./do test` and verify `target/traceability.json` maps `AC-ROAD-P1-001` and `AC-ROAD-P1-005`.
- [ ] Run `grep -r "AC-ROAD-P1-001\|AC-ROAD-P1-005" crates/devs-checkpoint/` and confirm matches.
