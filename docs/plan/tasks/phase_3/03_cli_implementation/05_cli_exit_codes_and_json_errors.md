# Task: CLI Exit Codes and JSON Error Reporting (Sub-Epic: 03_CLI Implementation)

## Covered Requirements
- [2_TAS-REQ-062], [2_TAS-REQ-063]

## Dependencies
- depends_on: [01_cli_scaffold_and_global_flags.md, 04_control_and_project_commands.md]
- shared_components: [devs-core]

## 1. Initial Test Written
- [ ] Write E2E tests in `tests/e2e/test_cli_errors.py` (using `assert_cmd`) for each exit code category:
  - 1: Trigger a general error (e.g., provide a valid command but with conflicting arguments).
  - 2: Trigger a NOT_FOUND error (e.g., `devs status 00000000-0000-0000-0000-000000000000`).
  - 3: Trigger an unreachable server error (invoke CLI with no server running).
  - 4: Trigger a validation error (e.g., `devs submit <invalid-workflow>`).
- [ ] Write a test for each case with `--format json` and verify that stdout contains `{ "error": "...", "code": ... }`.

## 2. Task Implementation
- [ ] Implement a centralized error handling mechanism in `devs-cli`:
  - Map `tonic::Status` and `anyhow::Error` to specific CLI exit codes.
  - Implement the `Display` or a custom trait to output the required JSON format when `--format json` is active.
- [ ] Ensure that for all commands:
  - Success exits with code `0`.
  - General errors exit with code `1`.
  - Not found (run, stage, project, pool) exits with code `2`.
  - Server unreachable exits with code `3`.
  - Validation error (workflow validation, input parsing) exits with code `4`.
- [ ] JSON Error Format: If `--format json` is enabled, any non-zero exit MUST write the error JSON to stdout and nothing else to stdout.

## 3. Code Review
- [ ] Verify that the error mapping is consistent with [2_TAS-REQ-062].
- [ ] Ensure that human-readable error messages are still written to stderr even when `--format json` is used (for user debugging), but stdout only contains the JSON.
- [ ] Verify that the `code` field in the JSON matches the process exit code.

## 4. Run Automated Tests to Verify
- [ ] Run `./do test` to verify all error handling tests pass.
- [ ] Verify that `devs list --format json` returns an empty array `[]` on success with no runs, but an error JSON on failure.

## 5. Update Documentation
- [ ] Document the CLI exit codes and JSON error format in the project's technical documentation.

## 6. Automated Verification
- [ ] Run the `verify_requirements.py` script to ensure that [2_TAS-REQ-062] and [2_TAS-REQ-063] are fully covered by the implemented tests.
