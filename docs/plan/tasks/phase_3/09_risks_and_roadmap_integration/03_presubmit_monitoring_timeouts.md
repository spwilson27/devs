# Task: Presubmit Performance Monitoring and Hard Timeouts (Sub-Epic: 09_Risks and Roadmap Integration)

## Covered Requirements
- [9_PROJECT_ROADMAP-REQ-006], [9_PROJECT_ROADMAP-REQ-042], [9_PROJECT_ROADMAP-REQ-043], [9_PROJECT_ROADMAP-REQ-044], [9_PROJECT_ROADMAP-REQ-089], [9_PROJECT_ROADMAP-REQ-125], [9_PROJECT_ROADMAP-REQ-134], [9_PROJECT_ROADMAP-REQ-146], [9_PROJECT_ROADMAP-REQ-153], [9_PROJECT_ROADMAP-REQ-154], [9_PROJECT_ROADMAP-REQ-159], [9_PROJECT_ROADMAP-REQ-163], [9_PROJECT_ROADMAP-REQ-327]
- [8_RISKS-REQ-101] through [8_RISKS-REQ-150]

## Dependencies
- depends_on: [none]
- shared_components: [./do Entrypoint Script]

## 1. Initial Test Written
- [ ] Create a Python test `pytest .tools/tests/test_presubmit_monitor.py` that verifies a mock `presubmit_timings.jsonl` file.
- [ ] Test cases must verify that the 900s (15-minute) timeout correctly triggers a background process termination.
- [ ] Test cases must verify that if a subcommand (e.g., `./do test`) takes > 50% of the total budget, a warning is issued.
- [ ] Test cases must verify that `presubmit_timings.jsonl` is updated on every run of `./do presubmit`.

## 2. Task Implementation
- [ ] Implement a timing wrapper in `.tools/workflow.py` (or the script underlying `./do`) to record subcommand durations.
- [ ] Create a background timer process in `./do presubmit` that sleeps for 900 seconds and sends a SIGTERM to the parent process if it still exists.
- [ ] Add the `presubmit_timings.jsonl` writer to record `timestamp`, `subcommand`, and `duration_ms`.
- [ ] Implement the budget warning logic: if a subcommand takes more than 450s, log a "Budget Warning: Subcommand [X] is consuming > 50% of the 15-minute budget."
- [ ] Add the `presubmit_overrun_rejection` logic: if the total duration of the last 3 runs exceeded 900s on average, block the next `./do presubmit` until optimization is performed.

## 3. Code Review
- [ ] Verify that the background timer is robust and handles clean shutdown if the presubmit completes early.
- [ ] Ensure `presubmit_timings.jsonl` is appended atomically and doesn't corrupt on parallel runs.
- [ ] Check that the budget warnings are prominent and clear in the logs.

## 4. Run Automated Tests to Verify
- [ ] Run `pytest .tools/tests/test_presubmit_monitor.py`.
- [ ] Run `./do presubmit` once and verify `presubmit_timings.jsonl` is created with the correct data.

## 5. Update Documentation
- [ ] Document the 15-minute budget and how to optimize subcommands in `docs/plan/specs/9_project_roadmap.md`.
- [ ] Update `MEMORY.md` to reflect the new presubmit performance monitoring features.

## 6. Automated Verification
- [ ] Artificially reduce the budget to 5 seconds and verify `./do presubmit` is terminated by the background timer.
- [ ] Verify that the budget warning appears if a command is artificially slowed down (e.g., with `sleep`).
