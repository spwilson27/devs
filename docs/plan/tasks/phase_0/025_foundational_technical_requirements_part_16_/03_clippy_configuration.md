# Task: Configure Clippy in ./do lint (Sub-Epic: 025_Foundational Technical Requirements (Part 16))

## Covered Requirements
- [2_TAS-REQ-012C]

## Dependencies
- depends_on: ["02_format_and_lint_command_separation.md"]
- shared_components: ["./do Entrypoint Script & CI Pipeline"]

## 1. Initial Test Written
- [ ] Write a test that invokes `./do lint` and asserts that `cargo clippy --workspace --all-targets --all-features -- -D warnings` is executed as part of the lint pipeline. Validate by checking the command's stdout/stderr output or by introducing a deliberate clippy warning and confirming `./do lint` fails.
- [ ] Write a test that introduces a trivial clippy warning (e.g., `let x = vec![1,2,3]; let _ = x.len() > 0;` instead of `!x.is_empty()`) in a test file and asserts `./do lint` exits non-zero due to `-D warnings` promoting it to an error.
- [ ] Write a test that introduces a clippy warning in a `#[test]` function and asserts it is still caught (verifying `--all-targets` includes test targets).
- [ ] Write a test with a feature-gated module containing a clippy warning, and assert `./do lint` catches it (verifying `--all-features`).

## 2. Task Implementation
- [ ] In the `./do` script's `lint` subcommand, add (after the `cargo fmt --check --all` step):
  ```sh
  cargo clippy --workspace --all-targets --all-features -- -D warnings
  ```
- [ ] Ensure the lint subcommand exits non-zero immediately if clippy exits non-zero.
- [ ] Verify the ordering is: (1) `cargo fmt --check --all`, (2) `cargo clippy ...`, with subsequent steps only running if prior steps pass.

## 3. Code Review
- [ ] Verify the exact clippy flags match the requirement: `--workspace --all-targets --all-features -- -D warnings`.
- [ ] Verify no extra flags are added that could weaken the lint (e.g., `--allow` flags).
- [ ] Verify the lint step ordering is correct (fmt check before clippy).

## 4. Run Automated Tests to Verify
- [ ] Run all tests from step 1 and confirm they pass.
- [ ] Run `./do lint` on the codebase and confirm clippy passes with exit code 0.

## 5. Update Documentation
- [ ] Add `// Covers: 2_TAS-REQ-012C` annotations to each test.

## 6. Automated Verification
- [ ] Run `./do lint` and capture exit code; assert 0.
- [ ] Introduce a temporary clippy violation, run `./do lint`, assert non-zero exit, then revert the violation.
