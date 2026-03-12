# Task: CLI Standardized Output and Error Handling (Sub-Epic: 012_Foundational Technical Requirements (Part 3))

## Covered Requirements
- [2_PRD-BR-010], [2_PRD-BR-011], [2_PRD-BR-012]

## Dependencies
- depends_on: [none]
- shared_components: [devs-cli, devs-core]

## 1. Initial Test Written
- [ ] Create a unit test in `devs-cli` to verify the `OutputFormatter` (or similar utility) correctly handles `--format json` flag.
- [ ] Create a test case that ensures when an error occurs and `--format json` is set, the output to stdout is a single JSON object with the format: `{ "error": "<message>", "code": <exit_code> }`.
- [ ] Create a test case that ensures the CLI exits with the correct exit codes: `0` (Success), `1` (General error), `2` (Not found), `3` (Server unreachable), and `4` (Validation error).
- [ ] Create a test case that ensures human-readable formatting only appears on stderr when `--format json` is active.

## 2. Task Implementation
- [ ] Implement a global CLI flag `--format` with values `json` or `text` (default) using `clap`.
- [ ] Create a shared error/output handling module in `devs-cli` that maps domain errors to the standardized exit codes (1-4).
- [ ] Implement a `CliResponse` or similar structure that can be serialized to JSON for stdout or formatted as text.
- [ ] Ensure that all CLI commands use this shared handler for outputting results and exiting.
- [ ] Verify that if `--format json` is active, no other output is written to stdout.

## 3. Code Review
- [ ] Verify that the implementation does not embed business logic in the CLI handlers.
- [ ] Ensure the JSON output schema is consistent across all commands.
- [ ] Check that the code follow the `devs` workspace linting rules.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-cli` and ensure all tests pass.
- [ ] Verify that the `assert_cmd` integration tests (once they exist) correctly capture exit codes and output streams.

## 5. Update Documentation
- [ ] Update the `devs-cli` documentation or README to describe the standardized output behavior and exit codes.
- [ ] Update agent memory to reflect the availability of the standardized CLI output utility.

## 6. Automated Verification
- [ ] Run `./do test` and ensure the traceability report includes coverage for `[2_PRD-BR-010]`, `[2_PRD-BR-011]`, and `[2_PRD-BR-012]`.
