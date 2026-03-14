# Task: Slug Uniqueness Constraint for WorkflowRun Submission (Sub-Epic: 081_Detailed Domain Specifications (Part 46))

## Covered Requirements
- [2_TAS-REQ-480]

## Dependencies
- depends_on: []
- shared_components: ["devs-core", "devs-scheduler"]

## 1. Initial Test Written
- [ ] In `devs-core` (or `devs-scheduler` if the uniqueness logic lives there), create a test module `tests::slug_uniqueness`.
- [ ] Write a unit test `test_slug_uniqueness_rejects_duplicate_in_same_project` that:
  1. Creates a per-project mutex-guarded collection of `WorkflowRun` records.
  2. Inserts a run with slug `"my-run"` and status `Running`.
  3. Attempts to insert a second run with the same slug `"my-run"` in the same project.
  4. Asserts the second insertion returns an error (e.g., `DuplicateSlug`).
- [ ] Write a unit test `test_slug_uniqueness_allows_duplicate_if_cancelled` that:
  1. Inserts a run with slug `"my-run"` and status `Cancelled`.
  2. Inserts a second run with slug `"my-run"` in the same project.
  3. Asserts the second insertion succeeds.
- [ ] Write a unit test `test_slug_uniqueness_allows_same_slug_different_projects` that:
  1. Inserts a run with slug `"my-run"` in project A.
  2. Inserts a run with slug `"my-run"` in project B.
  3. Asserts both insertions succeed.
- [ ] Write a concurrency test `test_slug_uniqueness_atomic_under_contention` that spawns multiple async tasks all trying to submit a run with the same slug to the same project simultaneously, asserting exactly one succeeds and the rest fail with `DuplicateSlug`.

## 2. Task Implementation
- [ ] Implement a slug uniqueness check function that, given a project ID and slug, scans existing `WorkflowRun` records for that project. A slug is considered "taken" if any existing run has the same slug AND its status is not `Cancelled`.
- [ ] Guard the check-and-insert operation with a per-project `tokio::sync::Mutex` (or equivalent) so the uniqueness check and insertion happen atomically — no TOCTOU race.
- [ ] Return a typed error `SubmitError::DuplicateSlug { slug: String, existing_run_id: RunId }` on conflict.
- [ ] Integrate this check into the `submit_run` path so it executes before any other submission side effects (snapshot, checkpoint write, etc.).

## 3. Code Review
- [ ] Verify the uniqueness check is performed under a mutex, not just a read lock.
- [ ] Verify `Cancelled` status is the only exemption — not `Failed`, not `Completed`.
- [ ] Verify the error type includes enough context for the caller to understand the conflict.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test slug_uniqueness` and confirm all tests pass.

## 5. Update Documentation
- [ ] Add doc comments on the uniqueness check function explaining the invariant and the `Cancelled` exemption.

## 6. Automated Verification
- [ ] Run `cargo test slug_uniqueness -- --nocapture` and verify zero failures in output.
