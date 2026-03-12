# Task: Enforce Run Name and Slug Uniqueness with Mutex (Sub-Epic: 013_Foundational Technical Requirements (Part 4))

## Covered Requirements
- [2_TAS-BR-025], [2_TAS-REQ-480], [2_TAS-REQ-273]

## Dependencies
- depends_on: [none]
- shared_components: [devs-core]

## 1. Initial Test Written
- [ ] In `devs-core`, write a unit test in `src/run.rs` (or equivalent) that simulates a run submission.
- [ ] Create a test with two concurrent threads attempting to submit a run with the same name for the same project.
- [ ] Verify that exactly one thread succeeds and the other returns an `ALREADY_EXISTS` or `DuplicateRunName` error.
- [ ] Test the cancellation exception: if a run with the same slug exists but is in `Cancelled` status, a new run with the same slug should be permitted (per `2_TAS-REQ-480`).

## 2. Task Implementation
- [ ] In `devs-core`, define a `ProjectState` struct (or similar) that holds active runs.
- [ ] Use a `std::sync::Mutex` or `tokio::sync::Mutex` within `ProjectState` to guard run creation.
- [ ] Implement the atomic uniqueness check:
  - Check for existing non-cancelled runs with the same slug.
  - If collision exists, return error.
  - Otherwise, insert the new run record into the state while still holding the mutex.
- [ ] Ensure the slug generation logic (from Task `2_TAS-REQ-030`) is correctly called under the mutex.

## 3. Code Review
- [ ] Confirm that the mutex correctly prevents TOCTOU (Time-of-Check, Time-of-Use) races.
- [ ] Verify that cancelled runs do NOT block new submissions with the same slug.
- [ ] Ensure the mutex scope is minimal and doesn't wrap long I/O operations.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-core` to ensure the concurrency safety of run creation.
- [ ] Run `./do test` to verify traceability annotations.

## 5. Update Documentation
- [ ] Update `GEMINI.md` with notes on run slug uniqueness rules.

## 6. Automated Verification
- [ ] Run the thread-collision test at least 100 times to ensure no intermittent race conditions are present.
