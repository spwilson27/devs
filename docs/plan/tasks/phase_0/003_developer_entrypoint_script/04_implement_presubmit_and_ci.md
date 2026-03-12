# Task: Implement `presubmit` and `ci` subcommands (Sub-Epic: 003_Developer Entrypoint Script)

## Covered Requirements
- [1_PRD-REQ-045], [1_PRD-BR-001], [2_TAS-REQ-085]

## Dependencies
- depends_on: [03_implement_coverage.md]
- shared_components: [none]

## 1. Initial Test Written
- [ ] Add a shell script test `tests/test_do_script_presubmit.sh` that:
    - Verifies `./do presubmit` executes `setup`, `format`, `lint`, `test`, `coverage`, and `ci` in sequence.
    - Verifies `./do presubmit` exits with code 1 if any step fails.
    - Verifies `./do presubmit` exits with code 1 if it runs longer than 15 minutes ([1_PRD-BR-001]).

## 2. Task Implementation
- [ ] Implement `./do presubmit` subcommand:
    - Sequence: `./do setup && ./do format && ./do lint && ./do test && ./do coverage && ./do ci`.
- [ ] Implement the 15-minute wall-clock timeout ([2_TAS-REQ-085]):
    - Record the start time.
    - Monitor elapsed time before each sub-step.
    - Use a background watchdog process to kill all child processes if 15 minutes (900 seconds) are exceeded.
- [ ] Implement `./do ci` subcommand:
    - Stub logic to copy the working directory to a temporary branch or commit and run presubmit checks (as per CI/CD design).
    - For initial development, this can just verify that it is being called.

## 3. Code Review
- [ ] Verify the timeout is "wall-clock" time, including setup and all subsequent steps.
- [ ] Verify that if the timeout is reached, all sub-processes (cargo, etc.) are terminated.
- [ ] Verify that a failure in any step correctly blocks subsequent steps.

## 4. Run Automated Tests to Verify
- [ ] Run `bash tests/test_do_script_presubmit.sh`.
- [ ] Force a timeout (e.g., by adding `sleep 901` to a sub-step) and verify `./do presubmit` terminates and exits non-zero.

## 5. Update Documentation
- [ ] Update `GEMINI.md` to reflect that the full developer workflow is now supported by `./do`.
- [ ] Update `MEMORY.md` to note the 15-minute timeout policy.

## 6. Automated Verification
- [ ] Verify that `./do presubmit` completes successfully on a clean repository.
- [ ] Verify that `./do presubmit` contains "Presubmit checks passed" in stdout on success.
