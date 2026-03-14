# Task: Implement `./do` Unknown Command Handling (Sub-Epic: 027_Foundational Technical Requirements (Part 18))

## Covered Requirements
- [2_TAS-REQ-014E]

## Dependencies
- depends_on: []
- shared_components: [./do Entrypoint Script & CI Pipeline (consumer)]

## 1. Initial Test Written
- [ ] Create `tests/do_script/test_unknown_command.sh` (POSIX sh) with the following test cases:
  - **Test 1 — unknown command stderr output**: Run `./do foobar 2>stderr.txt`; assert `stderr.txt` contains exactly two lines:
    ```
    Unknown command: 'foobar'
    Valid commands: setup build test lint format coverage presubmit ci
    ```
  - **Test 2 — non-zero exit code**: Run `./do foobar`; capture `$?` and assert it equals 1.
  - **Test 3 — nothing on stdout**: Run `./do foobar 1>stdout.txt 2>/dev/null`; assert `stdout.txt` is empty (no output leaked to stdout).
  - **Test 4 — multi-word unknown command**: Run `./do "some thing" 2>stderr.txt`; assert first line of `stderr.txt` is `Unknown command: 'some thing'`.
  - **Test 5 — empty subcommand**: Run `./do "" 2>stderr.txt`; assert the unknown-command message is printed (the empty string is not a valid command).
- [ ] Each test case must print `PASS: <test_name>` on success or `FAIL: <test_name>` and exit non-zero on failure.
- [ ] The test script itself must exit non-zero if any individual test fails.

## 2. Task Implementation
- [ ] In the `./do` script, locate the case/if-else block that dispatches subcommands (`setup`, `build`, `test`, `lint`, `format`, `coverage`, `presubmit`, `ci`).
- [ ] Add a catch-all branch (e.g., `*` in a `case` statement or a final `else`) that:
  1. Prints `Unknown command: '<subcommand>'` to stderr (fd 2).
  2. Prints `Valid commands: setup build test lint format coverage presubmit ci` to stderr.
  3. Exits with code 1.
- [ ] Ensure the message uses single quotes around the command name exactly as specified.
- [ ] Ensure no other output is produced (no usage banners, no help text beyond the two lines).

## 3. Code Review
- [ ] Verify that the `./do` script remains POSIX sh compatible (`#!/bin/sh` shebang, no bashisms such as `[[ ]]`, `$()` nesting beyond POSIX, or `echo -e`).
- [ ] Verify the error message text matches `[2_TAS-REQ-014E]` character-for-character, including quoting and spacing.
- [ ] Verify the valid-commands list is in the exact order: `setup build test lint format coverage presubmit ci`.

## 4. Run Automated Tests to Verify
- [ ] Run `sh tests/do_script/test_unknown_command.sh` and confirm all 5 tests print `PASS`.
- [ ] Run `./do nonexistent` manually and visually confirm stderr output matches the specification.

## 5. Update Documentation
- [ ] Add a `// Covers: 2_TAS-REQ-014E` comment at the top of the test script file.

## 6. Automated Verification
- [ ] Run `sh tests/do_script/test_unknown_command.sh && echo "VERIFIED"` — the word `VERIFIED` must appear.
- [ ] Run `./do lint` (if available) to ensure no regressions in the `./do` script.
