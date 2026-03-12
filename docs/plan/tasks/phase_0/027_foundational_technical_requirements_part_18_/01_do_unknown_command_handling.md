# Task: Implement `./do` Unknown Command Handling (Sub-Epic: 027_Foundational Technical Requirements (Part 18))

## Covered Requirements
- [2_TAS-REQ-014E]

## Dependencies
- depends_on: [none]
- shared_components: [./do Entrypoint Script]

## 1. Initial Test Written
- [ ] Create a shell script test `tests/test_do_unknown_command.sh` (or integrate into an existing shell test suite) that:
    - Calls `./do non-existent-command`.
    - Asserts that the exit code is non-zero.
    - Asserts that the output to `stderr` matches:
      ```
      Unknown command: 'non-existent-command'
      Valid commands: setup build test lint format coverage presubmit ci
      ```

## 2. Task Implementation
- [ ] Modify the `./do` script's command parsing logic:
    - Add a catch-all case for subcommands that are not in the valid list (`setup`, `build`, `test`, `lint`, `format`, `coverage`, `presubmit`, `ci`).
    - Implement the error message and non-zero exit as specified.
    - Ensure the usage information is printed to `stderr`.

## 3. Code Review
- [ ] Verify that the script uses POSIX-compliant shell features.
- [ ] Ensure the error message is exactly as specified in `[2_TAS-REQ-014E]`.

## 4. Run Automated Tests to Verify
- [ ] Execute the test script: `bash tests/test_do_unknown_command.sh`.
- [ ] Confirm the script fails gracefully with the correct message and exit code.

## 5. Update Documentation
- [ ] Update any developer-facing documentation (e.g., `README.md`) if it lists valid commands to ensure it is consistent with the `./do` script.

## 6. Automated Verification
- [ ] Run `./do lint` (if implemented) to ensure no shell script syntax errors were introduced.
- [ ] Verify the test case is part of the standard `./do test` suite (if applicable).
