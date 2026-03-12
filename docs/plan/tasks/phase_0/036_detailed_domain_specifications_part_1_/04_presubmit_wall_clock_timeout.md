# Task: Presubmit Wall-Clock Timeout (Sub-Epic: 036_Detailed Domain Specifications (Part 1))

## Covered Requirements
- [1_PRD-KPI-BR-005], [1_PRD-KPI-BR-006]

## Dependencies
- depends_on: [none]
- shared_components: ["./do Entrypoint Script"]

## 1. Initial Test Written
- [ ] Create a simulation in the `./do` script test suite where `./do presubmit` is run with a mock command that takes longer than 900 seconds (or a shorter mocked timeout for the test).
- [ ] Verify that the script kills all child processes and exits with code 1.
- [ ] The test should assert that the output contains a timeout message and the timing record is updated with `timed_out: true` and `completed_at: null`.
- [ ] Verify that wall-clock time is used, not CPU time, for this measurement.

## 2. Task Implementation
- [ ] Modify the `./do` script's `presubmit` subcommand.
- [ ] Capture the start time (wall-clock) at the beginning of the `presubmit` run.
- [ ] Implement a watchdog or a timeout mechanism for the entire subcommand run.
- [ ] If the total elapsed time reaches 900 seconds (15 minutes), send a signal to kill all child processes atomically (e.g., using a process group kill).
- [ ] Write the timing record to `target/presubmit_timings.jsonl` (or similar) with the required fields: `timed_out: true`, `completed_at: null`.
- [ ] Exit the script with code 1.

## 3. Code Review
- [ ] Ensure that the timeout applies to the entire `./do presubmit` run, including all its sub-steps (setup, build, test, lint, coverage).
- [ ] Verify that the implementation uses wall-clock time [1_PRD-KPI-BR-006].
- [ ] Check that child processes are killed correctly on all supported platforms (Linux, macOS, Windows).

## 4. Run Automated Tests to Verify
- [ ] Run the simulation test created in step 1 and ensure it passes.
- [ ] Run a standard `./do presubmit` on a small task to ensure it completes successfully within the timeout.

## 5. Update Documentation
- [ ] Update `.agent/MEMORY.md` to reflect the implementation of the 15-minute wall-clock timeout for presubmit.

## 6. Automated Verification
- [ ] Run a command that sleeps for 16 minutes via `./do presubmit` (e.g., by mocking a test step) and verify that it is terminated at the 15-minute mark with exit code 1.
