# Task: Implement ./do format and ./do lint Formatting Separation (Sub-Epic: 025_Foundational Technical Requirements (Part 16))

## Covered Requirements
- [2_TAS-REQ-012B]

## Dependencies
- depends_on: ["01_rustfmt_toml_configuration.md"]
- shared_components: ["./do Entrypoint Script & CI Pipeline"]

## 1. Initial Test Written
- [ ] Write a test that invokes `./do format` on a deliberately mis-formatted Rust source file and asserts the file is modified in-place to conform to `rustfmt.toml`.
- [ ] Write a test that invokes `./do lint` on a deliberately mis-formatted Rust source file and asserts:
  - The command exits with a non-zero exit code.
  - The source file is NOT modified (read the file before and after; contents must be identical).
- [ ] Write a test that invokes `./do format` followed by `./do lint` and asserts `./do lint` now exits 0, proving format fixes what lint checks.
- [ ] Write a test that confirms `./do format` internally runs `cargo fmt --all` (check stdout/stderr or use `--verbose` if available).
- [ ] Write a test that confirms `./do lint` includes `cargo fmt --check --all` as its first linting step.

## 2. Task Implementation
- [ ] In the `./do` script, implement the `format` subcommand:
  - Execute `cargo fmt --all`.
  - Exit with the exit code of `cargo fmt`.
- [ ] In the `./do` script, implement or update the `lint` subcommand to include `cargo fmt --check --all` as the first step.
  - If `cargo fmt --check --all` exits non-zero, `./do lint` must exit non-zero immediately (fail-fast).
- [ ] Ensure `./do format` and `./do lint` are clearly separate commands: `format` mutates files, `lint` only checks.

## 3. Code Review
- [ ] Verify `./do format` does NOT use `--check` flag (it must apply changes).
- [ ] Verify `./do lint` uses `--check` flag (it must NOT apply changes).
- [ ] Verify the two subcommands share no mutable side effects.

## 4. Run Automated Tests to Verify
- [ ] Run all tests from step 1 and confirm they pass.
- [ ] Run `./do format` then `./do lint` on the actual codebase and confirm both exit 0.

## 5. Update Documentation
- [ ] Add `// Covers: 2_TAS-REQ-012B` annotations to each test.

## 6. Automated Verification
- [ ] Run `./do presubmit` and confirm the format and lint steps both pass.
- [ ] Verify test output shows all format/lint separation tests passing.
