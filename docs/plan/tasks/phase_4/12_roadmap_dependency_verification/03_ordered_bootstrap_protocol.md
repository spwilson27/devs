# Task: Implement Ordered Bootstrap Verification Protocol (Sub-Epic: 12_Roadmap Dependency Verification)

## Covered Requirements
- [ROAD-P4-DEP-002] (full validation), [ROAD-P4-DEP-003]

## Dependencies
- depends_on: [01_define_additional_workflows.md, 02_verify_phase_3_readiness.md]
- shared_components: [devs-server, devs-cli, devs-config]

## 1. Initial Test Written
- [ ] Create an integration test `tests/bootstrap_verification_protocol.rs` that explicitly enforces the roadmap sequence:
    1. **COND-001 Verification**: Verifies `devs-server` port binding and discovery file writing. Asserts that subsequent CONDs fail if COND-001 is skipped or fails.
    2. **COND-002 Verification**: Uses `devs-cli submit presubmit-check` (against the server from COND-001) and asserts it returns a valid `run_id`.
    3. **COND-003 Verification**: Asserts the `presubmit-check` run eventually reaches a `Completed` state with all its stages successful.
- [ ] Implement a test case `test_all_standard_workflows_accepted` that iterates through all 6 TOML files (`tdd-red`, `tdd-green`, `presubmit-check`, `build-only`, `unit-test-crate`, `e2e-all`) and attempts to `submit` them (via `devs-cli --dry-run` or a gRPC-level validation call).

## 2. Task Implementation
- [ ] Create a specialized test harness or subcommand in `./do` (e.g., `./do verify-bootstrap`) that executes the COND-001/002/003 logic sequentially.
- [ ] Implement the `COND-001` verification:
    - Probe ports `:7890` and `:7891` (or test overrides).
    - Read `~/.config/devs/server.addr` and verify its content matches the bound port.
- [ ] Implement the `COND-002` verification:
    - Execute `devs submit presubmit-check --format json`.
    - Parse the output and extract the `run_id`.
- [ ] Implement the `COND-003` verification:
    - Periodically poll the status of `run_id` via `devs status <run_id> --format json`.
    - Assert the run reaches a terminal state within the 900s budget.
    - Confirm all stages listed in the status report are `Completed`.

## 3. Code Review
- [ ] Verify that the verification protocol is idempotent and does not leave orphaned files (e.g., old discovery files).
- [ ] Ensure that the `presubmit-check` run for COND-003 is performed on a clean temporary repository if required by the workflow's execution target.
- [ ] Confirm that all 6 workflows are accepted by the server's validation logic before the COND-002 attempt.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test --test bootstrap_verification_protocol` to verify the ordering logic.
- [ ] Run `./do verify-bootstrap` (if implemented as a subcommand) and confirm it correctly reports the status of all three conditions.

## 5. Update Documentation
- [ ] Update the Phase 4 ADR template or the `ROADMAP.md` (if applicable) with the results of the verification.

## 6. Automated Verification
- [ ] Confirm that `devs status <run_id> --format json` output correctly includes all stages from the `presubmit-check.toml` definition.
- [ ] Verify that the `COND-003` logic handles potential network flakiness by implementing a robust retry/reconnect strategy.
