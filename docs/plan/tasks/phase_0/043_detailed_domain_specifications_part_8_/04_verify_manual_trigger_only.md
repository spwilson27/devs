# Task: Verify Manual-Only Trigger Restriction (Sub-Epic: 043_Detailed Domain Specifications (Part 8))

## Covered Requirements
- [1_PRD-REQ-073]

## Dependencies
- depends_on: [none]
- shared_components: [devs-core]

## 1. Initial Test Written
- [ ] In `devs-core/src/scheduler/mod.rs` (or a relevant scheduler/server module), write a unit test that provides a mock workflow and asserts that NO runs are initiated until an explicit "submit" command or gRPC call is received.
- [ ] Add a test that checks for the absence of background cron/timer loops in the scheduler's initialization logic.

## 2. Task Implementation
- [ ] Implement a `WorkflowScheduler` foundation in the `devs-core` crate.
- [ ] Explicitly avoid implementing any background timer or autonomous event loop that could trigger a run.
- [ ] Ensure that the scheduler is strictly reactive and only processes runs that are manually submitted via its public API.
- [ ] If any background tasks are needed for OTHER purposes (e.g., monitoring a running run), ensure they are strictly bounded and cannot initiate NEW runs.
- [ ] Add an architectural comment in the code (annotated with [1_PRD-REQ-073]) to warn against adding autonomous triggers in MVP.

## 3. Code Review
- [ ] Verify that no `tokio::spawn` or similar background task exists that could trigger a run on its own.
- [ ] Ensure the scheduler design remains focused on a reactive model.

## 4. Run Automated Tests to Verify
- [ ] Run the `devs-core` tests: `cargo test -p devs-core`.
- [ ] Run the specific test case that asserts no autonomous triggers exist.

## 5. Update Documentation
- [ ] Update the `Workflow Triggers` section in the project documentation (e.g., `1_prd.md` or a developer guide) to reaffirm that all runs must be manually submitted in MVP.

## 6. Automated Verification
- [ ] Run `.tools/verify_requirements.py` and ensure [1_PRD-REQ-073] is marked as verified.
