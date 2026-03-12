# Task: Implement `./do coverage` Quality Gate Exit Logic (Sub-Epic: 028_Foundational Technical Requirements (Part 19))

## Covered Requirements
- [2_TAS-REQ-015D]

## Dependencies
- depends_on: [none]
- shared_components: [./do Entrypoint Script, Traceability & Verification Infrastructure]

## 1. Initial Test Written
- [ ] Create a Python test script `tests/test_do_coverage_exit.py` that mocks the coverage report JSON file.
- [ ] Mock a report with `overall_passed: true` and verify `./do coverage` exits with code 0.
- [ ] Mock a report with `overall_passed: false` and verify `./do coverage` exits with a non-zero code.
- [ ] Verify that when failing, the script prints a summary table to stderr listing failing gates with `actual_pct` and `threshold_pct`.

## 2. Task Implementation
- [ ] Update `.tools/ci.py` or the coverage processing script (e.g., `.tools/verify_requirements.py` or a dedicated coverage script) to parse the coverage report JSON.
- [ ] Implement logic to extract `overall_passed` and the list of `gates` that failed.
- [ ] Update `./do coverage` subcommand logic to invoke this verification and exit accordingly.
- [ ] Use a library like `tabulate` (if available in `.tools/.venv`) or simple string formatting to print the failing gates table to stderr.
  ```text
  Failing Quality Gates:
  | Gate ID | Actual % | Threshold % |
  |---------|----------|-------------|
  | QG-001  | 85.5%    | 90.0%       |
  ```

## 3. Code Review
- [ ] Verify the summary table is printed to **stderr**, not stdout.
- [ ] Ensure the exit code is non-zero (e.g., 1) when `overall_passed` is false.
- [ ] Confirm the report parsing is robust against missing fields or malformed JSON.

## 4. Run Automated Tests to Verify
- [ ] Run `pytest tests/test_do_coverage_exit.py`.
- [ ] Manually run `./do coverage` with a forced failure state (e.g., by temporarily increasing a threshold) and verify stderr output.

## 5. Update Documentation
- [ ] Update `.tools/README.md` to reflect the coverage exit behavior and reporting format.

## 6. Automated Verification
- [ ] Run `./do coverage` and verify that the exit code matches the `overall_passed` field in the generated report JSON.
