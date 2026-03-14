# Task: Verify Clean Documentation Generation (Sub-Epic: 074_Detailed Domain Specifications (Part 39))

## Covered Requirements
- [2_TAS-REQ-449]

## Dependencies
- depends_on: ["03_verify_clippy_cleanliness.md"]
- shared_components: [./do Entrypoint Script & CI Pipeline]

## 1. Initial Test Written
- [ ] Create a test case `test_cargo_doc_no_warnings` in `tests/lint_acceptance.rs`:
  - Use `std::process::Command` to run `cargo doc --no-deps --workspace`.
  - Capture stderr output.
  - Assert the command exits with code 0.
  - Assert that stderr does not contain any lines starting with `warning` or `error` (case-insensitive match on `warning[` and `error[` patterns that rustdoc emits).
  - Print the offending lines on failure for easy debugging.
- [ ] Add `// Covers: 2_TAS-REQ-449` annotation to the test.

## 2. Task Implementation
- [ ] Run `cargo doc --no-deps --workspace 2>&1` and inspect for any warning or error lines.
- [ ] Fix all documentation warnings. Common fixes include:
  - Adding missing doc comments (`//!` for modules, `///` for public items) to all public types, functions, and modules.
  - Fixing broken intra-doc links (`[`SomeType`]` references to types that don't exist or are not in scope).
  - Resolving any `#[warn(missing_docs)]` or `#[deny(missing_docs)]` violations.
- [ ] Ensure `./do lint` includes `cargo doc --no-deps --workspace` as step 3, with stderr piped through a filter that fails the step if any `warning` or `error` lines are detected.
- [ ] Verify `--no-deps` is used to avoid documenting external dependencies (which may have their own warnings).

## 3. Code Review
- [ ] Verify that `cargo doc` is invoked with `--no-deps` and `--workspace`.
- [ ] Confirm that the stderr filtering in `./do lint` correctly detects both `warning` and `error` patterns from rustdoc output.
- [ ] Check that all public items in all workspace crates have doc comments (this is a prerequisite for zero-warning doc generation when `missing_docs` is enforced).

## 4. Run Automated Tests to Verify
- [ ] Run `cargo doc --no-deps --workspace 2>&1 | grep -iE '^(warning|error)'` and confirm it produces no output.
- [ ] Run `cargo test --test lint_acceptance -- test_cargo_doc_no_warnings` and confirm it passes.

## 5. Update Documentation
- [ ] If a project-level status tracking document exists, mark [2_TAS-REQ-449] as verified.

## 6. Automated Verification
- [ ] Run `./do lint` and confirm the documentation step passes.
- [ ] Run `cargo test --test lint_acceptance -- test_cargo_doc_no_warnings` and assert exit code 0.
- [ ] Verify traceability: `grep '2_TAS-REQ-449' tests/lint_acceptance.rs` returns at least one match.
