# Task: Atomic Slug Collision Check (Sub-Epic: 062_Detailed Domain Specifications (Part 27))

## Covered Requirements
- [2_TAS-REQ-273]

## Dependencies
- depends_on: [none]
- shared_components: [devs-core, devs-checkpoint]

## 1. Initial Test Written
- [ ] Create an integration test that attempts to submit two workflow runs with the same slug/name simultaneously for the same project.
- [ ] Use a high-concurrency harness (e.g., `tokio::spawn` multiple submission requests).
- [ ] Assert that EXACTLY one run is successfully created and the other fails with a slug collision error.
- [ ] Verify that there is no race condition where both runs could potentially be created (TOCTOU).

## 2. Task Implementation
- [ ] Identify the point in `devs-core` or `devs-scheduler` where workflow runs are initialized and slugs are validated/generated.
- [ ] Implement a per-project mutex (likely using `tokio::sync::Mutex` or a similar lock based on the Project ID).
- [ ] Ensure the entire critical section—checking for existing slugs and creating the run checkpoint—is guarded by this mutex.
- [ ] If a slug collision is detected within the mutex, return an appropriate error before run creation proceeds.
- [ ] Ensure the run creation logic is atomic (check slug existence -> create checkpoint).

## 3. Code Review
- [ ] Verify the use of a per-project mutex to avoid global bottlenecks while maintaining per-project correctness.
- [ ] Check for potential deadlocks when multiple submissions occur simultaneously.
- [ ] Ensure that even if two requests use different but competing slugs (e.g., auto-generated), the logic remains sound.

## 4. Run Automated Tests to Verify
- [ ] Run the concurrency test and ensure zero failures due to races.
- [ ] Run `cargo test -p devs-core` to verify basic slug validation.

## 5. Update Documentation
- [ ] Document the atomic run creation process and the per-project lock strategy in `devs-core`'s internal documentation.

## 6. Automated Verification
- [ ] Run `./do test` and ensure all tests pass.
- [ ] Verify that `2_TAS-REQ-273` is correctly mapped in the test results.
