# Task: Blocking Formatting Lint Enforcement (Sub-Epic: 072_Detailed Domain Specifications (Part 37))

## Covered Requirements
- [2_TAS-REQ-439]

## Dependencies
- depends_on: [none]
- shared_components: [./do Entrypoint Script]

## 1. Initial Test Written
- [ ] Create a shell test `tests/test_fmt_blocking.sh` that:
    - Runs `./do lint` on a clean repository and ensures it passes.
    - Intentionally modifies a file with incorrect formatting.
    - Runs `./do lint` and asserts it fails with a non-zero exit code due to formatting.

## 2. Task Implementation
- [ ] Ensure that the `cmd_lint` function in the `./do` script includes `run(["cargo", "fmt", "--all", "--check"])`.
- [ ] Ensure that `run`'s return code is checked and causes the `./do lint` to exit with an error immediately.
- [ ] Verify that the `presubmit` command in `./do` also fails if the `lint` step (which includes formatting) fails.

## 3. Code Review
- [ ] Verify that `cargo fmt --all --check` is used to cover all workspace members.
- [ ] Confirm that no `--quiet` flag is used in a way that hides helpful formatting error messages.

## 4. Run Automated Tests to Verify
- [ ] Run `sh tests/test_fmt_blocking.sh`.

## 5. Update Documentation
- [ ] None required.

## 6. Automated Verification
- [ ] Introduce a formatting error and verify that both `./do lint` and `./do presubmit` fail as expected.
