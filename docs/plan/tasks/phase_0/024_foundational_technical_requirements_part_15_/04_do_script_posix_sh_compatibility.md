# Task: Enforce POSIX sh Compatibility for ./do Script (Sub-Epic: 024_Foundational Technical Requirements (Part 15))

## Covered Requirements
- [2_TAS-REQ-010D]

## Dependencies
- depends_on: ["none"]
- shared_components: ["./do Entrypoint Script & CI Pipeline"]

## 1. Initial Test Written
- [ ] Write a shell test (`tests/ci/do_posix_compat_test.sh` or equivalent) that runs `checkbashisms ./do` (from the `devscripts` package) and asserts exit code 0. If `checkbashisms` is not available, write a regex-based test that scans `./do` for known bash-isms: `[[ ]]`, `$'...'`, `<(...)`, `>(...)`, bash arrays (`declare -a`, `local -a`, `arr=()`), `function` keyword, `{a..z}` brace expansion, `==` inside `[ ]` (POSIX uses `=`), and `source` (POSIX uses `.`).
- [ ] Write a test that asserts the first line of `./do` is exactly `#!/bin/sh`.
- [ ] Write a test that runs `sh -n ./do` to verify the script has valid POSIX sh syntax (no parse errors).

## 2. Task Implementation
- [ ] Ensure `./do` has shebang line `#!/bin/sh` as its first line.
- [ ] Audit the entire `./do` script and replace any bash-specific constructs:
  - Replace `[[ ... ]]` with `[ ... ]` or `test ...`
  - Replace `==` with `=` inside `[ ]`
  - Replace bash arrays with space-separated strings and `for` loops
  - Replace `$'...'` with `printf` or literal characters
  - Replace process substitution `<(...)` with temporary files or pipes
  - Replace `function foo()` with `foo()`
  - Replace `source` with `.`
  - Replace `local` arrays with plain `local` variables
- [ ] Add a `checkbashisms` step to `./do lint` that scans `./do` for bash-specific syntax. If `checkbashisms` is not installed, fall back to a `grep`-based check for the most common bash-isms.

## 3. Code Review
- [ ] Verify no bash-specific constructs remain in the script.
- [ ] Verify the script runs correctly under `dash` (a strict POSIX sh) if available on the system.
- [ ] Verify the lint step catches future regressions.

## 4. Run Automated Tests to Verify
- [ ] Run `sh -n ./do` to verify syntax.
- [ ] Run the POSIX compatibility test.
- [ ] Run `./do lint` and verify the bash-isms check passes.

## 5. Update Documentation
- [ ] Add a comment at the top of `./do` (below the shebang): `# This script must remain POSIX sh-compatible. Do not use bash-specific syntax.`

## 6. Automated Verification
- [ ] Run `head -1 ./do | grep -q '#!/bin/sh' && echo "PASS" || echo "FAIL"`.
- [ ] Run `sh -n ./do && echo "PASS" || echo "FAIL"`.
- [ ] If `checkbashisms` is available: `checkbashisms ./do && echo "PASS" || echo "FAIL"`.
