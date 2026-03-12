# Task: Bootstrap Self-Hosting Verification and Documentation (Sub-Epic: 29_MIT-009)

## Covered Requirements
- [MIT-009], [AC-RISK-009-01], [AC-RISK-009-03]

## Dependencies
- depends_on: [01_verify_workflow_definitions.md, 02_enforce_no_bootstrap_stubs.md]
- shared_components: [devs-server, devs-cli, devs-grpc, devs-scheduler, ./do Entrypoint Script]

## 1. Initial Test Written
- [ ] Create a "smoke test" script `tests/e2e/bootstrap_milestone_test.sh` that:
    - Starts the `devs-server` in the background.
    - Runs `./do presubmit` manually once to ensure the environment is clean and passes.
    - Executes `devs submit presubmit-check --name bootstrap-final` via the `devs-cli`.
    - Polls `devs status bootstrap-final --format json` until it reaches a terminal state.
    - Asserts that the run status is `Completed` and all individual stages in the run are also `Completed`.
    - Kills the background server.

## 2. Task Implementation
- [ ] Perform the "Self-Hosting Attempt":
    - Ensure all code is committed and `./do presubmit` passes on Linux.
    - Start the `devs-server` as a real background process.
    - Run the `presubmit-check` workflow using `devs submit` (the `devs-cli` client connecting to the `devs-server`).
    - Monitor the run via `devs logs` or `devs status`.
    - Confirm it finishes successfully.
- [ ] Document the milestone:
    - Create `docs/adr/0010-bootstrap-complete.md` (sequentially named according to the ADR folder).
    - Include:
        - Exact commit SHA that passed the self-hosting attempt.
        - CI pipeline URL (simulated if necessary, or actual from the CI environment).
        - Verification that `MIT-009`, `AC-RISK-009-01`, `AC-RISK-009-02`, `AC-RISK-009-03`, and `AC-RISK-009-04` are all satisfied.
        - Evidence of the `presubmit-check` run (e.g., output of `devs status --format json`).

## 3. Code Review
- [ ] Verify that the self-hosting run actually exercised the full system (gRPC, scheduler, agent pools, git persistence).
- [ ] Confirm that the ADR contains all required information as per `RISK-009-BR-006`.
- [ ] Ensure that no code changes are made after the passing run until the ADR is committed.

## 4. Run Automated Tests to Verify
- [ ] Run `bash tests/e2e/bootstrap_milestone_test.sh` and ensure it passes.

## 5. Update Documentation
- [ ] Mark the Bootstrap Phase as complete in any project roadmaps or state trackers.
- [ ] Update the agent's memory to reflect the new "Mitigated" status of `RISK-009`.

## 6. Automated Verification
- [ ] Run `./do test` and check `target/traceability.json` to ensure `MIT-009`, `AC-RISK-009-01`, and `AC-RISK-009-03` are marked as covered and passed.
