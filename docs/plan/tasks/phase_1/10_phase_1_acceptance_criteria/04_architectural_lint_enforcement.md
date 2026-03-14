# Task: CLI Flag Constant and Permission Boundary Lint Rules (Sub-Epic: 10_Phase 1 Acceptance Criteria)

## Covered Requirements
- [AC-ROAD-P1-003], [AC-ROAD-P1-004]

## Dependencies
- depends_on: ["01_phase_0_dependency_verification.md"]
- shared_components: ["devs-adapters", "devs-checkpoint", "./do Entrypoint Script & CI Pipeline"]

## 1. Initial Test Written
- [ ] In `tests/lint/adapter_flag_literals.rs`, write test `test_inline_cli_flag_literal_in_adapter_fails_lint`: (1) create a temp file at a path that mimics `crates/devs-adapters/src/claude.rs` containing `.arg("-p")` (an inline flag literal not from `config.rs`), (2) run the lint check targeting this file, (3) assert non-zero exit, (4) assert output identifies the file and the offending literal. Annotate with `// Covers: AC-ROAD-P1-003`.
- [ ] Write `test_const_cli_flags_in_adapter_passes_lint` confirming current clean adapter source passes the lint.
- [ ] In `tests/lint/permission_boundary.rs`, write test `test_set_permissions_outside_boundary_fails_lint`: (1) create a temp Rust file outside `devs-checkpoint/src/permissions.rs` containing `fs::set_permissions(`, (2) run the lint check, (3) assert non-zero exit with error identifying the file. Annotate with `// Covers: AC-ROAD-P1-004`.
- [ ] Write `test_set_permissions_in_permissions_rs_passes_lint` confirming `devs-checkpoint/src/permissions.rs` is allowed.

## 2. Task Implementation
- [ ] Add a lint rule to `./do lint` that scans `crates/devs-adapters/src/**/*.rs` (excluding `config.rs`) for patterns matching `.arg("--` or `.arg("-` (regex: `\.arg\(\s*"--?[a-zA-Z]`). If found, emit file:line and exit non-zero.
- [ ] Add a lint rule to `./do lint` that scans all `crates/*/src/**/*.rs` for `fs::set_permissions` or `std::fs::set_permissions`. If found in any file other than `crates/devs-checkpoint/src/permissions.rs`, emit file:line and exit non-zero.
- [ ] Both rules should be implemented as shell `grep` commands or a dedicated Rust binary invoked from `./do lint`.

## 3. Code Review
- [ ] Verify CLI flag lint regex avoids false positives on string literals in test files, doc comments, or `config.rs` itself.
- [ ] Verify permission lint whitelists exactly `crates/devs-checkpoint/src/permissions.rs`, not any file named `permissions.rs`.
- [ ] Verify both rules are part of the `./do lint` pipeline.

## 4. Run Automated Tests to Verify
- [ ] Run adapter flag literal lint test and confirm pass.
- [ ] Run permission boundary lint test and confirm pass.
- [ ] Run `./do lint` on full workspace and confirm exit 0.

## 5. Update Documentation
- [ ] Add comments in `./do` explaining each lint rule's purpose.

## 6. Automated Verification
- [ ] Run `./do lint` and confirm exit code 0.
- [ ] Run `grep -r "AC-ROAD-P1-003\|AC-ROAD-P1-004" tests/` and confirm matches.
