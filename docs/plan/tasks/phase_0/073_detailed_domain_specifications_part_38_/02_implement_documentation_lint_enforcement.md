# Task: Documentation Lint Enforcement (Sub-Epic: 073_Detailed Domain Specifications (Part 38))

## Covered Requirements
- [2_TAS-REQ-441], [2_TAS-REQ-444]

## Dependencies
- depends_on: [01_implement_clippy_and_unsafe_lints.md]
- shared_components: [./do Entrypoint Script]

## 1. Initial Test Written
- [ ] Create a shell script `tests/verify_doc_lint.sh` that:
    - Creates a temporary Rust file with a documentation error (e.g., broken link in comments `/// [missing_link]`).
    - Runs `./do lint` and verifies it exits with a non-zero status.
    - Creates a temporary Rust file with a documentation warning.
    - Runs `./do lint` and verifies it exits with a non-zero status.
- [ ] Ensure the script cleans up the temporary files.

## 2. Task Implementation
- [ ] Update the `cmd_lint` function in the `./do` script to run `cargo doc`.
- [ ] The `cargo doc` command must include:
    - `--workspace --no-deps --all-features` to ensure all workspace crates are checked.
- [ ] Implement output capture for the `cargo doc` command.
- [ ] Add a check to verify if the string `warning` or `error` appears in the output of `cargo doc` ([2_TAS-REQ-441]).
- [ ] If any of those strings are found, treat the doc lint as a failure and ensure the exit code of `./do lint` reflects this.
- [ ] Ensure the doc lint runs in sequence, regardless of whether previous lint steps (like clippy) failed ([2_TAS-REQ-444]).

## 3. Code Review
- [ ] Verify that `cargo doc` is called with the correct flags.
- [ ] Confirm that the output capture and string check are correctly implemented to catch doc warnings that might not result in a non-zero exit code from `cargo doc`.
- [ ] Ensure that `cmd_lint` correctly aggregates the result of the doc check.

## 4. Run Automated Tests to Verify
- [ ] Run `sh tests/verify_doc_lint.sh` and ensure it passes.
- [ ] Run `./do lint` on the current codebase and ensure it passes.

## 5. Update Documentation
- [ ] Document the documentation linting process in the developer guide, explaining that warnings and errors in `cargo doc` are blocking.

## 6. Automated Verification
- [ ] Run `./do lint` and verify that `cargo doc` is executed and its output is analyzed.
- [ ] Inspect the `./do` script to confirm the presence of the `warning` and `error` string checks on `cargo doc` output.
