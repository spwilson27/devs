# Task: Configure Workspace Dev-Dependencies (Sub-Epic: 002_Workspace Toolchain Extensions)

## Covered Requirements
- [2_TAS-REQ-007]

## Dependencies
- depends_on: [none]
- shared_components: [none]

## 1. Initial Test Written
- [ ] Create a `verify_dev_dependencies.py` script that parses all `Cargo.toml` files in the workspace.
- [ ] For each file, the script MUST ensure that if any crate from the authoritative list (cargo-llvm-cov, insta, mockall, bollard, wiremock, assert_cmd, predicates, tokio-test, rstest) is present, it MUST ONLY appear in `[dev-dependencies]` or `[workspace.dev-dependencies]`.
- [ ] The script should also verify that no crate in `[dependencies]` or `[workspace.dependencies]` matches any crate in the authoritative dev-dependency list.
- [ ] The script MUST exit with code 1 if any violation is found.

## 2. Task Implementation
- [ ] Open the root `Cargo.toml` file.
- [ ] Add the `[workspace.dev-dependencies]` section and populate it with the specified authoritative versions:
  | Crate | Version |
  |---|---|
  | `cargo-llvm-cov` | 0.6 |
  | `insta` | 1.40 |
  | `mockall` | 0.13 |
  | `bollard` | 0.17 |
  | `wiremock` | 0.6 |
  | `assert_cmd` | 2.0 |
  | `predicates` | 3.1 |
  | `tokio-test` | 0.4 |
  | `rstest` | 0.22 |
- [ ] Ensure these crates are NOT present in `[workspace.dependencies]`.
- [ ] Integrate the `verify_dev_dependencies.py` check into the `./do lint` command to permanently enforce this separation.

## 3. Code Review
- [ ] Verify that `Cargo.toml` correctly separates `[workspace.dependencies]` and `[workspace.dev-dependencies]`.
- [ ] Check for exact version matches as specified in [2_TAS-REQ-007].
- [ ] Confirm no workspace crate's individual `Cargo.toml` has elevated any of these to `[dependencies]`.

## 4. Run Automated Tests to Verify
- [ ] Run the `verify_dev_dependencies.py` script.
- [ ] Run `./do lint` and ensure it passes, including the new dev-dependency separation check.

## 5. Update Documentation
- [ ] Document the authoritative dev-dependency list in the project's internal developer guide.

## 6. Automated Verification
- [ ] Execute `cargo metadata --format-version 1` and verify that the specified crates appear only in dev-dependency graphs.
- [ ] Confirm `./do lint` output shows the new verification script succeeded.
