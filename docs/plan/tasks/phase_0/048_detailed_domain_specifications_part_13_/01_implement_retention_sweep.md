# Task: Implement Retention Sweep Algorithm (Sub-Epic: 048_Detailed Domain Specifications (Part 13))

## Covered Requirements
- [2_TAS-REQ-111]

## Dependencies
- depends_on: [none]
- shared_components: [devs-checkpoint, devs-core]

## 1. Initial Test Written
- [ ] Create a unit test in `devs-checkpoint/src/retention.rs` that simulates a repository with multiple runs of varying ages and sizes.
- [ ] Verify that the test identifies which runs should be deleted according to `max_age_days` and `max_size_mb`.
- [ ] Verify that runs in `Running` or `Paused` state are never selected for deletion.
- [ ] Mock the filesystem and git operations to verify that `store.delete_run()` is called for the correct runs.

## 2. Task Implementation
- [ ] Implement `RetentionManager` in `devs-checkpoint` which takes `RetentionPolicy` (age/size limits).
- [ ] Implement the sweep algorithm:
    1. List all runs in the checkpoint store.
    2. Filter out active runs (`Running`, `Paused`).
    3. Sort remaining runs by `created_at` (newest first).
    4. Apply `max_age_days`: Mark runs older than the threshold for deletion.
    5. Apply `max_size_mb`: Iteratively add runs to the deletion set from oldest to newest until the total size of remaining runs is below the limit.
- [ ] Implement the deletion logic:
    - For each marked run, call `store.delete_run(run_id)`.
    - Ensure `delete_run` removes the directory and commits the change to the checkpoint branch.
- [ ] Integrate with `devs-server`:
    - Add a background Tokio task that runs the sweep at startup.
    - Schedule subsequent sweeps every 24 hours.

## 3. Code Review
- [ ] Verify that the sorting order is correct (oldest runs deleted first to satisfy size constraints).
- [ ] Ensure that the size calculation includes all artifacts associated with the run (checkpoints, logs, outputs).
- [ ] Confirm that `Running` and `Paused` runs are strictly excluded from the sweep.
- [ ] Check for proper error handling if a git commit fails during deletion.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-checkpoint`.
- [ ] Ensure all retention sweep tests pass.

## 5. Update Documentation
- [ ] Update `devs-checkpoint` README or module documentation explaining the retention sweep logic.

## 6. Automated Verification
- [ ] Verify traceability: `// Covers: 2_TAS-REQ-111` in `devs-checkpoint/src/retention.rs`.
- [ ] Run `./do test` to confirm 100% traceability for [2_TAS-REQ-111].
