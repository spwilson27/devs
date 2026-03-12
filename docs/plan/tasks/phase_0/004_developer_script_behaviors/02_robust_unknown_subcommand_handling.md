# Task: Implement robust unknown subcommand handling for `./do` (Sub-Epic: 004_Developer Script Behaviors)

## Covered Requirements
- [2_TAS-REQ-084]

## Dependencies
- depends_on: [01_implement_subcommand_contract_details.md]
- shared_components: ["./do Entrypoint Script"]

## 1. Initial Test Written
- [ ] Update shell script test `tests/test_do_invalid_subcommand.sh` to:
    - Invoke `./do invalid_command`.
    - Assert that exit code is 1.
    - Assert that the output is sent to stderr.
    - Assert that stderr contains the list of valid subcommands.

## 2. Task Implementation
- [ ] Update the `usage()` function in the `./do` script to:
    - Explicitly print to stderr using `>&2`.
    - List all valid subcommands: `setup`, `build`, `test`, `lint`, `format`, `coverage`, `presubmit`, `ci`.
- [ ] Refine the subcommand dispatcher to catch any unknown arguments:
    - Ensure the default case prints the usage message and `exit 1`.

## 3. Code Review
- [ ] Verify that the `usage()` output is clear and helpful.
- [ ] Confirm that the exit code is exactly 1 for any unknown subcommand.
- [ ] Ensure that no stdout is emitted for an invalid command.

## 4. Run Automated Tests to Verify
- [ ] Execute `bash tests/test_do_invalid_subcommand.sh` and confirm it passes for various invalid inputs (e.g., `./do unknown`, `./do help`, `./do ""`).

## 5. Update Documentation
- [ ] Update agent "memory" to reflect that the unknown subcommand contract is fully implemented and verified.

## 6. Automated Verification
- [ ] Run `./do something-random 2>&1 >/dev/null` and verify that the exit code is 1 and that some text was written to stderr.
