# Task: Comprehensive ./do lint Failure Reporting (Sub-Epic: 038_Detailed Domain Specifications (Part 3))

## Covered Requirements
- [1_PRD-KPI-BR-014]

## Dependencies
- depends_on: []
- shared_components: [./do Entrypoint Script]

## 1. Initial Test Written
- [ ] Create a shell script `tests/test_lint_reporting.sh` that:
    - Simulates a lint failure in one of the tools (`cargo fmt`, `cargo clippy`, or `cargo doc`).
    - Runs `./do lint` and verifies that it exits non-zero.
    - Asserts that the full output of the failing tool is printed to stderr.
    - Verifies that the exit code is 1 and the output specifically names the failing tool.

## 2. Task Implementation
- [ ] Implement the `./do lint` command to execute `cargo fmt --check`, `cargo clippy`, and `cargo doc` in order.
- [ ] Capture the exit status of each command.
- [ ] If any command fails, print the name of the failing check and the tool's raw output to stderr.
- [ ] Return exit code 1 if any step fails.
- [ ] Ensure the formatting check fails specifically for divergence.
- [ ] Ensure clippy fails specifically on warnings (via `-D warnings`).
- [ ] Ensure doc check fails on any warning or error by parsing stdout/stderr.

## 3. Code Review
- [ ] Verify that all three lint checks are correctly executed and their outputs are handled.
- [ ] Ensure that a failure in an earlier step correctly stops the process and reports the error.
- [ ] Check that `cargo doc` warnings are successfully captured and cause a failure.

## 4. Run Automated Tests to Verify
- [ ] Run `./do lint` on a file with intentional formatting, clippy, or doc issues and verify correct failure reporting.

## 5. Update Documentation
- [ ] Update documentation to describe the linting requirements and the reporting format for failed checks.

## 6. Automated Verification
- [ ] Use a temporary file with a missing doc comment and verify that `./do lint` fails with the appropriate `missing_docs` clippy error.
