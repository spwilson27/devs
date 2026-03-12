# Task: Implement Presubmit Timing Enforcement (Sub-Epic: 04_MVP Roadmap)

## Covered Requirements
- [AC-ROAD-P5-006]

## Dependencies
- depends_on: [none]
- shared_components: [./do Entrypoint Script]

## 1. Initial Test Written
- [ ] Update `cmd_presubmit` in `./do` to temporarily set a test timeout of 1 second per step.
- [ ] Run `./do presubmit` and verify that it fails when any step (e.g., `build`) exceeds 1 second.

## 2. Task Implementation
- [ ] Update the `cmd_presubmit` function in `./do`:
    - Record the start and end time of each sub-task (`setup`, `build`, `test`, `lint`, `coverage`).
    - After all tasks complete, calculate the wall-clock duration of each step.
    - Write these timings to `target/presubmit_timings.jsonl` (one JSON object per line, containing `task`, `platform`, `duration_seconds`).
    - Add a final validation step: if any task's duration exceeds 900.0 seconds (15 minutes), print a failure message and exit with a non-zero code.
- [ ] Ensure that `target/presubmit_timings.jsonl` is appended, not overwritten, if multiple platforms run presubmit on the same shared filesystem (e.g., via NFS/SMB in some CI environments), or ensure separate files per platform that are then consolidated.

## 3. Code Review
- [ ] Verify that the timing uses monotonic clock where available to avoid issues with system time adjustments.
- [ ] Ensure the JSONL format is consistent and parseable by the `devs` monitoring tools.

## 4. Run Automated Tests to Verify
- [ ] Run `./do presubmit` on a clean environment and check that `target/presubmit_timings.jsonl` is correctly populated.

## 5. Update Documentation
- [ ] Document the 15-minute presubmit performance requirement in the `DEVELOPMENT.md` or similar contributor guide.

## 6. Automated Verification
- [ ] Run `./do presubmit` and verify that the final output includes a performance report that confirms all steps completed under the 15-minute limit.
