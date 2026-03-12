# Task: Verify Core Crate Dependency Isolation (Sub-Epic: 070_Detailed Domain Specifications (Part 35))

## Covered Requirements
- [2_TAS-REQ-426]

## Dependencies
- depends_on: [none]
- shared_components: ["devs-core"]

## 1. Initial Test Written
- [ ] Add a temporary dependency on `tokio` to `devs-core/Cargo.toml`.
- [ ] Create a shell script (or use a python script if preferred) that runs `cargo tree -p devs-core --edges normal`.
- [ ] Verify that the script identifies `tokio` as a dependency and exits with a non-zero status.

## 2. Task Implementation
- [ ] Remove any I/O-related dependencies from `devs-core/Cargo.toml`, including `tokio`, `git2`, `reqwest`, and `tonic`.
- [ ] Implement a validation script (e.g., `.tools/verify_core_isolation.py`) that checks for prohibited dependencies in `devs-core`.
- [ ] Integrate this script into the `./do lint` workflow.
- [ ] Verify that `devs-core` only contains pure logic, domain types, and zero I/O crates.

## 3. Code Review
- [ ] Confirm that `devs-core` remains an I/O-free library crate, as this is foundational for its architectural role.
- [ ] Verify the dependency audit logic is robust and correctly identifies any violation.

## 4. Run Automated Tests to Verify
- [ ] Run the dependency validation script and confirm it passes when `devs-core` is clean.
- [ ] Run `./do lint` and ensure it includes the dependency check.

## 5. Update Documentation
- [ ] Add a comment in `devs-core/Cargo.toml` explaining the isolation requirement (2_TAS-REQ-426).

## 6. Automated Verification
- [ ] Run `cargo tree -p devs-core --edges normal | grep -E "tokio|git2|reqwest|tonic"` and confirm it produces zero matches.
