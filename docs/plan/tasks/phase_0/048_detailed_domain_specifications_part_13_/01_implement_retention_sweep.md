# Task: Implement Retention Sweep Algorithm (Sub-Epic: 048_Detailed Domain Specifications (Part 13))

## Covered Requirements
- [2_TAS-REQ-111]

## Dependencies
- depends_on: []
- shared_components: [devs-checkpoint (owner — creates retention module), devs-core (consumer — uses domain types)]

## 1. Initial Test Written
- [ ] Create `devs-checkpoint/src/retention.rs` (or `devs-checkpoint/tests/retention.rs` if integration tests are preferred) with the following TDD tests:
- [ ] **Test `retention_sweep_deletes_runs_older_than_max_age`**: Create an in-memory representation of 5 completed runs with `completed_at` timestamps. Set `max_age_days = 7`. Two runs are 10 days old, three are 3 days old. Assert that exactly the two old runs are marked for deletion. Annotate with `// Covers: 2_TAS-REQ-111` (step 2: age-based marking).
- [ ] **Test `retention_sweep_deletes_runs_exceeding_max_size`**: Create 4 completed runs with sizes [100MB, 50MB, 30MB, 20MB] (total 200MB). Set `max_size_mb = 150`. Runs sorted by `completed_at` ascending (oldest first). Assert that the oldest run (100MB) is marked for deletion, bringing total to 100MB < 150MB. Annotate with `// Covers: 2_TAS-REQ-111` (step 3: size-based marking).
- [ ] **Test `retention_sweep_never_deletes_active_runs`**: Create 3 runs: one `Completed` (old), one `Running` (old), one `Paused` (old). Set `max_age_days = 1`. Assert only the `Completed` run is marked for deletion. The `Running` and `Paused` runs are excluded regardless of age or size. Annotate with `// Covers: 2_TAS-REQ-111` (step 5: active run exclusion).
- [ ] **Test `retention_sweep_deletes_both_runs_and_logs_atomically`**: Mock a `CheckpointStore` trait. Invoke the sweep. Assert that for each deleted run, both `.devs/runs/<run-id>/` and `.devs/logs/<run-id>/` are removed in a single commit operation. Annotate with `// Covers: 2_TAS-REQ-111` (step 4: atomic deletion).
- [ ] **Test `retention_sweep_applies_age_before_size`**: Create runs where age-based deletion alone brings size below `max_size_mb`. Assert that no additional size-based deletions occur. This validates the two-phase algorithm order (age first, then size).
- [ ] **Test `retention_sweep_runs_at_startup_and_periodically`**: Using a mock clock or test harness, assert that the sweep is invoked once at startup and then scheduled to run every 24 hours. Annotate with `// Covers: 2_TAS-REQ-111` (execution schedule).
- [ ] **Test `retention_sweep_no_runs_is_noop`**: Empty `.devs/runs/` directory. Assert sweep completes successfully with zero deletions.
- [ ] **Test `retention_sweep_sorts_by_completed_at_ascending`**: Create 5 runs with distinct `completed_at` timestamps. When size pruning is needed, assert the oldest (earliest `completed_at`) are deleted first.

## 2. Task Implementation
- [ ] Define `RetentionPolicy` struct in `devs-checkpoint/src/retention.rs`:
  ```rust
  pub struct RetentionPolicy {
      pub max_age_days: Option<u64>,
      pub max_size_mb: Option<u64>,
  }
  ```
- [ ] Define a `RetentionSweeper` struct that takes a reference to the checkpoint store and a `RetentionPolicy`.
- [ ] Implement `RetentionSweeper::sweep(&self) -> Result<SweepReport>` with the 5-step algorithm from [2_TAS-REQ-111]:
  1. List all run directories under `.devs/runs/`.
  2. For each run: if `completed_at` is older than `max_age_days`, mark for deletion.
  3. Sort remaining runs by `completed_at` descending. Compute cumulative size. Mark runs for deletion once cumulative size exceeds `max_size_mb`.
  4. Delete marked runs atomically: remove `.devs/runs/<run-id>/` and `.devs/logs/<run-id>/` then commit to the checkpoint branch.
  5. Skip any run whose state is non-terminal (`Running`, `Paused`, `Waiting`, `Eligible`).
- [ ] Define `SweepReport` struct with fields: `deleted_count: usize`, `freed_bytes: u64`, `skipped_active: usize`.
- [ ] Ensure all git2 operations in the deletion step use `tokio::task::spawn_blocking` per the shared concurrency patterns.
- [ ] Add a `start_retention_task` function that spawns a Tokio background task: runs sweep immediately, then `tokio::time::sleep(Duration::from_secs(86400))` in a loop.

## 3. Code Review
- [ ] Verify that sorting is by `completed_at` ascending (oldest first) for size-based pruning, matching step 3 of [2_TAS-REQ-111].
- [ ] Confirm that active run exclusion (step 5) is applied before both age and size checks — not just one.
- [ ] Verify that deletion is atomic: both `runs/` and `logs/` directories for a run are removed in a single git commit.
- [ ] Check that `RetentionPolicy` with both fields set to `None` results in a no-op sweep.
- [ ] Ensure no `unwrap()` calls on I/O or git operations; all errors are propagated via `Result`.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-checkpoint -- retention` and confirm all tests pass.
- [ ] Run `cargo clippy -p devs-checkpoint -- -D warnings` and confirm no warnings.

## 5. Update Documentation
- [ ] Add doc comments to `RetentionSweeper`, `RetentionPolicy`, and `sweep()` explaining the algorithm and schedule.
- [ ] Add `// Covers: 2_TAS-REQ-111` annotations to each test function.

## 6. Automated Verification
- [ ] Run `grep -r 'Covers: 2_TAS-REQ-111' devs-checkpoint/` and confirm at least 6 test functions are annotated.
- [ ] Run `./do test` and confirm the traceability report includes [2_TAS-REQ-111] with all sub-steps covered.
- [ ] Run `./do lint` and confirm no lint failures in the checkpoint crate.
