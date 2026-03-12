# Task: Implement Retention Sweep Algorithm (Sub-Epic: 07_Logging & Retention)

## Covered Requirements
- [1_PRD-REQ-032], [2_TAS-REQ-111]

## Dependencies
- depends_on: [docs/plan/tasks/phase_2/07_logging_retention/01_checkpoint_delete_run.md]
- shared_components: [devs-checkpoint, devs-core]

## 1. Initial Test Written
- [ ] Create a unit test for `RetentionSweep::execute` in `devs-checkpoint` or a related engine module.
- [ ] The test should simulate a set of runs with different completion timestamps and directory sizes.
- [ ] Verify that:
    - [ ] Runs older than `max_age_days` are correctly identified and passed to `delete_run`.
    - [ ] If `max_size_mb` is exceeded, the oldest runs (by `completed_at` descending) are identified for deletion until the total size is within the limit.
    - [ ] Active (non-terminal) runs are **EXCLUDED** from the sweep regardless of age or size [2_TAS-REQ-111].
    - [ ] Runs with status `Running` or `Paused` are never deleted [2_TAS-REQ-086].

## 2. Task Implementation
- [ ] Implement the `RetentionPolicy` struct in `devs-core` and the sweep logic in `devs-checkpoint`.
- [ ] Sweep Algorithm implementation:
    1. Scan `.devs/runs/` to find all run directories.
    2. Load each run's `checkpoint.json` to extract `status`, `completed_at`, and `size`.
    3. Identify terminal-state runs (`Completed`, `Failed`, `Cancelled`).
    4. Apply `max_age_days`: Mark runs for deletion if `completed_at < (now - max_age)`.
    5. Apply `max_size_mb`: Sort remaining terminal runs by `completed_at` descending.
    6. Compute cumulative size and mark runs for deletion once the limit is exceeded.
    7. Call `delete_run` for all marked runs.
- [ ] Ensure the size computation includes both the `.devs/runs/<run-id>` and `.devs/logs/<run-id>` directories.

## 3. Code Review
- [ ] Verify that non-terminal runs are never marked for deletion.
- [ ] Ensure that the sorting order for size-based deletion is correct (oldest deleted first).
- [ ] Check for proper error handling if a `checkpoint.json` is unreadable or corrupt.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-checkpoint` and specifically target the sweep tests.

## 5. Update Documentation
- [ ] Document the retention policy configuration in the server's documentation or agent memory.

## 6. Automated Verification
- [ ] Run `./do test` and verify coverage for `1_PRD-REQ-032` and `2_TAS-REQ-111`.
