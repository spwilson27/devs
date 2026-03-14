# Task: ./do Script Single Entrypoint and LF Line Ending Enforcement (Sub-Epic: 060_Detailed Domain Specifications (Part 25))

## Covered Requirements
- [2_TAS-REQ-251], [2_TAS-REQ-254]

## Dependencies
- depends_on: []
- shared_components: ["./do Entrypoint Script & CI Pipeline"]

## 1. Initial Test Written
- [ ] Create `tests/do_script_hygiene_test.sh` (POSIX sh) with the following test cases:
  - **Test 1 — Existence**: Assert `./do` exists at the repository root: `test -f ./do || exit 1`
  - **Test 2 — Executable bit**: Assert `./do` has the executable permission: `test -x ./do || exit 1`
  - **Test 3 — Shebang line**: Assert the first line of `./do` is `#!/bin/sh` (POSIX sh, not bash): `head -1 ./do | grep -q '^#!/bin/sh$' || exit 1`
  - **Test 4 — LF line endings**: Assert `./do` contains no carriage return bytes: `if grep -qP '\r' ./do; then exit 1; fi`
  - **Test 5 — .gitattributes rule**: Assert `.gitattributes` contains a line matching the pattern `do text eol=lf` (with or without leading `./`): `grep -qE '^\.?/?do\s+text\s+eol=lf' .gitattributes || exit 1`
  - **Test 6 — Git attribute applied**: Run `git check-attr eol -- do` and assert output contains `lf`
  - **Test 7 — Every documented subcommand callable**: For each subcommand in `{setup,build,test,lint,format,coverage,presubmit,ci}`, assert that `./do <cmd> --help 2>&1 || ./do <cmd> 2>&1` does NOT output `"unknown command"` or `"not recognized"`. (This validates [2_TAS-REQ-251] that every command is callable via `./do <command>`.)

## 2. Task Implementation
- [ ] Ensure `./do` exists at the repository root as a POSIX `#!/bin/sh` script. If it already exists, verify the shebang; if it uses `#!/bin/bash`, change to `#!/bin/sh` for POSIX compliance.
- [ ] Run `chmod +x ./do` to set the executable bit.
- [ ] Create or update `.gitattributes` at the repository root. Add the line: `do text eol=lf`. This forces Git to check out `./do` with LF line endings on all platforms, including Windows CI runners ([2_TAS-REQ-254]).
- [ ] If `.gitattributes` already exists, append the rule only if not already present. Do not duplicate.
- [ ] Run `git add .gitattributes do` to stage both files.
- [ ] Verify with `git check-attr eol -- do` that the output shows `eol: lf`.
- [ ] Verify the `./do` script dispatches all documented subcommands (`setup`, `build`, `test`, `lint`, `format`, `coverage`, `presubmit`, `ci`) — each must be a recognized subcommand that does not produce an "unknown command" error. Stubs that exit 0 with a TODO message are acceptable at this stage, but the dispatch logic must exist.

## 3. Code Review
- [ ] Confirm `./do` uses POSIX sh constructs only (no bashisms: no `[[`, no `(( ))`, no arrays, no `local` in non-function context).
- [ ] Confirm `.gitattributes` rule uses the correct path pattern matching the actual filename (`do`, not `./do` — Git attribute patterns are relative to the repo root).
- [ ] Confirm no other files are affected by the `.gitattributes` rule (the pattern must be specific to `do`).

## 4. Run Automated Tests to Verify
- [ ] Run `sh tests/do_script_hygiene_test.sh` and confirm exit code 0.
- [ ] Run `./do lint` (if available) to ensure no formatting or lint violations.

## 5. Update Documentation
- [ ] Add a `// Covers: 2_TAS-REQ-251, 2_TAS-REQ-254` annotation comment at the top of the test file.

## 6. Automated Verification
- [ ] Run `test -x ./do && echo PASS || echo FAIL` — must print PASS.
- [ ] Run `grep -c 'eol=lf' .gitattributes` — must print at least `1`.
- [ ] Run `file ./do` — must NOT contain `CRLF` or `\r\n`.
- [ ] Run `git check-attr eol -- do` — must contain `lf`.
