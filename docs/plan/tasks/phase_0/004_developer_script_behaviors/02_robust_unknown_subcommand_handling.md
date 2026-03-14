# Task: Implement Unknown Subcommand Handling for `./do` (Sub-Epic: 004_Developer Script Behaviors)

## Covered Requirements
- [2_TAS-REQ-084]

## Dependencies
- depends_on: ["01_implement_subcommand_contract_details.md"]
- shared_components: ["./do Entrypoint Script & CI Pipeline"]

## 1. Initial Test Written
- [ ] Create `tests/do_unknown_subcommand.sh` (POSIX sh, `set -eu`). The test script must verify the exact behavior specified in [2_TAS-REQ-084]:
- [ ] **Unknown subcommand test**: Run `./do foobar 2>stderr.tmp; rc=$?`. Assert `rc` equals 1. Assert `stderr.tmp` is non-empty. Assert `stderr.tmp` contains every valid subcommand name: `setup`, `build`, `test`, `lint`, `format`, `coverage`, `presubmit`, `ci`.
- [ ] **No-argument test**: Run `./do 2>stderr.tmp; rc=$?`. Assert `rc` equals 1. Assert `stderr.tmp` contains the valid subcommand list.
- [ ] **Stdout-is-empty test**: Run `./do unknown_xyz >stdout.tmp 2>/dev/null; true`. Assert `stdout.tmp` is empty (zero bytes) — all output must go to stderr.
- [ ] **Multiple invalid inputs**: Test `./do ""`, `./do --help`, `./do SETUP` (case sensitivity). All must exit 1 with the subcommand list on stderr.
- [ ] Each test case must include a `# Covers: 2_TAS-REQ-084` comment.

## 2. Task Implementation
- [ ] In the `./do` script, implement a `usage()` function that prints to stderr (`>&2`) a message listing all valid subcommands. Example format:
  ```
  Usage: ./do <subcommand>

  Valid subcommands:
    setup       Install dev dependencies (idempotent)
    build       Build for release
    test        Run all tests
    lint        Run all linters
    format      Run all formatters
    coverage    Run coverage tools
    presubmit   Full presubmit pipeline
    ci          Run CI validation
  ```
- [ ] In the `case` dispatcher's default (`*`) branch, call `usage` and then `exit 1`.
- [ ] When no argument is provided (`$# -eq 0`), call `usage` and `exit 1`.
- [ ] Ensure no text is written to stdout in the error path — only stderr.

## 3. Code Review
- [ ] Verify the `usage()` function uses only `>&2` redirection, not stdout.
- [ ] Verify the exit code is exactly 1 (not 2 or 127).
- [ ] Verify the subcommand list in `usage()` matches the set implemented in the `case` dispatcher — no stale or missing entries.
- [ ] Verify POSIX sh compatibility (no bashisms in the usage function).

## 4. Run Automated Tests to Verify
- [ ] Run `sh tests/do_unknown_subcommand.sh` and confirm all assertions pass.

## 5. Update Documentation
- [ ] No additional documentation changes needed beyond the comment block added in task 01.

## 6. Automated Verification
- [ ] Run the following and verify results match:
  ```sh
  ./do nonexistent 2>&1 >/dev/null | grep -q "setup" && echo "PASS" || echo "FAIL"
  test "$(./do nonexistent 2>/dev/null)" = "" && echo "PASS: no stdout" || echo "FAIL: stdout emitted"
  ./do nonexistent; test $? -eq 1 && echo "PASS: exit 1" || echo "FAIL: wrong exit code"
  ```
