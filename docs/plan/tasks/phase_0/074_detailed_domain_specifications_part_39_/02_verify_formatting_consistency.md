# Task: Verify Repository Formatting Consistency (Sub-Epic: 074_Detailed Domain Specifications (Part 39))

## Covered Requirements
- [2_TAS-REQ-447]

## Dependencies
- depends_on: [01_verify_toolchain_and_multiplatform_build.md]
- shared_components: [./do Entrypoint Script & CI Pipeline]

## 1. Initial Test Written
- [ ] Create a test case `test_cargo_fmt_check_passes` in `tests/lint_acceptance.rs` (or a suitable existing test file):
  - Use `std::process::Command` to run `cargo fmt --check --all`.
  - Assert the command exits with code 0.
  - If it exits non-zero, capture and print stdout/stderr so the developer can see which files are unformatted.
- [ ] Optionally add a test `test_rustfmt_toml_exists_if_custom` that checks whether a `rustfmt.toml` exists at the workspace root (if custom formatting rules are expected). If no custom rules are required, skip this test.
- [ ] Add `// Covers: 2_TAS-REQ-447` annotation to the formatting test.

## 2. Task Implementation
- [ ] Run `cargo fmt --all` to auto-format the entire workspace.
- [ ] Commit the formatting changes (if any) so that `cargo fmt --check --all` exits 0 on the committed codebase.
- [ ] Ensure `./do lint` includes `cargo fmt --check --all` as its first step, and that a non-zero exit from `cargo fmt --check` causes `./do lint` to fail immediately.
- [ ] If a `rustfmt.toml` is present, verify it contains only stable options compatible with the pinned stable toolchain. Remove any nightly-only options.

## 3. Code Review
- [ ] Verify that `cargo fmt` is invoked with `--all` (not just the default crate) to cover the entire workspace.
- [ ] Verify that `--check` mode is used in CI/lint (not `--write`) so that unformatted code is detected, not silently fixed.
- [ ] Confirm that `./do lint` runs the format check before clippy to catch formatting issues early.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo fmt --check --all` and confirm exit code 0.
- [ ] Run `cargo test --test lint_acceptance -- test_cargo_fmt_check_passes` and confirm it passes.

## 5. Update Documentation
- [ ] If a project-level status tracking document exists, mark [2_TAS-REQ-447] as verified.

## 6. Automated Verification
- [ ] Run `./do lint` and confirm the formatting step passes.
- [ ] Run `cargo test --test lint_acceptance -- test_cargo_fmt_check_passes` and assert exit code 0.
- [ ] Verify traceability: `grep '2_TAS-REQ-447' tests/lint_acceptance.rs` returns at least one match.
