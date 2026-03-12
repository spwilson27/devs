# Task: Slug Uniqueness Constraint Implementation (Sub-Epic: 081_Detailed Domain Specifications (Part 46))

## Covered Requirements
- [2_TAS-REQ-480]

## Dependencies
- depends_on: [none]
- shared_components: [devs-core]

## 1. Initial Test Written
- [ ] In `devs-core`, create a test suite `slug_uniqueness_tests.rs`.
- [ ] Write a test that attempts to create two runs with the same slug for the same project.
- [ ] Assert that the first creation succeeds and the second fails with a specific error (e.g., `DuplicateSlug`).
- [ ] Write a test that creates a run, cancels it (setting status to `Cancelled`), and then creates a new run with the same slug.
- [ ] Assert that the second creation succeeds when the first run is `Cancelled`.
- [ ] Write a concurrent test using multiple threads to ensure that only one run with a given slug can be created under heavy load (verifying the mutex requirement).

## 2. Task Implementation
- [ ] In `devs-core/src/models/run.rs` (or equivalent), ensure `WorkflowRun` has a `slug` field and a `status` field.
- [ ] Implement a `RunStore` or `ProjectState` that manages these records.
- [ ] Add a `std::sync::Mutex` or `tokio::sync::Mutex` to the `ProjectState` to guard the run registration process.
- [ ] Implement the `register_run` method:
    - Lock the mutex.
    - Search existing runs for the same slug.
    - If a match is found AND its status is NOT `Cancelled`, return `Err(DuplicateSlug)`.
    - Otherwise, add the new run to the store.
- [ ] Ensure the uniqueness check is performed atomically within the lock.

## 3. Code Review
- [ ] Verify that the mutex is per-project and not global, to avoid unnecessary bottlenecks.
- [ ] Ensure that `Cancelled` status is correctly checked.
- [ ] Check that no I/O (like writing to disk) is performed while holding the mutex if possible, or keep it as brief as possible.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-core --test slug_uniqueness_tests`.
- [ ] Verify all tests pass, including the concurrent race condition test.

## 5. Update Documentation
- [ ] Update `devs-core` documentation comments to explain the slug uniqueness rules and the cancellation exception.

## 6. Automated Verification
- [ ] Run `./do test` and check the traceability report to ensure `2_TAS-REQ-480` is mapped to the passing tests.
