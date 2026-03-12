# Task: Milestone Verification - ./do Script Compliance and Performance (Sub-Epic: 095_Acceptance Criteria & Roadmap (Part 6))

## Covered Requirements
- [AC-ROAD-P0-001], [AC-ROAD-P0-003]

## Dependencies
- depends_on: [none]
- shared_components: [./do Entrypoint Script]

## 1. Initial Test Written
- [ ] Create a shell script test `tests/scripts/test_shell_compliance.sh` that invokes `shellcheck --shell=sh ./do` and asserts it exits with 0.
- [ ] Create a performance benchmark test (or use `time ./do presubmit`) and assert that the total wall-clock time is under 900 seconds on the current environment. Note: Platform-specific verification (macOS, Windows) is handled by CI, so the local test should focus on the POSIX compliance and a local baseline for timing.

## 2. Task Implementation
- [ ] Run `shellcheck --shell=sh ./do` and identify any bashisms (e.g., `[[`, `array=()`, `function foo()`).
- [ ] Refactor `./do` to use only POSIX-compliant shell syntax (`[ ]` instead of `[[ ]]`, etc.).
- [ ] Optimize `./do presubmit` if necessary (e.g., by ensuring parallel execution of independent tasks or avoiding redundant builds) to meet the 900s limit.
- [ ] Verify that the script still functions correctly on all subcommands (`setup`, `build`, `test`, `lint`, `format`, `coverage`, `presubmit`).

## 3. Code Review
- [ ] Ensure `./do` does not use any non-standard shell features.
- [ ] Verify that the script remains readable and maintainable after refactoring.
- [ ] Confirm that `presubmit` includes all necessary steps (setup, format, lint, test, coverage) as per Phase 0 requirements.

## 4. Run Automated Tests to Verify
- [ ] Execute `shellcheck --shell=sh ./do`.
- [ ] Execute `./do presubmit` and record the time taken.

## 5. Update Documentation
- [ ] Update `GEMINI.md` or `README.md` if any changes to the `./do` script's internal logic were made that developers should be aware of.
- [ ] Record the baseline performance of `presubmit` in the project's performance logs if they exist.

## 6. Automated Verification
- [ ] Run `.tools/verify_requirements.py` to ensure AC-ROAD-P0-001 and AC-ROAD-P0-003 are correctly mapped.
