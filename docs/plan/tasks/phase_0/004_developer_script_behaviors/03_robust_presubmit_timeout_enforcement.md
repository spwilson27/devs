# Task: Implement robust `presubmit` timeout enforcement (Sub-Epic: 004_Developer Script Behaviors)

## Covered Requirements
- [2_TAS-REQ-085]

## Dependencies
- depends_on: [01_implement_subcommand_contract_details.md]
- shared_components: ["./do Entrypoint Script"]

## 1. Initial Test Written
- [ ] Create a shell script test `tests/test_presubmit_timeout.sh` that:
    - Verifies that `./do presubmit` can terminate if a sub-step is intentionally delayed beyond a shorter test timeout (e.g., set `TIMEOUT_SECS=2` for the test).
    - Asserts that all child processes are killed.
    - Asserts that the exit code is non-zero.
    - Asserts that the stderr contains `"presubmit timeout: exceeded 15 minutes"`.

## 2. Task Implementation
- [ ] Refine the `./do presubmit` subcommand implementation to:
    - Start a background timer at the moment of invocation.
    - Use a shell `timeout` command or a background watchdog process to monitor the total wall-clock time.
    - Hard-code the timeout to 900 seconds (15 minutes).
    - If the timeout is reached:
        - Send `SIGTERM` (and then `SIGKILL` if necessary) to the entire process group.
        - Print the exact message `"presubmit timeout: exceeded 15 minutes"` to stderr.
        - Exit with a non-zero code.

## 3. Code Review
- [ ] Verify that the timeout is "wall-clock" time, meaning it includes all `setup`, `format`, `lint`, etc. steps.
- [ ] Ensure that the implementation correctly kills child processes (e.g., `cargo test`) and does not leave orphans.
- [ ] Verify that the timeout message matches [2_TAS-REQ-085] exactly.

## 4. Run Automated Tests to Verify
- [ ] Run `bash tests/test_presubmit_timeout.sh` with a shortened timeout to confirm enforcement.
- [ ] Run a full `./do presubmit` on a clean state and verify it completes within the 15-minute window if everything passes normally.

## 5. Update Documentation
- [ ] Update `MEMORY.md` to note that the robust timeout enforcement for `presubmit` is active.

## 6. Automated Verification
- [ ] Simulate a long-running step (e.g., `sleep 1000` inside a subcommand) and confirm `./do presubmit` kills it and exits with the required error message.
