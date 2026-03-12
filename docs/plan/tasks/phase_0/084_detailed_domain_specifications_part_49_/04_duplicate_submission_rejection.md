# Task: Duplicate Submission Rejection Acceptance (Sub-Epic: 084_Detailed Domain Specifications (Part 49))

## Covered Requirements
- [2_TAS-REQ-498]

## Dependencies
- depends_on: [none]
- shared_components: [devs-core, devs-server]

## 1. Initial Test Written
- [ ] Create a unit test in `devs-core` (or the component handling run submission) that simulates an active run named "deploy-prod" in project "webapp".
- [ ] Attempt to submit another run with the same name "deploy-prod" for the same project "webapp".
- [ ] Assert that the submission fails with an error containing `"duplicate_run_name"` and the ID of the existing run.
- [ ] Verify that the new run is NOT created in the internal project state.
- [ ] Verify that submitting a run with the same name for a **different** project succeeds.
- [ ] Verify that submitting a run with a **different** name for the same project succeeds.

## 2. Task Implementation
- [ ] Implement name collision detection in the `submit_run` logic of `devs-core`.
- [ ] Maintain an in-memory index of active run names per project.
- [ ] Return the detailed error including the existing run ID as specified in the requirement.
- [ ] Ensure that name collision detection only considers **active** runs (Completed, Failed, and Cancelled runs can have their names reused unless state persistence prevents it, but the requirement specifically says "active run").

## 3. Code Review
- [ ] Verify that the name comparison is case-sensitive and correctly scoped to the project.
- [ ] Check for potential race conditions if multiple submission requests for the same name arrive simultaneously (use appropriate locking or atomic registration).
- [ ] Ensure the error message format is consistent with other API errors.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-core`.
- [ ] Run an E2E test using `devs submit` with a duplicate name to confirm the CLI error output.

## 5. Update Documentation
- [ ] Update the API documentation to explicitly mention the duplicate run name rejection rule.
- [ ] Update `MEMORY.md` with details on run name uniqueness constraints.

## 6. Automated Verification
- [ ] Run `./do verify_requirements` to ensure `2_TAS-REQ-498` is fulfilled.
