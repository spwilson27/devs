# Task: Linting & Formatting Policies (Sub-Epic: 01_dag_scheduling_engine)

## Covered Requirements
- [2_TAS-REQ-435], [2_TAS-REQ-436], [2_TAS-REQ-437], [2_TAS-REQ-438], [2_TAS-REQ-439]

## Dependencies
- depends_on: ["11_do_script_implementation.md", "17_traceability_and_coverage_infrastructure.md"]
- shared_components: [./do Entrypoint Script & CI Pipeline (owner — lint implementation), Traceability & Coverage Infrastructure (consumer — lint gate enforcement)]

## 1. Initial Test Written
- [ ] Create `tests/lint_policy_tests.rs` (integration tests).
- [ ] Write integration test `test_dependency_version_table_updated`: add a new crate dependency to a workspace member's `Cargo.toml`, run `./do lint`. Assert the lint passes only if the authoritative version table in `docs/plan/specs/2_tas.md` §2.2 is updated. Assert undocumented dependencies cause lint failure. Annotate `// Covers: 2_TAS-REQ-435`.
- [ ] Write integration test `test_clippy_pedantic_is_warn_not_deny`: create a test crate with code that triggers `clippy::pedantic` lints. Run `cargo clippy --workspace --all-targets -- -D warnings`. Assert it passes (pedantic is warn, not deny). Assert `clippy::all` lints are deny. Annotate `// Covers: 2_TAS-REQ-436`.
- [ ] Write integration test `test_deny_missing_docs_in_lib_and_main`: create a `lib.rs` without doc comments on public items. Run `cargo doc --no-deps --workspace`. Assert build fails with `missing_docs` error. Assert the `#![deny(missing_docs)]` is in workspace lint table, not per-crate. Annotate `// Covers: 2_TAS-REQ-437`.
- [ ] Write integration test `test_no_nightly_feature_gates`: grep all source files for `#![feature(`. Assert zero matches. Run `cargo build` with stable toolchain. Assert build succeeds without nightly features. Annotate `// Covers: 2_TAS-REQ-438`.
- [ ] Write integration test `test_cargo_fmt_check_is_blocking`: create a file with incorrect formatting (e.g., wrong indentation). Run `cargo fmt --check`. Assert exit non-zero. Assert `./do lint` fails on fmt check failure. Annotate `// Covers: 2_TAS-REQ-439`.
- [ ] Write integration test `test_clippy_suppressed_requires_reason`: add `#[allow(clippy::too_many_arguments)]` without adjacent `// REASON:` comment. Run `./do lint`. Assert lint fails. Add `// REASON: this is a test` comment. Assert lint passes. Annotate `// Covers: 2_TAS-REQ-439`.

## 2. Task Implementation
- [ ] Implement dependency version table check in `./do lint`:
  - Parse all `Cargo.toml` files in workspace.
  - Extract all `[dependencies]` entries.
  - Compare against authoritative version table in `docs/plan/specs/2_tas.md` §2.2.
  - Fail if any dependency is not documented in the table.
- [ ] Configure workspace-level clippy settings in `Cargo.toml` or `.cargo/config.toml`:
  - Set `clippy::all = "deny"`.
  - Set `clippy::pedantic = "warn"`.
  - Ensure these are workspace-wide, not per-crate.
- [ ] Configure workspace-level `missing_docs` lint:
  - Add `#![deny(missing_docs)]` to workspace lint table in `Cargo.toml`.
  - Ensure it applies to all `lib.rs` and `main.rs` files.
- [ ] Implement nightly feature gate check in `./do lint`:
  - Grep all `**/*.rs` files for `#![feature(`.
  - Fail if any matches found.
- [ ] Implement clippy suppression reason check in `./do lint`:
  - Grep for `#[allow(clippy::` patterns.
  - Check adjacent line (above or below) for `// REASON:` comment.
  - Fail if no reason found.
- [ ] Ensure `cargo fmt --check` is a blocking lint error in `./do lint`:
  - Run `cargo fmt --check --all`.
  - Exit non-zero if formatting check fails.
- [ ] Add `// Covers:` annotations for all covered requirements.

## 3. Code Review
- [ ] Verify dependency version check compares against authoritative table in 2_tas.md.
- [ ] Verify clippy pedantic is warn, not deny (allows iterative refinement).
- [ ] Verify missing_docs is workspace-level, not per-crate.
- [ ] Verify nightly feature gate check catches all `#![feature(...)]` patterns.
- [ ] Verify clippy suppression reason check requires adjacent comment.
- [ ] Verify fmt check failure is blocking (exit non-zero).

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test --test lint_policy_tests` and verify all tests pass.
- [ ] Run `./do lint` and verify all lint checks pass.
- [ ] Verify `cargo clippy --workspace --all-targets -- -D warnings` passes.
- [ ] Verify `cargo fmt --check --all` passes.
- [ ] Verify `cargo doc --no-deps --workspace` produces zero warnings.

## 5. Update Documentation
- [ ] Add documentation to `./do` script explaining lint policy checks.
- [ ] Document the authoritative version table location and update process.
- [ ] Document the clippy policy (pedantic = warn, all = deny).
- [ ] Document the missing_docs enforcement scope.
- [ ] Document the clippy suppression reason requirement.

## 6. Automated Verification
- [ ] Run `cargo test --test lint_policy_tests --format=json 2>&1 | grep '"passed"'` and confirm all tests passed.
- [ ] Verify `./do lint` exits 0 with all lint checks passing.
- [ ] Verify `./do presubmit` includes all lint policy checks.
- [ ] Run `cargo tarpaulin --test lint_policy_tests --out json` and verify ≥ 90% line coverage for lint policy code.
