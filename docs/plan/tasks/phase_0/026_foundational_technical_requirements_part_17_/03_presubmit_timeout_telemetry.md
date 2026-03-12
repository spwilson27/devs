# Task: Implement Presubmit Timeout and Telemetry (Sub-Epic: 026_Foundational Technical Requirements (Part 17))

## Covered Requirements
- [2_TAS-REQ-014C], [2_TAS-REQ-014D]

## Dependencies
- depends_on: [02_idempotent_setup_tools.md]
- shared_components: ["./do Entrypoint Script"]

## 1. Initial Test Written
- [ ] Create a test script that runs `./do presubmit` with a mock slow step (e.g., `sleep 16m`) and verifies it terminates after exactly 15 minutes.
- [ ] Create a test that verifies `target/presubmit_timings.jsonl` is created and contains valid JSON lines with step names, start times, end times, and exit codes.
- [ ] Verify that all child processes of the timed-out presubmit are killed (no leaked processes).

## 2. Task Implementation
- [ ] Implement the `presubmit` subcommand in `./do`:
    - Set a hard 15-minute wall-clock timeout for the entire execution.
    - If the timeout is reached, kill the entire process group (PGID) to ensure no child processes remain.
    - For each step (`setup`, `format`, `lint`, `build`, `test`, `coverage`, `ci`):
        - Record the UTC start timestamp.
        - Execute the step.
        - Record the UTC end timestamp and exit code.
        - Write a JSON line to `target/presubmit_timings.jsonl` immediately after each step completes.
- [ ] Ensure `target/` directory exists before writing the telemetry file.

## 3. Code Review
- [ ] Verify that the timeout calculation is cumulative (15 mins from start of `./do presubmit`, not 15 mins per step).
- [ ] Ensure the process group killing logic works on Linux, macOS, and Windows.
- [ ] Verify the JSONL format is correct (one JSON object per line).

## 4. Run Automated Tests to Verify
- [ ] Run `./do presubmit` and ensure it completes correctly when all steps pass quickly.
- [ ] Inspect `target/presubmit_timings.jsonl` and verify its contents.

## 5. Update Documentation
- [ ] Document the new presubmit behavior and telemetry in agent memory.

## 6. Automated Verification
- [ ] Verify that `target/presubmit_timings.jsonl` is present after a presubmit run.
- [ ] Verify that the file contains at least as many lines as completed steps.
