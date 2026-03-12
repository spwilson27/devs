# Task: `./do coverage` — Fail Fast if Zero `.profraw` Files Found for E2E Runs (Sub-Epic: 51_MIT-023)

## Covered Requirements
- [AC-RISK-023-04]

## Dependencies
- depends_on: [01_e2e_subprocess_helper_llvm_profile.md, 03_coverage_script_e2e_isolation.md]
- shared_components: [./do Entrypoint Script, Traceability & Verification Infrastructure]

## 1. Initial Test Written

- [ ] In `.tools/tests/test_coverage_script.py`, write a pytest test `test_coverage_fails_on_zero_profraw` that:
  1. Creates a temporary directory (via `tmp_path` fixture).
  2. Sets `LLVM_PROFILE_FILE` to a path inside `tmp_path` (so no real `.profraw` files are written).
  3. Patches `./do coverage`'s profraw-glob location to `tmp_path/*.profraw` (empty).
  4. Runs `./do coverage --profraw-dir=<tmp_path>` (add this flag for testability).
  5. Asserts the script exits with a non-zero code.
  6. Asserts that the script's stderr output contains the exact string `"internal: zero .profraw files found for E2E subprocess runs"`.
  7. Annotate: `# Covers: AC-RISK-023-04`.
- [ ] Write a pytest test `test_coverage_succeeds_with_profraw_present` that:
  1. Creates a temporary directory with a dummy non-empty file named `devs-coverage-12345.profraw`.
  2. Runs `./do coverage --dry-run --profraw-dir=<tmp_path>` (dry-run skips actual `cargo llvm-cov` but still validates the guard).
  3. Asserts the script exits with code 0 (the guard passes, no error).
  4. Annotate: `# Covers: AC-RISK-023-04`.
- [ ] Write a pytest test `test_coverage_error_message_exact_string` that:
  1. Triggers the zero-profraw condition.
  2. Captures stderr.
  3. Asserts `stderr` contains exactly `"internal: zero .profraw files found for E2E subprocess runs"` as a substring (exact string match per `RISK-023-BR-003`).
  4. Annotate: `# Covers: AC-RISK-023-04`.

## 2. Task Implementation

- [ ] In `./do`, after the E2E `cargo llvm-cov` invocation (added in task 03), add a profraw-count guard:
  ```sh
  # Covers: AC-RISK-023-04
  PROFRAW_DIR="${PROFRAW_DIR:-/tmp}"
  PROFRAW_COUNT=$(ls "${PROFRAW_DIR}"/devs-coverage-*.profraw 2>/dev/null | wc -l)
  if [ "${PROFRAW_COUNT}" -eq 0 ]; then
      echo "internal: zero .profraw files found for E2E subprocess runs" >&2
      exit 1
  fi
  ```
- [ ] Add a `--profraw-dir` flag to `./do coverage` that overrides the default `/tmp` search path (used by the test harness):
  ```sh
  # Parse --profraw-dir=<path> from $@ before the main coverage logic.
  PROFRAW_DIR="/tmp"
  for arg in "$@"; do
      case "$arg" in
          --profraw-dir=*)
              PROFRAW_DIR="${arg#*=}"
              ;;
      esac
  done
  ```
- [ ] Ensure the guard runs AFTER the E2E `cargo llvm-cov` invocation (from task 03) completes — the `.profraw` files are written by the test processes during that invocation.
- [ ] Ensure the guard runs BEFORE the `cargo llvm-cov report --lcov` merge step — so a corrupt/empty state is caught before reporting.
- [ ] The error message MUST be written to stderr (`>&2`), not stdout, so it does not pollute coverage report output.
- [ ] Add `# Covers: AC-RISK-023-04` comment directly above the guard block in `./do`.
- [ ] On macOS, the default `ls` may not expand globs the same way; use `find` as a fallback:
  ```sh
  PROFRAW_COUNT=$(find "${PROFRAW_DIR}" -maxdepth 1 -name 'devs-coverage-*.profraw' 2>/dev/null | wc -l)
  ```

## 3. Code Review

- [ ] Confirm the exact error string in the guard block matches `"internal: zero .profraw files found for E2E subprocess runs"` byte-for-byte (no trailing whitespace or newline before `\n`).
- [ ] Confirm the guard uses `exit 1` (non-zero) — not `exit 0` or a warning.
- [ ] Confirm the guard writes to `stderr` (`>&2`), not `stdout`.
- [ ] Confirm `--profraw-dir` is parsed before the main logic so test overrides take effect.
- [ ] Confirm the guard is not reachable in the unit-test-only phase (it only runs in the E2E phase, which is the second `cargo llvm-cov` invocation introduced in task 03).

## 4. Run Automated Tests to Verify

- [ ] Run `python -m pytest .tools/tests/test_coverage_script.py::test_coverage_fails_on_zero_profraw -v` and assert exit code 0 (the test passes).
- [ ] Run `python -m pytest .tools/tests/test_coverage_script.py::test_coverage_succeeds_with_profraw_present -v` and assert exit code 0.
- [ ] Run `python -m pytest .tools/tests/test_coverage_script.py::test_coverage_error_message_exact_string -v` and assert exit code 0.
- [ ] Manually trigger the guard: `./do coverage --profraw-dir=/tmp/nonexistent_empty_dir` and assert exit code 1 and stderr contains the exact error string.

## 5. Update Documentation

- [ ] Update `./do` inline help text for `coverage` to document the `--profraw-dir` flag and the zero-profraw guard.
- [ ] Add a `## Zero `.profraw` Guard` subsection to the developer coverage documentation explaining that silent 0% E2E coverage is prohibited.
- [ ] Add `# Covers: AC-RISK-023-04` annotation above the guard block (already done in implementation, verify it is present).

## 6. Automated Verification

- [ ] Run `.tools/verify_requirements.py` and confirm `AC-RISK-023-04` appears in `covered`.
- [ ] Run `grep -n "AC-RISK-023-04" ./do` and assert the annotation is present.
- [ ] Run `grep -n "internal: zero .profraw files found for E2E subprocess runs" ./do` and assert the exact string is present.
- [ ] Run `python -m pytest .tools/tests/test_coverage_script.py -v` (all three new tests) and assert all pass with exit code 0.
