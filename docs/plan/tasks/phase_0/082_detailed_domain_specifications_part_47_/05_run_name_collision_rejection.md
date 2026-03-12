# Task: Run Name Collision Atomic Rejection (Sub-Epic: 082_Detailed Domain Specifications (Part 47))

## Covered Requirements
- [2_TAS-REQ-489]

## Dependencies
- depends_on: [none]
- shared_components: [devs-core]

## 1. Initial Test Written
- [ ] Create an integration test in `devs-core` (or the server module if submission logic resides there) for run submission.
- [ ] Submit a `WorkflowRun` with a specific name "MyRun".
- [ ] Submit a second `WorkflowRun` for the same project with the same name "MyRun".
- [ ] Verify that the second submission fails with an error string containing `"duplicate_run_name"`.
- [ ] Verify that the error also contains the `existing_run_id`.
- [ ] Ensure that the first run is unaffected and still "active" (e.g. `PENDING` or `RUNNING`).
- [ ] Test that if the first run is "completed" or "cancelled", a new submission with the same name (slug) might be allowed depending on the deduplication policy (check [2_TAS-REQ-489] for exact policy).

## 2. Task Implementation
- [ ] In the run submission logic (likely in `devs-core`'s state machine or the server's `RunService`), implement a slug generator for user-provided run names.
- [ ] Before creating a new run, check the authoritative in-memory map of active runs for the project.
- [ ] If an active run (not cancelled or completed) with the same slug exists, return the required error structure.
- [ ] Ensure the check and the run creation are atomic (e.g. by holding the project-level write lock).
- [ ] Format the error correctly: `"duplicate_run_name"` as a key/code and provide the `existing_run_id`.

## 3. Code Review
- [ ] Verify that the slug generation is consistent and matches the format used for auto-generated slugs.
- [ ] Ensure that the check handles case sensitivity and whitespace as defined in the slugging rules.
- [ ] Check for potential performance issues when there are many active runs (though unlikely for a single project).

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test` and ensure the run collision tests pass.

## 5. Update Documentation
- [ ] Document the run name collision behavior and the expected error format for client developers.

## 6. Automated Verification
- [ ] Run `./do verify_requirements.py` to ensure `[2_TAS-REQ-489]` is correctly mapped to the test.
