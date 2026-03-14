# Task: Coverage Thresholds as Fixed Constants in ./do (Sub-Epic: 036_Detailed Domain Specifications (Part 1))

## Covered Requirements
- [1_PRD-KPI-BR-004]

## Dependencies
- depends_on: [none]
- shared_components: ["./do Entrypoint Script"]

## 1. Initial Test Written
- [ ] Create a test script at `tests/do_script/test_coverage_thresholds.sh` with the following test cases:
- [ ] **Constants exist test**: Parse the `./do` script and assert that it defines the following constants (as shell variables assigned before any coverage logic):
  - `UNIT_COVERAGE_THRESHOLD=90` (QG-001: 90% unit line coverage)
  - `E2E_COVERAGE_THRESHOLD=80` (QG-002: 80% aggregate E2E line coverage)
  - `E2E_CLI_COVERAGE_THRESHOLD=50` (QG-003: 50% CLI E2E coverage)
  - `E2E_TUI_COVERAGE_THRESHOLD=50` (QG-004: 50% TUI E2E coverage)
  - `E2E_MCP_COVERAGE_THRESHOLD=50` (QG-005: 50% MCP E2E coverage)
- [ ] **Config file ignored test**: Create a file `.devs_coverage.toml` (or `.devs_coverage.json`) in the workspace root with different threshold values (e.g., `unit = 50`). Run `./do coverage` and verify that the thresholds used are still the hardcoded values (90, 80, 50, 50, 50), not the values from the config file.
- [ ] **Environment variable ignored test**: Set `DEVS_UNIT_COVERAGE_THRESHOLD=50` in the environment and run `./do coverage`. Verify that the threshold used is still 90, not 50.
- [ ] **Threshold comparison test**: Mock coverage output to report exactly 89.9% unit coverage. Assert `./do coverage` fails (exit code 1) because `89.9 < 90`. Then mock 90.0% and assert it passes. This confirms the hardcoded threshold is enforced.

## 2. Task Implementation
- [ ] At the top of the `./do` script (or at the beginning of the `coverage` subcommand), define the five threshold constants as readonly shell variables:
  ```sh
  UNIT_COVERAGE_THRESHOLD=90
  E2E_COVERAGE_THRESHOLD=80
  E2E_CLI_COVERAGE_THRESHOLD=50
  E2E_TUI_COVERAGE_THRESHOLD=50
  E2E_MCP_COVERAGE_THRESHOLD=50
  ```
- [ ] Ensure these variables are used in all coverage gate comparison logic (replacing any dynamic loading if present).
- [ ] Remove or prevent any code path that reads thresholds from config files, environment variables, or command-line flags.
- [ ] Add a comment above the constants: `# Coverage thresholds are fixed constants per [1_PRD-KPI-BR-004]. Change requires editing this script.`

## 3. Code Review
- [ ] Verify that the five threshold constants match the values specified in the requirements (QG-001 through QG-005).
- [ ] Verify that no code path in `./do` reads threshold values from any external source (config files, env vars, CLI flags).
- [ ] Verify that changing a threshold requires editing the `./do` script source, as stated in [1_PRD-KPI-BR-004].
- [ ] Grep the entire `./do` script for any `read`, `source`, `eval`, or config-parsing patterns that could dynamically override thresholds.

## 4. Run Automated Tests to Verify
- [ ] Run `bash tests/do_script/test_coverage_thresholds.sh` and verify all test cases pass.
- [ ] Run `./do coverage` on the real codebase to verify normal operation.

## 5. Update Documentation
- [ ] Add `# Covers: 1_PRD-KPI-BR-004` comments in the test script and next to the constant definitions in `./do`.

## 6. Automated Verification
- [ ] Run: `grep -c 'UNIT_COVERAGE_THRESHOLD=90' ./do` and assert output is `1` (exactly one definition).
- [ ] Run: `grep -c 'E2E_COVERAGE_THRESHOLD=80' ./do` and assert output is `1`.
- [ ] Run the test script in CI: `bash tests/do_script/test_coverage_thresholds.sh && echo PASS || echo FAIL`
