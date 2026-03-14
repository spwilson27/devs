# Task: Implement ./do presubmit with 15-Minute Timeout and ./do ci (Sub-Epic: 003_Developer Entrypoint Script)

## Covered Requirements
- [1_PRD-REQ-045], [1_PRD-BR-001], [2_TAS-REQ-014]

## Dependencies
- depends_on: [01_scaffold_do_script.md, 02_implement_setup_command.md, 03_implement_lint_command.md, 04_implement_coverage_command.md]
- shared_components: [./do Entrypoint Script & CI Pipeline]

## 1. Initial Test Written
- [ ] Create `tests/do_script/test_presubmit.sh` (POSIX sh-compatible) with the following test cases:
  - Test that `./do presubmit` runs setup, format, lint, test, coverage, and ci in that order, and exits 0 on a clean stub workspace
  - Test that `./do presubmit` exits non-zero if any substep fails (e.g., introduce a clippy warning and verify presubmit fails at lint)
  - Test the 15-minute (900s) hard timeout mechanism ([1_PRD-BR-001]):
    - Create a test variant that overrides the timeout to 2 seconds and runs a `sleep 10` substep; verify that presubmit kills the child and exits non-zero
  - Test that `./do presubmit` writes incremental timing data to `target/presubmit_timings.jsonl`:
    - Verify the file exists after a presubmit run
    - Verify each line is valid JSON with at minimum `step` and `elapsed_seconds` fields
  - Test that `./do ci` creates a temporary git commit of the working directory and runs presubmit checks on it, then cleans up
  - Test that `./do ci` exits non-zero if the workspace is not a git repository
- [ ] Add `// Covers: 1_PRD-BR-001` annotation at the top of the test file

## 2. Task Implementation
- [ ] Replace the `presubmit` stub in `./do` with a full implementation:
  1. Record the start time (`date +%s`)
  2. Launch a background watchdog process that sleeps for 900 seconds then kills the parent process group (`kill -TERM -$$`). Store the watchdog PID. This approach survives subshells, unlike the `timeout` command ([1_PRD-BR-001])
  3. Initialize `target/presubmit_timings.jsonl` (truncate if exists)
  4. Run each substep in sequence: `setup`, `format`, `lint`, `test`, `coverage`, `ci`
  5. After each substep completes, append a JSON line to `target/presubmit_timings.jsonl` with: `{"step": "<name>", "elapsed_seconds": <N>, "status": "pass"|"fail"}`
  6. If any substep fails, kill the watchdog, print which step failed, and exit non-zero
  7. On success, kill the watchdog and exit 0
  8. Trap `EXIT` to ensure the watchdog is always killed on script exit
- [ ] Replace the `ci` stub in `./do` with a full implementation:
  1. Verify the working directory is a git repository (`git rev-parse --git-dir`)
  2. Create a temporary branch or use `git stash create` to capture current working state as a temporary commit
  3. Run `./do lint` and `./do test` against the committed state
  4. Clean up: delete the temporary branch/stash ref
  5. Exit with the exit code of the check run
- [ ] Make the timeout duration configurable via `DEVS_PRESUBMIT_TIMEOUT` environment variable (default: 900) to allow testing with shorter timeouts

## 3. Code Review
- [ ] Verify POSIX sh compatibility — no bash-isms in the timeout mechanism
- [ ] Verify the watchdog process uses `kill -TERM` (not `kill -9`) for graceful shutdown
- [ ] Verify `target/presubmit_timings.jsonl` is written incrementally (one line per step, flushed immediately) so partial data survives hard-timeout kills
- [ ] Verify the `ci` command creates and cleans up its temporary commit properly
- [ ] Verify the `EXIT` trap reliably kills the watchdog on all exit paths

## 4. Run Automated Tests to Verify
- [ ] Run `sh tests/do_script/test_presubmit.sh` and verify all tests pass
- [ ] Run `./do presubmit` on the stub workspace and verify exit 0
- [ ] Verify `target/presubmit_timings.jsonl` contains one JSON line per substep

## 5. Update Documentation
- [ ] Add inline comments in the `presubmit` and `ci` sections of `./do` documenting the timeout mechanism and timing output format

## 6. Automated Verification
- [ ] Run `sh tests/do_script/test_presubmit.sh` from repository root; verify exit code 0
- [ ] Run `./do presubmit` and confirm exit 0 and `target/presubmit_timings.jsonl` has >= 6 lines
- [ ] Run `DEVS_PRESUBMIT_TIMEOUT=2 ./do presubmit` with a forced long-running step to verify timeout kills the process
