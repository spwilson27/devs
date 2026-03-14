# Task: Implement Retention Sweep Algorithm (Sub-Epic: 07_Logging & Retention)

## Covered Requirements
- [1_PRD-REQ-032], [2_TAS-REQ-086]

## Dependencies
- depends_on: [docs/plan/tasks/phase_2/07_logging_retention/01_retention_policy_config_and_delete_primitive.md]
- shared_components: [devs-checkpoint, devs-core]

## 1. Initial Test Written
- [ ] In `crates/devs-checkpoint/src/retention.rs` (new file), write tests annotated with `// Covers: 1_PRD-REQ-032` and `// Covers: 2_TAS-REQ-086`:
    - [ ] `test_sweep_deletes_runs_older_than_max_age` — create 3 completed runs: one 10 days old, one 5 days old, one 1 day old. Set `max_age_days = 7`. Assert only the 10-day-old run is deleted.
    - [ ] `test_sweep_deletes_oldest_when_max_size_exceeded` — create 3 completed runs of known sizes totaling 600MB. Set `max_size_mb = 400`. Assert the oldest run(s) are deleted until total is ≤400MB.
    - [ ] `test_sweep_applies_both_age_and_size` — set both limits. Verify age filter runs first, then size filter on remaining runs.
    - [ ] `test_sweep_skips_running_runs` [2_TAS-REQ-086] — create runs with status `Running`. Set `max_age_days = 0` (delete everything). Assert `Running` runs are NOT deleted.
    - [ ] `test_sweep_skips_paused_runs` [2_TAS-REQ-086] — same as above but with `Paused` status.
    - [ ] `test_sweep_no_policy_no_deletions` — with `RetentionPolicy::default()` (both limits `None`), assert no runs are deleted regardless of age or size.
    - [ ] `test_sweep_empty_repo_no_error` — sweep on a project with no `.devs/runs/` directory returns `Ok(())`.
    - [ ] `test_sweep_corrupt_checkpoint_skipped` — a run directory with unreadable `checkpoint.json` is skipped (logged as error), other runs still processed.

## 2. Task Implementation
- [ ] Create `crates/devs-checkpoint/src/retention.rs`:
    - [ ] Implement `pub async fn execute_retention_sweep(store: &CheckpointStore, project: &ProjectRef, policy: &RetentionPolicy) -> Result<SweepResult>`.
    - [ ] `SweepResult` struct: `deleted_count: usize`, `freed_bytes: u64`, `errors: Vec<(RunId, String)>`.
    - [ ] Algorithm:
        1. Call `store.list_runs(project)` to get all runs with their metadata (status, `completed_at`, directory size).
        2. Filter to only terminal-state runs (`Completed`, `Failed`, `Cancelled`). Runs with status `Running` or `Paused` are unconditionally excluded per [2_TAS-REQ-086].
        3. If `policy.has_age_limit()`: mark runs where `completed_at < Utc::now() - max_age` for deletion.
        4. If `policy.has_size_limit()`: compute total size of remaining (non-marked) terminal runs. Sort by `completed_at` ascending (oldest first). Mark oldest runs for deletion until total ≤ `max_size_bytes`.
        5. For each marked run, call `store.delete_run(run_id)`. Collect errors per-run; do not abort on single failure.
    - [ ] Implement `list_runs_with_metadata` on `CheckpointStore` if not already present — scans `.devs/runs/`, reads each `checkpoint.json`, computes directory sizes for `.devs/runs/<id>` + `.devs/logs/<id>`.
    - [ ] Size computation uses `spawn_blocking` with recursive directory walk.

## 3. Code Review
- [ ] Verify that `Running` and `Paused` runs are unconditionally excluded from sweep — the filter MUST be applied before any age or size checks.
- [ ] Verify oldest-first deletion order for size-based eviction.
- [ ] Verify per-run error isolation — a failed deletion does not abort the sweep.
- [ ] Verify doc comments reference [1_PRD-REQ-032] and [2_TAS-REQ-086].

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-checkpoint -- retention`.
- [ ] Verify all 8 test cases pass.

## 5. Update Documentation
- [ ] Add `// Covers: 1_PRD-REQ-032` and `// Covers: 2_TAS-REQ-086` traceability annotations to all test functions as appropriate.

## 6. Automated Verification
- [ ] Run `./do test` and verify `target/traceability.json` maps [1_PRD-REQ-032] and [2_TAS-REQ-086] to the new tests.
