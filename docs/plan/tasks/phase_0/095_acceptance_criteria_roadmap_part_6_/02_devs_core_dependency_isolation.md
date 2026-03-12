# Task: Core Architecture Verification - Dependency Isolation (Sub-Epic: 095_Acceptance Criteria & Roadmap (Part 6))

## Covered Requirements
- [AC-ROAD-P0-002]

## Dependencies
- depends_on: [none]
- shared_components: [devs-core]

## 1. Initial Test Written
- [ ] Create a shell script test `tests/scripts/verify_devs_core_dependencies.sh` that runs `cargo tree -p devs-core --edges normal`.
- [ ] The test must fail if the output of `cargo tree` contains any of: `tokio`, `git2`, `reqwest`, `tonic`.

## 2. Task Implementation
- [ ] Run `cargo tree -p devs-core --edges normal` and identify any violating dependencies.
- [ ] If violations are found, analyze the `devs-core/Cargo.toml` and remove or move those dependencies (e.g., move to dev-dependencies or extract into separate crates).
- [ ] Ensure `devs-core` remains buildable (`./do build`).
- [ ] Verify that no transitive dependencies are introducing the forbidden crates.

## 3. Code Review
- [ ] Confirm `devs-core` is a pure-logic crate with no I/O, networking, or runtime requirements.
- [ ] Verify that the dependency tree is minimal and only includes necessary crates for core domain types and logic.

## 4. Run Automated Tests to Verify
- [ ] Run the created script `tests/scripts/verify_devs_core_dependencies.sh`.
- [ ] Assert it exits with 0 and produces a clean report.

## 5. Update Documentation
- [ ] Update `devs-core/README.md` to explicitly state the policy of NO I/O dependencies for the core crate.
- [ ] Document the use of `cargo tree` as a verification tool in the CI/presubmit process.

## 6. Automated Verification
- [ ] Run `.tools/verify_requirements.py` to ensure AC-ROAD-P0-002 is correctly mapped to the verification script.
