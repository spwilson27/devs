# Task: Submission Race Protection for Duplicate Run Names (Sub-Epic: 082_Detailed Domain Specifications (Part 47))

## Covered Requirements
- [2_TAS-REQ-489]

## Dependencies
- depends_on: []
- shared_components: [devs-core (consumer), devs-scheduler (consumer)]

## 1. Initial Test Written
- [ ] In `crates/devs-scheduler/tests/submission_race.rs`, create the following tests:
- [ ] `test_duplicate_slug_rejected_with_correct_error`: Submit a run with name "my-feature" to project A. Submit another run with the same name "my-feature" to project A while the first is still active. Assert the second submission is rejected with an error containing: `error: "duplicate_run_name"`, `slug: "<colliding_slug>"`, and `existing_run_id: "<uuid>"`.
- [ ] `test_same_slug_different_projects_allowed`: Submit "my-feature" to project A and "my-feature" to project B. Assert both succeed — slug uniqueness is per-project.
- [ ] `test_slug_reuse_after_cancellation`: Submit "my-feature", then cancel it. Submit "my-feature" again. Assert the second submission succeeds because the first run is no longer active (cancelled).
- [ ] `test_concurrent_submissions_same_slug_one_wins`: Spawn two `tokio::spawn` tasks that simultaneously submit runs with the same name to the same project. Assert exactly one succeeds and one fails with `duplicate_run_name`.
- [ ] `test_duplicate_slug_completed_run_allows_resubmit`: Submit "my-feature", let it complete. Submit "my-feature" again. Assert success — completed runs don't block new submissions.

## 2. Task Implementation
- [ ] In `devs-scheduler`'s `submit_run` function, within the write lock on the runs map:
  1. Generate the slug from the user-supplied name (or auto-generate if none).
  2. Check all runs for the same project where `status` is active (not `Cancelled`, not `Completed`, not `Failed`).
  3. If any active run has a matching slug, reject atomically by returning an error struct: `{ error: "duplicate_run_name", slug, existing_run_id }`.
  4. The check and insert MUST be atomic (both under the same write lock acquisition) to prevent TOCTOU races.
- [ ] Define a `DuplicateRunName` error variant in the scheduler's error type containing `slug: String` and `existing_run_id: Uuid`.

## 3. Code Review
- [ ] Verify the duplicate check and the run insertion happen within the same write lock scope — no gap where a concurrent submission could slip through.
- [ ] Verify only active (non-terminal) runs are considered for collision.
- [ ] Verify the error response includes both the colliding slug and the existing run's UUID.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-scheduler submission_race` and confirm all tests pass.

## 5. Update Documentation
- [ ] Add `// Covers: 2_TAS-REQ-489` annotation to each test function.

## 6. Automated Verification
- [ ] Run `cargo test -p devs-scheduler submission_race -- --nocapture 2>&1 | grep -E "test result:.*passed"` and verify 0 failures.
