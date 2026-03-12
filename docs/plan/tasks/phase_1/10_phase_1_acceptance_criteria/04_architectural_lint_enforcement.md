# Task: Architectural Lint Enforcement (Sub-Epic: 10_Phase 1 Acceptance Criteria)

## Covered Requirements
- [AC-ROAD-P1-003], [AC-ROAD-P1-004]

## Dependencies
- depends_on: [01_phase_0_dependency_verification.md]
- shared_components: [./do Entrypoint Script]

## 1. Initial Test Written
- [ ] Create a regression test script (e.g. `tests/verify_architectural_lints.sh`).
- [ ] The script must attempt to run `./do lint` on a codebase with a deliberate violation (e.g. an inline string literal for a CLI flag in an adapter, or an unauthorized `fs::set_permissions()` call).
- [ ] The test must assert that `./do lint` exits with a non-zero status and reports the violation.

## 2. Task Implementation
- [ ] Extend `./do lint` (or a python helper script called by it) to search for inline string literals in `devs-adapters/src/`.
- [ ] Implement a rule that CLI flags (e.g. `"--prompt"`) must be defined as `const &str` in `config.rs`.
- [ ] Extend `./do lint` to search for `fs::set_permissions()` or `std::fs::set_permissions()` calls across the entire workspace.
- [ ] Whitelist `devs-checkpoint/src/permissions.rs` (or `devs-checkpoint/src/lib.rs` if permissions are defined there) for these calls.
- [ ] Any other occurrence must cause a lint failure.

## 3. Code Review
- [ ] Confirm that all existing adapters use `const` flags from their respective `config.rs`.
- [ ] Verify that the `fs::set_permissions()` rule is correctly scoped to ignore the whitelist.

## 4. Run Automated Tests to Verify
- [ ] Run `./do lint` on the clean workspace and ensure it passes.
- [ ] Run the regression script: `bash tests/verify_architectural_lints.sh`.

## 5. Update Documentation
- [ ] Update the project's development standards guide (if one exists) with these architectural rules.
- [ ] Add comments to `devs-adapters` and `devs-checkpoint` explaining why these rules exist.

## 6. Automated Verification
- [ ] Run the traceability scanner and confirm `AC-ROAD-P1-003` and `AC-ROAD-P1-004` are mapped to these lint checks.
- [ ] Confirm that `target/traceability.json` lists these requirements as passing.
