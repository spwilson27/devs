# Task: Configure Server Infrastructure for Workflow Submission (Sub-Epic: 13_Roadmap Phase 4 Infrastructure)

## Covered Requirements
- [AC-ROAD-P4-001], [AC-ROAD-P4-002]

## Dependencies
- depends_on: [01_define_standard_workflows.md]
- shared_components: [devs-config, devs-pool, devs-grpc, devs-cli]

## 1. Initial Test Written
- [ ] Create an E2E test that starts a `devs-server` with a default `devs.toml` configuration containing a `standard` pool.
- [ ] For each of the six standard workflows, the test should execute `devs submit <workflow> --format json` and verify the exit code is 0 and the stdout is valid JSON.
- [ ] Specifically for `presubmit-check`, the test must assert that the output JSON contains a non-empty `run_id` (UUID format) and `"status": "pending"`.

## 2. Task Implementation
- [ ] Create a `devs.toml` template for bootstrap verification that defines a `standard` pool.
- [ ] Ensure the server is configured to look for workflows in `.devs/workflows/`.
- [ ] Ensure `devs-cli` correctly implements the `--format json` flag for the `submit` command.
- [ ] Verify that the server's validation logic accepts all six standard workflows when submitted via the CLI.
- [ ] Ensure the `submit` command returns the `run_id` and initial status.

## 3. Code Review
- [ ] Verify that the server correctly maps the `standard` pool to the appropriate executors (e.g., `tempdir`).
- [ ] Ensure that CLI JSON output matches the gRPC `RunStatus` proto definition.
- [ ] Validate that the UUID is correctly generated and returned.

## 4. Run Automated Tests to Verify
- [ ] Run the E2E tests created in step 1.

## 5. Update Documentation
- [ ] Update `devs-cli` documentation with examples of `--format json` for the `submit` command.

## 6. Automated Verification
- [ ] Run a CLI script that executes `devs submit presubmit-check --format json | jq -e '.run_id != null and .status == "pending"'` and verify it exits 0.
