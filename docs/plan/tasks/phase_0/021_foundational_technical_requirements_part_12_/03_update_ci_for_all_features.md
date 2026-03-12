# Task: Update CI Invocations for All Features (Sub-Epic: 021_Foundational Technical Requirements (Part 12))

## Covered Requirements
- [2_TAS-REQ-004F]

## Dependencies
- depends_on: [02_enforce_feature_flag_constraints.md]
- shared_components: [./do Entrypoint Script]

## 1. Initial Test Written
- [ ] Create a shell script `verify_ci_invocations.sh` that checks the contents of `.gitlab-ci.yml` and the `./do` script for the following:
    - All `cargo build` and `cargo test` calls use `--all-features`.
- [ ] Run this script and verify it fails if it finds a `cargo` command without `--all-features` in these files.

## 2. Task Implementation
- [ ] Update the `.gitlab-ci.yml` file to include `--all-features` for all build and test jobs.
- [ ] Update the `./do build` command to use `cargo build --workspace --release --all-features`.
- [ ] Update the `./do test` command to use `cargo test --workspace --all-features`.
- [ ] Update the `./do coverage` command to use `cargo-llvm-cov --workspace --all-features`.
- [ ] Ensure that no other script in the repository (e.g., in `.tools/`) executes `cargo` without this flag where it applies.

## 3. Code Review
- [ ] Verify that `--all-features` is applied consistently across all three CI platforms (Linux, macOS, Windows).
- [ ] Confirm that `presubmit` checks also use the `--all-features` flag through the `./do` script commands.
- [ ] Verify that there are no accidental "double" flags (e.g., `cargo test --all-features --features some-feature`).

## 4. Run Automated Tests to Verify
- [ ] Run `verify_ci_invocations.sh` and ensure it passes.
- [ ] Run `./do test` and `./do build` manually to verify the flags are correctly interpreted.

## 5. Update Documentation
- [ ] Update the developer documentation to state that all builds and tests must use `--all-features`.

## 6. Automated Verification
- [ ] Run `./do lint` and ensure it completes without errors.
- [ ] Execute `.tools/verify_requirements.py` to confirm coverage of [2_TAS-REQ-004F].
