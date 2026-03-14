# Task: Duplicate Run Name Rejection on Submit (Sub-Epic: 084_Detailed Domain Specifications (Part 49))

## Covered Requirements
- [2_TAS-REQ-498]

## Dependencies
- depends_on: [none]
- shared_components: [devs-core (consume — RunId, WorkflowRun types), devs-scheduler (consume — submit_run logic)]

## 1. Initial Test Written
- [ ] In `crates/devs-scheduler/src/tests.rs` (or equivalent), write `test_duplicate_run_name_returns_error`:
  1. Set up a project "webapp" with an active `WorkflowRun` named "deploy-prod" (status `Running`), with a known `RunId` (e.g., UUID `aaaaaaaa-...`).
  2. Call `submit_run(project="webapp", workflow="deploy", name=Some("deploy-prod"), inputs={})`.
  3. Assert the result is `Err` and the error message contains the string `"duplicate_run_name"`.
  4. Assert the error contains the `existing_run_id` matching the active run's ID.
- [ ] Write `test_duplicate_name_does_not_create_run`:
  1. Same setup as above.
  2. After the failed submission, call `list_runs(project="webapp")`.
  3. Assert only 1 run exists (the original), not 2.
- [ ] Write `test_same_name_different_project_succeeds`:
  1. Project "webapp" has active run "deploy-prod".
  2. Submit run "deploy-prod" to project "backend".
  3. Assert success — no collision across projects.
- [ ] Write `test_same_name_after_completion_succeeds`:
  1. Project "webapp" has a `Completed` run named "deploy-prod".
  2. Submit a new run named "deploy-prod" to the same project.
  3. Assert success — collision check only applies to active (non-terminal) runs.
- [ ] Write `test_different_name_same_project_succeeds`:
  1. Project "webapp" has active run "deploy-prod".
  2. Submit run "deploy-staging" to "webapp".
  3. Assert success.

## 2. Task Implementation
- [ ] In the `submit_run` method (likely in `devs-scheduler`), before creating the new `WorkflowRun`:
  1. Query active runs for the target project (status in `{Pending, Running, Paused}`).
  2. Check if any active run has a matching `name` field.
  3. If match found: return `Err(SubmitError::DuplicateRunName { run_name, existing_run_id })`.
  4. The error's `Display` impl must include the literal string `"duplicate_run_name"` and the existing run ID.
- [ ] Define the `SubmitError::DuplicateRunName` variant with fields `run_name: String` and `existing_run_id: RunId`.
- [ ] Ensure the check is performed under the appropriate lock to prevent TOCTOU races (hold the run state lock while checking and inserting).
- [ ] Add `// Covers: 2_TAS-REQ-498` annotation to each test.

## 3. Code Review
- [ ] Verify the name comparison is exact (case-sensitive, no trimming).
- [ ] Confirm the duplicate check is scoped to the same project only.
- [ ] Verify the check only considers active runs — terminal states (`Completed`, `Failed`, `Cancelled`) do not block reuse.
- [ ] Confirm TOCTOU safety: the lock is held from the duplicate check through run creation.
- [ ] Verify the error message format includes both `"duplicate_run_name"` and the existing run ID.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-scheduler -- duplicate` and verify all tests pass.

## 5. Update Documentation
- [ ] Add doc comment on `submit_run` documenting the duplicate name rejection behavior.

## 6. Automated Verification
- [ ] Run `./do test` and confirm zero failures.
- [ ] Grep test files for `// Covers: 2_TAS-REQ-498` to verify traceability annotation is present.
