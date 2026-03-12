# Task: Verify Presubmit-Check Workflow Lifecycle (Sub-Epic: 13_Roadmap Phase 4 Infrastructure)

## Covered Requirements
- [AC-ROAD-P4-003]

## Dependencies
- depends_on: [02_configure_server_infrastructure.md]
- shared_components: [devs-scheduler, devs-cli, devs-grpc, ./do Entrypoint Script]

## 1. Initial Test Written
- [ ] Create an E2E test that starts the `devs-server` and submits the `presubmit-check` workflow.
- [ ] The test should poll the status of the run using `devs status <run_id> --format json` until a terminal state is reached.
- [ ] The test must assert that the final `"status"` is `"completed"` and that all stages in the run are also `"completed"`.
- [ ] Ensure the test fails if the run enters a `"failed"`, `"cancelled"`, or `"timed_out"` state.

## 2. Task Implementation
- [ ] Ensure that the `presubmit-check` workflow's stages are correctly executed by the `devs-scheduler`.
- [ ] Configure a `standard` pool with a "local" or "mock" agent that can simulate successful execution of build and test commands if actual agents are not yet configured for bootstrap.
- [ ] Implement the polling logic in the verification script or test to track the workflow's progression.
- [ ] Confirm that `devs status <run_id> --format json` output includes a list of stages with their individual statuses.

## 3. Code Review
- [ ] Verify that the `presubmit-check` run reaches completion on all 3 platforms (Linux, macOS, Windows) by reviewing the CI pipeline results.
- [ ] Ensure the polling interval is reasonable and doesn't overload the server.
- [ ] Validate that stage-level completion signals (`exit_code`) are correctly reported in the run status.

## 4. Run Automated Tests to Verify
- [ ] Run the E2E lifecycle test created in step 1 on a local machine and verify success.

## 5. Update Documentation
- [ ] Update `devs-cli` documentation with examples of `devs status <run_id> --format json`.

## 6. Automated Verification
- [ ] Execute the `presubmit-check` run in CI and ensure the pipeline log shows: `Run <run_id> completed successfully`.
- [ ] Verify using `devs status <run_id> --format json | jq -e '.status == "completed" and (.stages | all(.status == "completed"))'` on the CI runner.
