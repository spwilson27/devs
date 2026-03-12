# Task: Clippy and Unsafe Code Lint Enforcement (Sub-Epic: 073_Detailed Domain Specifications (Part 38))

## Covered Requirements
- [2_TAS-REQ-440], [2_TAS-REQ-443], [2_TAS-REQ-444]

## Dependencies
- depends_on: [none]
- shared_components: [./do Entrypoint Script]

## 1. Initial Test Written
- [ ] Create a shell script `tests/verify_clippy_lint.sh` that:
    - Creates a temporary Rust file with a Clippy warning (e.g., `let x = 1;`).
    - Runs `./do lint` and verifies it exits with a non-zero status.
    - Creates a temporary Rust file with `unsafe { }` code.
    - Runs `./do lint` and verifies it exits with a non-zero status.
- [ ] Ensure the script cleans up the temporary files.

## 2. Task Implementation
- [ ] Update the `cmd_lint` function in the `./do` script to run `cargo clippy`.
- [ ] The `cargo clippy` command must include:
    - `--workspace --all-targets --all-features` to ensure all code is checked.
    - `-- -D warnings` to treat all warnings as errors ([2_TAS-REQ-440]).
    - `-D unsafe_code` to prohibit unsafe code ([2_TAS-REQ-443]).
- [ ] Implement a result aggregation mechanism in `cmd_lint`:
    - Run the command and store its return code.
    - Ensure `./do lint` continues to subsequent lint steps even if clippy fails ([2_TAS-REQ-444]).
- [ ] Add the clippy check to the list of steps in `cmd_lint`.

## 3. Code Review
- [ ] Verify that `cargo clippy` is called with the correct flags as specified in the requirements.
- [ ] Confirm that `cmd_lint` doesn't `sys.exit` immediately on failure, but collects the result.
- [ ] Ensure that the exit code of `./do lint` is non-zero if the clippy check fails.

## 4. Run Automated Tests to Verify
- [ ] Run `sh tests/verify_clippy_lint.sh` and ensure it passes.
- [ ] Run `./do lint` on the current codebase and ensure it passes (assuming no lint errors exist).

## 5. Update Documentation
- [ ] Update `README.md` or a development guide to mention that all clippy warnings and unsafe code are strictly prohibited and enforced by `./do lint`.

## 6. Automated Verification
- [ ] Run `./do lint` and verify the output shows the clippy command being executed.
- [ ] Inspect the `./do` script to confirm the presence of `-D warnings` and `-D unsafe_code`.
